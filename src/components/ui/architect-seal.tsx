import { cn } from "@/lib/utils";

export function ArchitectSeal({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-24 w-24 sm:h-28 sm:w-28", className)} aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slow text-cream/70">
        <defs>
          <path id="seal-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <circle cx="50" cy="50" r="48" fill="none" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        <text fontSize="6.4" letterSpacing="2.5" fill="currentColor">
          <textPath href="#seal-circle" startOffset="0%">
            RAUL ARCHITECTS · EST. STUDIO · BIM EXPERT ·
          </textPath>
        </text>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-serif text-lg text-cream sm:text-xl">RA</span>
      </div>
    </div>
  );
}
