import { cn } from "@/lib/utils";
import { TriangleMark } from "@/components/ui/triangle-mark";

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "dark",
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "center" && "items-center text-center",
        className,
      )}
    >
      {eyebrow ? (
        <span
          className={cn(
            "inline-flex items-center gap-3 text-xs font-medium uppercase tracking-[0.28em]",
            tone === "dark" ? "text-bronze-dark" : "text-bronze-light",
          )}
        >
          <TriangleMark size={9} />
          {eyebrow}
        </span>
      ) : null}
      <h2
        className={cn(
          "font-serif text-3xl leading-[1.15] tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]",
          tone === "dark" ? "text-charcoal" : "text-cream",
        )}
      >
        {title}
      </h2>
      {description ? (
        <p
          className={cn(
            "max-w-2xl text-base leading-relaxed sm:text-lg",
            tone === "dark" ? "text-charcoal/70" : "text-cream/70",
            align === "center" && "mx-auto",
          )}
        >
          {description}
        </p>
      ) : null}
    </div>
  );
}
