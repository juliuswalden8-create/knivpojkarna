export function VanIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 160" className={className} fill="none" aria-hidden="true">
      <path d="M28 108H248" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path
        d="M42 108V78c0-6 4-10 10-10h78c5 0 9 2 12 6l18 24h40c8 0 14 6 14 14v-6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M52 68h70" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M148 74h36l12 24H148V74Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="78" cy="112" r="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="78" cy="112" r="4" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="198" cy="112" r="12" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="198" cy="112" r="4" stroke="currentColor" strokeWidth="1.2" />
      <path d="M214 78h18c6 0 10 4 10 10v20" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M38 88h20M38 96h14" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function SharpenIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 160" className={className} fill="none" aria-hidden="true">
      <path d="M48 118H232" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M70 118c8-28 24-48 48-60" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="118" cy="58" rx="34" ry="14" stroke="currentColor" strokeWidth="1.4" />
      <path d="M96 58c6 6 14 10 22 10s16-4 22-10" stroke="currentColor" strokeWidth="1.2" />
      <path
        d="M150 92L236 48c4-2 8 1 7 5L198 118"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M150 92l12 8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M168 72l18-10M176 84l16-9" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.7" />
      <path d="M86 118v-10M118 118v-16M150 118v-8" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
    </svg>
  );
}

export function ParcelIllustration({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 280 160" className={className} fill="none" aria-hidden="true">
      <path d="M40 120H240" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <path d="M78 120V68h124v52" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M78 68l62-24 62 24" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M140 44v76" stroke="currentColor" strokeWidth="1.3" />
      <path d="M78 68h124" stroke="currentColor" strokeWidth="1.3" />
      <path d="M98 92h28M98 102h20" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M168 88l28-8 4 14-28 8-4-14Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M172 96l20-6" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      <path d="M206 72c8-2 16 2 14 10" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" opacity="0.65" />
    </svg>
  );
}
