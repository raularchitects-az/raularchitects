import { Instagram, Linkedin } from "lucide-react";

export const SOCIAL_LINKS = [
  {
    href: "https://www.instagram.com/raularchitects/",
    label: "Raul Architects Instagram",
    Icon: Instagram,
  },
  {
    href: "https://www.linkedin.com/company/raularchitects/",
    label: "Raul Architects LinkedIn",
    Icon: Linkedin,
  },
] as const;

export function SocialLinks({ className = "" }: { className?: string }) {
  return (
    <div className={`flex items-center gap-1 ${className}`.trim()}>
      {SOCIAL_LINKS.map(({ href, label, Icon }) => (
        <a
          key={href}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="inline-flex h-10 w-10 items-center justify-center text-charcoal/55 transition-colors duration-300 hover:text-bronze-dark"
        >
          <Icon className="h-4 w-4" strokeWidth={1.5} />
        </a>
      ))}
    </div>
  );
}
