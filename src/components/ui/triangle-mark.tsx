import Image from "next/image";
import { cn } from "@/lib/utils";

export function TriangleMark({
  className,
  size = 14,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <Image
      src="/brand/triangle.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className={cn("inline-block shrink-0 object-contain", className)}
      style={{ width: size, height: size }}
    />
  );
}
