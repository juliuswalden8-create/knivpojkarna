import Image from "next/image";
import { cn } from "@/lib/utils";

export function EditorialPhoto({
  src,
  alt,
  caption,
  className,
  imageClassName,
  priority = false,
  sizes = "(min-width: 1024px) 55vw, 100vw",
}: {
  src: string;
  alt: string;
  caption?: string;
  className?: string;
  imageClassName?: string;
  priority?: boolean;
  sizes?: string;
}) {
  return (
    <figure>
      <div className={cn("relative overflow-hidden bg-offwhite-200", className)}>
        <Image src={src} alt={alt} fill className={cn("object-cover", imageClassName)} sizes={sizes} priority={priority} />
      </div>
      {caption && <figcaption className="mt-3 text-[11px] leading-relaxed tracking-[0.04em] text-stone">{caption}</figcaption>}
    </figure>
  );
}

export function PhotoWell({
  label,
  className,
}: {
  label: string;
  className?: string;
}) {
  return (
    <figure className={cn("relative flex min-h-[320px] items-end border border-line bg-[#e8e2d6]", className)}>
      <figcaption className="relative max-w-sm p-6 text-[13px] leading-relaxed text-stone">{label}</figcaption>
    </figure>
  );
}
