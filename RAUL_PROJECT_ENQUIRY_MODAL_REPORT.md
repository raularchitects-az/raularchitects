# Project Enquiry Modal

The “Layihə üçün müraciət” button on every project detail page now opens the existing contact form in a centered modal instead of navigating to the contact page. No second email system was created — the modal posts through the same `submitInquiryForm` server action and the same Resend sender that the contact page already uses.

---

## 1. Changed files

### `src/components/project-enquiry-modal.tsx` (new)
Client component that renders both the trigger button and the modal.

- The trigger keeps the exact classes the previous `<Link>` had, so the button in screenshot 2 is visually unchanged. Only the element changed from a link to a `<button type="button">` and the action from navigation to opening the modal.
- The form markup and classes are copied from `InquiryForm`, so the panel matches screenshot 1: title, three uppercase-tracked labels, and the charcoal submit button with the send icon.
- Rendered through `createPortal` into `document.body`, so the overlay (`z-[100]`) sits above the fixed navbar (`z-50`) regardless of where the trigger sits in the tree.
- Message field is prefilled with the localized project name and the live page URL, followed by a blank line for the visitor's own text.
- Two hidden fields, `project` and `pageUrl`, travel with the submission so the enquiry is identified even if the visitor deletes the prefilled lines.

### `src/lib/inquiry-actions.ts`
- Reads the optional `project` and `pageUrl` fields and forwards them to the mailer.
- The failure result now carries a stable `code` (`required`, `email`, `send`) alongside the existing `error` string. The modal renders localized copy from the code; the contact page keeps reading `error`, so its behaviour is untouched.

### `src/lib/send-inquiry-email.ts`
- `InquiryPayload` accepts optional `project` and `pageUrl`.
- When a project is present the subject becomes `Layihə müraciəti: <project> — <name>` instead of `Müraciət formu: <name>`, and the body gains `Layihə:` and `Səhifə:` lines above the message. Contact-page emails are byte-identical to before because both fields are undefined there.

### `src/app/[locale]/layihelar/[slug]/page.tsx`
- The `<Link href="/elaqe">` CTA was replaced with `<ProjectEnquiryModal projectName={title} projectUrl={canonical} />`.
- Dropped the now-unused `ArrowRight` import (the icon moved into the modal component).
- The WhatsApp button, the surrounding section and every other part of the page are unchanged.

### `messages/az.json`, `en.json`, `de.json`, `ru.json`
Added a `projectDetail.enquiry` block per locale: `title`, `name`, `email`, `message`, `submit`, `sending`, `success`, `close`, `projectLine`, `pageLine` and `errors.{required,email,send}`. Label wording matches the existing `contactPage.form` strings so the two forms read identically. No existing key was modified.

---

## 2. Modal behaviour

| Requirement | Implementation |
| --- | --- |
| Centered popup, stays on page | `fixed inset-0 flex items-center justify-center` overlay; no navigation |
| Close button top-right | Absolutely positioned `X` button with a localized `aria-label` |
| Escape closes | `keydown` listener on `document` |
| Backdrop click closes | `onMouseDown` on the overlay, ignored when the event came from inside the panel |
| Focus stays inside | Tab/Shift+Tab cycle through the visible focusables in the panel; first field is focused on open and focus returns to the trigger on close |
| No background scroll | `document.body.style.overflow = "hidden"`, restored on cleanup with the previous value |
| Responsive | `max-w-lg` with `p-4 sm:p-6` gutters, `max-h-[85vh]` scrollable form, `p-6 sm:p-10` padding |
| Accessible | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing at the heading |

---

## 3. Test results

All four locales were exercised through the real UI on the Space Port Helgoland page: clicking the button, filling the form and submitting through the live server action and Resend.

