# Google Analytics 4 — inteqrasiya hesabatı

Tarix: 25.08.2026
Status: kod tamamlandı, lint və typecheck keçdi. Commit / push / deploy edilməyib.

---

## 1. Qısa nəticə

Public sayta (AZ / EN / DE / RU) razılıqla idarə olunan GA4 inteqrasiyası əlavə edildi.

- Measurement ID yalnız `NEXT_PUBLIC_GA_MEASUREMENT_ID` mühit dəyişənindən oxunur.
- Sayt əvvəllər cookie razılığı idarəetməsinə malik deyildi, ona görə də sıfırdan lokallaşdırılmış banner yazıldı (AZ/EN/DE/RU, Qəbul / İmtina).
- `gtag.js` ziyarətçi **Qəbul edirəm** düyməsinə basmayınca ümumiyyətlə yüklənmir.
- `/admin` heç bir halda izlənmir.
- Dəyişən təyin olunmayıbsa nə skript, nə banner render olunur; sayt tam normal işləyir.

---

## 2. Memarlıq qərarları

### 2.1. Niyə `[locale]` layout-u seçildi

Repoda `/admin` marşrutu `[locale]`-in **daxilində deyil, qardaşıdır**:

```
src/app/layout.tsx          ← <html> + <body>
├── src/app/[locale]/...    ← public sayt
└── src/app/admin/...       ← admin (locale wrapper-siz)
```

Buna görə analitika `src/app/[locale]/layout.tsx` faylına mount edildi. Bu, tələb 2-ni (bir dəfə, bütün public dillər üçün) və tələb 5-i (`/admin` izlənmir) eyni anda, əlavə pathname yoxlaması olmadan təmin edir. Root layout-da yerləşdirsəydik, admin səhifələrini kodla istisna etmək lazım gələcəkdi.

### 2.2. Razılıq vəziyyətinin saxlanması

Seçim `localStorage`-də `ra-analytics-consent` açarında `granted` / `denied` kimi saxlanılır.

Vəziyyət `useSyncExternalStore` ilə oxunur (`src/lib/analytics-consent.ts`). Bunun səbəbi:

- SSR üçün ayrıca snapshot verilir (`null`), hydration uyğunsuzluğu yaranmır;
- effekt daxilində `setState` çağırılmır — layihədə əvvəl `react-hooks/set-state-in-effect` qaydası bu naxışı bloklamışdı;
- `storage` hadisəsi + öz `ra-analytics-consent-change` hadisəsi dinlənir, ona görə Qəbul düyməsinə basılan anda həm banner yox olur, həm skript qoşulur, həm də digər tablar sinxronlaşır.

`localStorage` girişi `try/catch` içindədir — Safari private rejimində sayt sınmır, sadəcə razılıq yadda qalmır.

### 2.3. Təkrarlanan page_view-un qarşısının alınması

Bu, ən diqqət tələb edən hissə idi.

`gtag('config', ID)` skript yüklənən anda cari səhifə üçün **avtomatik** bir `page_view` göndərir. Əgər klient tərəfi izləyicisi də ilk render-də `page_view` göndərsəydi, hər tam yükləmədə iki hit olardı.

Seçilmiş həll: `config` öz standart davranışında saxlanıldı (ilk baxışı o göndərir), `PageViewTracker` isə **yalnız sonrakı klient naviqasiyalarını** bildirir. İlk görülən yol `useRef`-ə yazılır və effekt yalnız açar dəyişəndə işə düşür:

```tsx
const currentKey = pageKey(pathname, searchParams.toString());
const reportedKey = useRef<string | null>(null);
if (reportedKey.current === null) reportedKey.current = currentKey;

useEffect(() => {
  if (reportedKey.current === currentKey) return;
  reportedKey.current = currentKey;
  trackPageView(currentKey);
}, [currentKey]);
```

Bu naxış eyni zamanda React Strict Mode-un effekti iki dəfə çağırmasına da davamlıdır — ikinci çağırışda açar dəyişmədiyi üçün hadisə göndərilmir.

