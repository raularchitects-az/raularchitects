import { cn } from "@/lib/utils";

export function CornerFrame({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  const color = tone === "light" ? "border-bronze-light/70" : "border-bronze-dark/60";

  return (
    <div className={cn("pointer-events-none absolute inset-3 sm:inset-4", className)} aria-hidden="true">
      <span className={cn("absolute left-0 top-0 h-4 w-4 border-l border-t sm:h-5 sm:w-5", color)} />
      <span className={cn("absolute right-0 top-0 h-4 w-4 border-r border-t sm:h-5 sm:w-5", color)} />
      <span className={cn("absolute bottom-0 left-0 h-4 w-4 border-b border-l sm:h-5 sm:w-5", color)} />
      <span className={cn("absolute bottom-0 right-0 h-4 w-4 border-b border-r sm:h-5 sm:w-5", color)} />
    </div>
  );
}