| Locale | URL | Modal title | Submit result |
| --- | --- | --- | --- |
| AZ | `/az/layihelar/space-port-helgoland` | Müraciət formu | SUCCESS — “Təşəkkürlər! Tezliklə sizinlə əlaqə saxlayacağıq.” |
| EN | `/en/projects/space-port-helgoland` | Inquiry form | SUCCESS — “Thank you! We will get back to you shortly.” |
| DE | `/de/layihelar/space-port-helgoland` | Anfrageformular | SUCCESS — “Vielen Dank! Wir melden uns in Kürze bei Ihnen.” |
| RU | `/ru/layihelar/space-port-helgoland` | Форма заявки | SUCCESS — “Спасибо! Мы скоро свяжемся с вами.” |

Four test emails were sent to the configured recipient, each with `Test Elnar (<locale>)` as the sender name and a `TEST <locale> - modal enquiry flow check.` line in the body.

### Prefill per locale

The project name is taken from the CMS, so it arrives already translated:

```
AZ  Layihə: Space Port Helgoland
    Səhifə: http://localhost:3000/az/layihelar/space-port-helgoland

EN  Project: Space Port Helgoland
    Page: http://localhost:3000/en/projects/space-port-helgoland

DE  Projekt: Raumhafen Helgoland
    Seite: http://localhost:3000/de/layihelar/space-port-helgoland

RU  Проект: Космический порт Гельголанд
    Страница: http://localhost:3000/ru/layihelar/space-port-helgoland
```

### Localized labels

| Locale | Name | Email | Message |
| --- | --- | --- | --- |
| AZ | Ad, Soyad | E-poçt ünvanı | Layihəniz haqqında qısa məlumat |
| EN | Full name | Email address | Brief description of your project |
| DE | Vor- und Nachname | E-Mail-Adresse | Kurzbeschreibung Ihres Projekts |
| RU | Имя, фамилия | Электронная почта | Кратко о вашем проекте |

### Validation

Server-side validation was forced by disabling native validation and submitting on the EN page:

- empty fields → “Please fill in all fields.”
- `not-an-email` → “This email address is not valid.”

Both come from the new `errors.*` keys, so they follow the active locale.

### Behaviour checks

Measured in the browser on the AZ page:

```
open        → dialog present, aria-modal="true", body overflow "hidden", focus on close button
Escape      → dialog removed, overflow restored, focus back on the trigger button
backdrop    → dialog removed, overflow restored
focusables  → close button, name, email, message, submit (5 items, trap cycles within them)
mobile 390×780 → panel 358px wide at left 16px, no horizontal overflow, all fields reachable
```

No console errors on a fresh page load or on opening the modal.

### Unaffected pages

`/az/elaqe` and `/en/contact` both still return 200 and use the unchanged `InquiryForm`. The WhatsApp button, URLs, CMS data and SEO metadata were not touched.

---

## 4. Checks

| Check | Result |
| --- | --- |
| `npx tsc --noEmit` | pass |
| `npm run lint` | pass (1 pre-existing warning: unused `sortRowsBySortOrder` in `src/lib/cms/public-lists.ts`) |
| `npm run build` | pass — 348 static pages, route set unchanged |

An earlier lint run flagged `react-hooks/set-state-in-effect` for a `mounted` guard around the portal. The guard was unnecessary — `open` can only become true from a click, so the portal never runs during SSR — and removing it cleared the error.

Nothing was committed, pushed or deployed.

---

## 5. Notes

**The prefilled URL uses the live address.** The component receives the canonical URL from the server as an SSR fallback, then replaces it with `window.location.href` when the modal opens, so the visitor's actual address (including locale prefix) is what reaches the inbox.

**Project name follows the CMS.** Because `projectName` is the already-localized `title`, a DE enquiry reads `Projekt: Raumhafen Helgoland`. If you would rather always see the Azerbaijani name in the inbox, the page can pass the AZ title instead — say the word and it is a one-line change.

**Portfolio detail pages still link to the contact page.** The brief covered project detail pages only, so the portfolio CTA was left as it was.
