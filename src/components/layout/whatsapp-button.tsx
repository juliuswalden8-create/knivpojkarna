import { whatsappLink } from "@/lib/site";

export function WhatsAppButton({
  number,
  message,
  label,
  aria,
}: {
  number: string;
  message: string;
  label: string;
  aria: string;
}) {
  const href = whatsappLink(number, message);
  if (!href) return null;

  return (
    <div className="shrink-0 border-t border-line bg-ivory pb-[env(safe-area-inset-bottom)]">
      <div className="container-x flex justify-end py-1.5 lg:py-3">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={aria}
          className="inline-flex min-h-9 max-w-full items-center justify-center border border-line bg-soft px-3 py-1 text-center text-[12px] leading-snug text-ink hover:border-ink lg:min-h-11 lg:px-4 lg:py-2 lg:text-[13px]"
        >
          <span className="lg:hidden">WhatsApp</span>
          <span className="hidden lg:inline">{label}</span>
        </a>
      </div>
    </div>
  );
}
