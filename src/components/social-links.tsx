import { Instagram, Linkedin } from "lucide-react";

export const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/raularchitects/",
    label: "Raul Architects Instagram",
    name: "Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.linkedin.com/company/raularchitects/",
    label: "Raul Architects LinkedIn",
    name: "LinkedIn",
    Icon: Linkedin,
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
          <Icon className="h-[18px] w-[18px] shrink-0 text-bronze-dark" strokeWidth={1.5} />
          <span className="text-[11px] font-medium uppercase tracking-[0.16em]">{name}</span>
        </a>
      ))}
    </div>
  );
}
