"use client";

import type { ReactNode } from "react";
import { trackEvent } from "@/lib/analytics";

/** Client wrapper so WhatsApp clicks can be reported from server-rendered pages. */
export function WhatsAppLink({
  href,
  className,
  ariaLabel,
  location,
  projectName,
  children,
}: {
  href: string;
  className?: string;
  ariaLabel?: string;
  /** Where on the site the link was clicked, sent as `link_location`. */
  location: string;
  projectName?: string;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={ariaLabel}
      className={className}
      onClick={() =>
        trackEvent("whatsapp_click", {
          link_location: location,
          ...(projectName ? { project_name: projectName } : {}),
        })
      }
    >
      {children}
    </a>
  );
}
