import Image from "next/image";
import { cn } from "@/lib/utils";

export function Logo({
  tone = "dark",
  className,
}: {
  tone?: "dark" | "light";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col leading-none", className)}>
      <span className="flex items-center gap-1.5">
        <span
          className={cn(
            "font-sans text-xl font-bold uppercase tracking-tight sm:text-2xl",
            tone === "dark" ? "text-gray-700" : "text-cream",
          )}
        >
          Raul
        </span>
        <Image
          src="/brand/triangle.png"
          alt=""
          width={22}
          height={22}
          className="mb-1 h-[0.7em] w-[0.7em] shrink-0 self-end object-contain"
        />
      </span>
      <span
        className={cn(
          "text-[10px] font-medium uppercase tracking-[0.42em] sm:text-[11px]",
          tone === "dark" ? "text-gray-500" : "text-cream/70",
        )}
      >
        Architects
      </span>
    </div>
  );
}
