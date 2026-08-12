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
    <Image
      src="/brand/logo-full-transparent.png"
      alt="Raul Architects"
      width={340}
      height={110}
      priority
      className={cn(
        "h-9 w-auto object-contain sm:h-10",
        tone === "light" && "brightness-0 invert",
        className,
      )}
    />
  );
}
