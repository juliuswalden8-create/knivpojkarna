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
    <div className="shrink-0 border-t border-line bg-ivory">
      <div className="container-x flex justify-end py-3">
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={aria}
          className="inline-flex min-h-11 max-w-full items-center justify-center border border-line bg-soft px-4 py-2 text-center text-[13px] leading-snug text-ink hover:border-ink"
        >
          {label}
        </a>
      </div>
    </div>
  );
}
