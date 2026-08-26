"use client";

import { useLocale } from "next-intl";
import { asLocale } from "@/i18n/routing";

function isUnmodifiedPrimaryClick(event: React.MouseEvent<HTMLAnchorElement>) {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

/** Full document load to the localized homepage — `/az`, `/en`, `/de`, `/ru`. */
export function LogoHomeLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const href = `/${asLocale(useLocale())}`;

  return (
    <a
      href={href}
      className={className}
      onClick={(event) => {
        if (!isUnmodifiedPrimaryClick(event)) return;
        event.preventDefault();
        if ("scrollRestoration" in history) {
          history.scrollRestoration = "manual";
        }
        const atHome = window.location.pathname.replace(/\/$/, "") === href;
        if (atHome) {
          window.location.reload();
          return;
        }
        window.location.href = new URL(href, window.location.origin).href;
      }}
    >
      {children}
    </a>
  );
}
