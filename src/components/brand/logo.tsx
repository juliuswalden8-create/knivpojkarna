import { cn } from "@/lib/utils";

/** Original KNIVPOJKARNA mark: horizontal chef’s knife, handle left, two rivets. */
export function KnifeMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 48"
      className={cn("block", className)}
      aria-hidden="true"
      focusable="false"
    >
      {/* Blade */}
      <path
        fill="currentColor"
        d="M84 16.5h74c8.2.3 15.6 3.4 23.2 9.5-7.8 6.6-15.4 9.8-24 10.2H84z"
      />
      {/* Bolster */}
      <rect x="71.5" y="14.2" width="13.2" height="21.6" rx="1.2" fill="currentColor" />
      {/* Handle outline */}
      <path
        d="M71.5 17.4H26.5c-8.4 0-13.2 3.4-13.2 8.6s4.8 8.6 13.2 8.6h45"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M71.5 17.4v15.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Rivets */}
      <circle cx="33.5" cy="26" r="2.05" fill="currentColor" />
      <circle cx="52.5" cy="26" r="2.05" fill="currentColor" />
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
    return <KnifeMark className={cn("h-5 w-auto", tone, className)} />;
  }

  if (resolved === "full") {
    return (
      <span className={cn("inline-flex flex-col items-start", tone, className)}>
        <KnifeMark className="h-7 w-auto sm:h-8" />
        <span className="mt-2.5 font-serif text-[1.2rem] leading-none tracking-[0.08em] sm:text-[1.3rem]">
          KNIVPOJKARNA
        </span>
        <span
          className={cn(
            "mt-2 flex items-center gap-2.5 font-sans text-[9px] font-medium uppercase tracking-[0.28em]",
            invert ? "text-soft/70" : "text-stone",
          )}
        >
          <span className="h-px w-7 bg-current opacity-55" aria-hidden />
          Knivslipning
          <span className="h-px w-7 bg-current opacity-55" aria-hidden />
        </span>
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center gap-2.5 sm:gap-3", tone, className)}>
      <KnifeMark className="h-[15px] w-auto shrink-0 sm:h-[17px]" />
      <span className="whitespace-nowrap font-serif text-[1.05rem] leading-none tracking-[0.06em] sm:text-[1.15rem]">
        KNIVPOJKARNA
      </span>
    </span>
  );
}

export function WordmarkLockup({ className, invert = false }: { className?: string; invert?: boolean }) {
  return <Logo variant="full" invert={invert} className={className} />;
}
