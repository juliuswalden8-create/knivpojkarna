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
      className="fixed bottom-5 right-5 z-40 border border-line bg-soft px-4 py-2.5 text-[13px] text-ink shadow-sm hover:border-ink"
    >
      {label}
    </a>
  );
}
