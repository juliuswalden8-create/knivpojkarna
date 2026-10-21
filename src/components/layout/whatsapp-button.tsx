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
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={aria}
      className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-40 inline-flex max-w-[16rem] items-center justify-center border border-line bg-ivory px-3 py-2 text-center text-[12px] leading-snug text-ink shadow-[0_8px_24px_rgba(23,42,36,0.14)] hover:border-ink lg:max-w-xs lg:px-4 lg:py-2.5 lg:text-[13px]"
    >
      <span className="lg:hidden">WhatsApp</span>
      <span className="hidden lg:inline">{label}</span>
    </a>
  );
}