Alternativ variant (`send_page_view: false` + hər dəfə əl ilə göndərmək) rədd edildi: `afterInteractive` skripti hydration effektindən **sonra** inject olunur, ona görə ilk effekt vaxtı `window.gtag` hələ mövcud olmur və ilk səhifə baxışı itərdi.

`useSearchParams` istifadə olunduğu üçün izləyici `<Suspense fallback={null}>` içinə alınıb.

---

## 3. Dəyişdirilmiş və yaradılmış fayllar

### Yeni fayllar

| Fayl | Təyinat |
| --- | --- |
| `src/lib/analytics.ts` | `GA_MEASUREMENT_ID` (env-dən), `trackEvent()`, `trackPageView()`, `window.gtag` tipi |
| `src/lib/analytics-consent.ts` | Razılıq store-u: oxuma, yazma, abunəlik, SSR snapshot |
| `src/components/analytics/site-analytics.tsx` | Razılıq vəziyyətinə görə banner və ya GA skriptini render edir |
| `src/components/analytics/google-analytics.tsx` | `gtag.js` skriptləri + `PageViewTracker` |
| `src/components/analytics/cookie-consent-banner.tsx` | Lokallaşdırılmış banner (Qəbul / İmtina) |
| `src/components/whatsapp-link.tsx` | Klient wrapper — server komponentlərdən WhatsApp klikini izləmək üçün |
| `.env.example` | Bütün mühit dəyişənlərinin şablonu (real açar yoxdur) |

### Dəyişdirilmiş fayllar

| Fayl | Dəyişiklik |
| --- | --- |
| `src/app/[locale]/layout.tsx` | `<SiteAnalytics />` mount edildi |
| `src/app/[locale]/layihelar/[slug]/page.tsx` | WhatsApp CTA `<a>` → `<WhatsAppLink>` |
| `src/components/whatsapp-float.tsx` | Üzən düymə `<a>` → `<WhatsAppLink>` |
| `src/components/inquiry-form.tsx` | Uğurlu göndərişdə `generate_lead` |
| `src/components/project-enquiry-modal.tsx` | Uğurlu göndərişdə `generate_lead` |
| `messages/az.json`, `en.json`, `de.json`, `ru.json` | `cookieConsent` bloku (title, description, accept, reject) |
| `SETUP.md` | `NEXT_PUBLIC_GA_MEASUREMENT_ID` + yeni «3.1. Google Analytics 4» bölməsi |

Mövcud heç bir funksionallıq dəyişdirilməyib. WhatsApp linklərinin `href`, `target`, `rel`, `className` və `aria-label` dəyərləri eynilə saxlanıldı — yalnız `onClick` izləmə əlavə olundu.

---

## 4. İzlənən hadisələr

| Hadisə | Nə vaxt | Parametrlər |
| --- | --- | --- |
| `page_view` | Klient tərəfi naviqasiya (ilk yükləmə `config` tərəfindən) | `page_path`, `page_location`, `page_title` |
| `generate_lead` | Əlaqə forması uğurla göndəriləndə | `method: "contact_form"`, `form_location: "contact_page"` |
| `generate_lead` | Layihə müraciət modalı uğurla göndəriləndə | `method: "project_enquiry_modal"`, `form_location: "project_detail"`, `project_name` |
| `whatsapp_click` | Üzən WhatsApp düyməsi | `link_location: "floating_button"` |
| `whatsapp_click` | Layihə detal səhifəsindəki WhatsApp CTA | `link_location: "project_detail"`, `project_name` |

`generate_lead` GA4-ün tövsiyə etdiyi standart hadisə adıdır, ona görə GA panelində konversiya kimi işarələmək asandır. Hadisələr yalnız server `ok` qaytardıqdan sonra göndərilir — uğursuz göndəriş konversiya sayılmır.

Bütün hadisələr `window.gtag?.(...)` üzərindən gedir: razılıq verilməyibsə və ya dəyişən yoxdursa, çağırış sadəcə heç nə etmir, xəta atmır.

---

## 5. Test nəticələri

### 5.1. Statik yoxlamalar

| Əmr | Nəticə |
| --- | --- |
| `npm run lint` | **Keçdi** — 0 error. 1 warning var: `src/lib/cms/public-lists.ts:16` `'sortRowsBySortOrder' is defined but never used`. Bu warning bu işdən **əvvəl də mövcud idi** və GA4 ilə əlaqəsi yoxdur. |
| `npx tsc --noEmit` | **Keçdi** — 0 error. |

