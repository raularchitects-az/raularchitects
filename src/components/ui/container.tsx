import { cn } from "@/lib/utils";
import { PUBLIC_WIDE_CONTAINER, PUBLIC_WIDE_PADDING } from "@/lib/public-widescreen-layout";

export function Container({
  className,
  wide = false,
  children,
}: {
  className?: string;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto w-full max-w-7xl px-6 lg:px-10",
        wide && PUBLIC_WIDE_CONTAINER,
        wide && PUBLIC_WIDE_PADDING,
        className,
      )}
    >
      {children}
    </div>
  );
}
