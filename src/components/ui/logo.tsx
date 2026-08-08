import { cn } from "@/lib/utils";

export function Logo({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center border font-serif text-base tracking-tight",
          tone === "dark"
            ? "border-charcoal/20 text-charcoal"
            : "border-cream/30 text-cream",
        )}
      >
        RA
      </span>
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            "font-serif text-base font-medium tracking-[0.18em]",
            tone === "dark" ? "text-charcoal" : "text-cream",
          )}
        >
          RAUL ARCHITECTS
        </span>
        <span
          className={cn(
            "text-[10px] font-medium uppercase tracking-[0.32em]",
            tone === "dark" ? "text-bronze-dark" : "text-bronze-light",
          )}
        >
          Studio
        </span>
      </span>
    </div>
  );
}