### 5.2. Dev server üzərində HTTP yoxlamaları

Bu yoxlamalar kod yazıldıqdan sonra, lokal dev server üzərində icra olundu.

**A) `NEXT_PUBLIC_GA_MEASUREMENT_ID` təyin edilməyib:**

| Yoxlama | Nəticə |
| --- | --- |
| `GET /az` status | 200 |
| HTML-də `googletagmanager` | Yoxdur |
| Banner markup-u render olunub | Xeyr |

Yəni dəyişən olmadan sayt tam normal işləyir və heç bir analitika elementi görünmür (tələb 7).

**B) `NEXT_PUBLIC_GA_MEASUREMENT_ID=G-TESTLOCAL01` (müvəqqəti test dəyəri):**

| Marşrut | Status | Banner render | `googletagmanager` skripti |
| --- | --- | --- | --- |
| `/az` | 200 | Bəli | Yoxdur |
| `/en` | 200 | Bəli | Yoxdur |
| `/de` | 200 | Bəli | Yoxdur |
| `/ru` | 200 | Bəli | Yoxdur |
| `/admin/login` | 200 | Xeyr | Yoxdur |

Nəticə: banner dörd public dildə də çıxır, razılıqdan əvvəl GA skripti **ümumiyyətlə yüklənmir**, `/admin` isə tamamilə kənardadır (tələb 5 və 6).

Test dəyəri yalnız shell mühitində verildi; repoda və `.env.local`-da real və ya test Measurement ID saxlanılmayıb.

### 5.3. İcra edilməyən yoxlamalar

İstifadəçi göstərişi ilə brauzer testləri dayandırıldı. Aşağıdakılar **kod səviyyəsində düzgündür, lakin işlək brauzerdə təsdiqlənməyib**:

- Qəbul düyməsinə basdıqdan sonra `gtag.js`-in real yüklənməsi və `dataLayer`-in dolması;
- klient naviqasiyasında dəqiq bir (təkrarsız) `page_view` göndərilməsi;
- `generate_lead` və `whatsapp_click` hadisələrinin GA DebugView-də görünməsi;
- İmtina yolundan sonra skriptin yüklənməməsi;
- bannerin vizual görünüşü və mobil layout-da başqa elementləri örtməməsi.

Deploy-dan əvvəl bunları GA **DebugView** və ya brauzer Network panelində yoxlamaq tövsiyə olunur.

`npm run build` da bu mərhələdə icra edilmədi (göstərişə görə yalnız lint və typecheck işlədildi).

---

## 6. Təhlükəsizlik və məxfilik

- Repoda heç bir real Measurement ID yoxdur. `.env.example` və `SETUP.md` yalnız dəyişənin **adını** və formatını (`G-XXXXXXXXXX`) göstərir.
- Razılıqdan əvvəl Google-a heç bir sorğu getmir — skript DOM-a ümumiyyətlə əlavə olunmur. Bu, sadəcə Consent Mode ilə «denied» siqnalı göndərməkdən daha ciddi yanaşmadır.
- İmtina seçimi də yadda saxlanılır, ona görə banner hər səhifədə təkrar çıxmır.
- Admin panel `robots: { index: false }` ilə yanaşı indi analitikadan da tam kənardadır.

---

## 7. Deploy-dan sonra ediləcəklər

1. Vercel-də `NEXT_PUBLIC_GA_MEASUREMENT_ID` dəyərinin Production (lazım olsa Preview) üçün təyin olunduğunu təsdiqləyin. Bu dəyişən `NEXT_PUBLIC_` prefiksli olduğu üçün **build zamanı** bundle-a yazılır — dəyəri dəyişdikdən sonra yenidən deploy etmək lazımdır.
2. GA4 panelində `generate_lead` və `whatsapp_click` hadisələrini **konversiya (key event)** kimi işarələyin.
3. DebugView-də bir səhifədən digərinə keçid edərək `page_view` sayının hər keçiddə yalnız bir artdığını təsdiqləyin.
