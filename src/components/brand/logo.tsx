import Image from "next/image";
import { cn } from "@/lib/utils";

const MARK = "/brand/bladebud-mark.png";
const WORDMARK = "/brand/bladebud-logo.png";

/** Crossed-knives artwork. The file is wider than it is tall. */
function CrossedKnives({
  className,
  alt,
  priority = false,
}: {
  className?: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <Image
      src={MARK}
      alt={alt}
      width={480}
      height={352}
      priority={priority}
      className={cn("h-9 w-auto", className)}
    />
  );
}

export function Logo({
  className,
  invert = false,
  compact = false,
  variant,
}: {
  className?: string;
  invert?: boolean;
  compact?: boolean;
  variant?: "header" | "full" | "mark";
}) {
  const resolved = variant ?? (compact ? "mark" : "header");
  const tone = invert ? "text-soft" : "text-ink";

  if (resolved === "mark") {
    return <CrossedKnives alt="BladeBud" className={cn("h-8", className)} />;
  }

  if (resolved === "full") {
    return (
      <Image
        src={WORDMARK}
        alt="BladeBud"
        width={640}
        height={550}
        className={cn("h-auto w-44 max-w-full", className)}
      />
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", tone, className)}>
      <CrossedKnives alt="" priority className="h-9 shrink-0" />
      <span className="whitespace-nowrap font-serif text-[1.2rem] leading-none tracking-[-0.03em] sm:text-[1.35rem]">
        BladeBud
      </span>
    </span>
  );
}

export function WordmarkLockup({ className, invert = false }: { className?: string; invert?: boolean }) {
  return <Logo variant="full" invert={invert} className={className} />;
}
