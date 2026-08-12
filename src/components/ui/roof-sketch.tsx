import { cn } from "@/lib/utils";

export function RoofSketch({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 420"
      fill="none"
      aria-hidden="true"
      className={cn("text-bronze-dark", className)}
    >
      {/* Outer roof peak */}
      <path d="M40 300 L240 48 L440 300" stroke="currentColor" strokeWidth="2.2" />
      {/* Inner roof peak */}
      <path d="M90 300 L240 110 L390 300" stroke="currentColor" strokeWidth="1.8" />
      {/* Ridge beam */}
      <path d="M240 48 L240 300" stroke="currentColor" strokeWidth="1.6" />
      {/* Base plate */}
      <path d="M40 300 L440 300" stroke="currentColor" strokeWidth="2" />
      {/* Left rafters */}
      <path d="M40 300 L150 170" stroke="currentColor" strokeWidth="1.4" />
      <path d="M90 300 L195 140" stroke="currentColor" strokeWidth="1.4" />
      <path d="M140 300 L220 120" stroke="currentColor" strokeWidth="1.3" />
      {/* Right rafters */}
      <path d="M440 300 L330 170" stroke="currentColor" strokeWidth="1.4" />
      <path d="M390 300 L285 140" stroke="currentColor" strokeWidth="1.4" />
      <path d="M340 300 L260 120" stroke="currentColor" strokeWidth="1.3" />
      {/* Cross bracing */}
      <path d="M150 170 L330 170" stroke="currentColor" strokeWidth="1.2" />
      <path d="M195 140 L285 140" stroke="currentColor" strokeWidth="1.2" />
      <path d="M150 170 L285 140" stroke="currentColor" strokeWidth="1" strokeDasharray="5 4" />
      <path d="M330 170 L195 140" stroke="currentColor" strokeWidth="1" strokeDasharray="5 4" />
      {/* Vertical posts */}
      <path d="M140 300 L140 220" stroke="currentColor" strokeWidth="1.3" />
      <path d="M340 300 L340 220" stroke="currentColor" strokeWidth="1.3" />
      {/* Joint markers */}
      <circle cx="240" cy="48" r="3.5" fill="currentColor" />
      <circle cx="40" cy="300" r="3.5" fill="currentColor" />
      <circle cx="440" cy="300" r="3.5" fill="currentColor" />
      <circle cx="150" cy="170" r="2.5" fill="currentColor" />
      <circle cx="330" cy="170" r="2.5" fill="currentColor" />
    </svg>
  );
}
