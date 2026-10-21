import { cn } from "@/lib/utils";

/** A short blade edge and a quiet B. Not a weapon. */
export function BladeMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("block", className)} aria-hidden="true" focusable="false">
      <rect x="1" y="1" width="30" height="30" rx="8" fill="currentColor" fillOpacity="0.08" />
      <path
        d="M9 22.5 20.5 8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M14.2 16.2c1.5-2.2 3.4-3.2 5.3-3.2 2.3 0 3.7 1.2 3.7 3.1 0 1.7-1.2 2.8-3.2 2.8H16.8c2.2.2 3.6 1.3 3.6 3.1 0 2-1.5 3.2-3.9 3.2-2 0-3.8-1-5.1-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
    return <BladeMark className={cn("h-8 w-8", tone, className)} />;
  }

  if (resolved === "full") {
    return (
      <span className={cn("inline-flex flex-col items-start", tone, className)}>
        <span className="inline-flex items-center gap-2.5">
          <BladeMark className="h-9 w-9" />
          <span className="font-serif text-[1.65rem] leading-none tracking-[-0.03em]">BladeBud</span>
        </span>
        <span
          className={cn(
            "mt-3 font-sans text-[10px] font-medium uppercase tracking-[0.22em]",
            invert ? "text-soft/70" : "text-stone",
          )}
        >
          Sharp knives. Zero hassle.
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2", tone, className)}>
      <BladeMark className="h-7 w-7 shrink-0" />
      <span className="whitespace-nowrap font-serif text-[1.2rem] leading-none tracking-[-0.03em] sm:text-[1.35rem]">
        BladeBud
      </span>
    </span>
  );
}

export function WordmarkLockup({ className, invert = false }: { className?: string; invert?: boolean }) {
  return <Logo variant="full" invert={invert} className={className} />;
}
