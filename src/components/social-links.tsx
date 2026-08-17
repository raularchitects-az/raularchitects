/** Inline SVGs — lucide-react 1.x has no Instagram/Linkedin exports. */
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3.5" y="3.5" width="17" height="17" rx="4.5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.35" cy="6.65" r="0.85" fill="currentColor" stroke="none" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-[18px] w-[18px] shrink-0" fill="currentColor">
      <path d="M6.54 8.68H3.56V20.5h2.98V8.68ZM5.05 3.5a1.74 1.74 0 1 0 0 3.48 1.74 1.74 0 0 0 0-3.48ZM20.5 20.5h-2.97v-6.37c0-1.52-.03-3.47-2.12-3.47-2.12 0-2.44 1.65-2.44 3.36V20.5H10v-11.8h2.85v1.61h.04c.4-.75 1.37-1.54 2.82-1.54 3.01 0 3.79 1.98 3.79 4.56V20.5Z" />
    </svg>
  );
}

export const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/raularchitects/",
    label: "Raul Architects Instagram",
    name: "Instagram",
    Icon: InstagramIcon,
  },
  {
    href: "https://www.linkedin.com/company/raularchitects/",
    label: "Raul Architects LinkedIn",
    name: "LinkedIn",
    Icon: LinkedInIcon,
  },
] as const;

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-6 gap-y-2 ${className}`.trim()}>
      {SOCIAL_LINKS.map(({ href, label, name, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="group inline-flex items-center gap-2 text-charcoal/70 transition-colors duration-300 hover:text-bronze-dark"
        >
          <span className="text-bronze-dark">
            <Icon />
          </span>
          <span className="text-[11px] font-medium uppercase tracking-[0.16em]">{name}</span>
        </a>
      ))}
    </div>
  );
}
