import type { Metadata } from "next";
import Link from "next/link";
import { requireAdminSession } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/admin";
import { Logo } from "@/components/brand/logo";

export const metadata: Metadata = { robots: { index: false, follow: false } };

const nav = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Household" },
  { href: "/admin/inquiries", label: "Business" },
  { href: "/admin/packages", label: "Packages" },
  { href: "/admin/areas", label: "Areas" },
  { href: "/admin/availability", label: "Availability" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdminSession();

  return (
    <div className="min-h-screen bg-ivory text-ink">
      <aside className="fixed inset-y-0 left-0 hidden w-56 border-r border-line bg-soft p-6 lg:flex lg:flex-col">
        <Link href="/admin" className="inline-flex">
          <Logo variant="full" className="w-36" />
        </Link>
        <nav className="mt-10 flex flex-1 flex-col gap-1">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="py-2 text-[13px] text-stone hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <form action={logoutAction}>
          <button type="submit" className="text-[13px] text-stone hover:text-ink">
            Sign out
          </button>
        </form>
        <p className="mt-3 text-[11px] text-stone">{session.email}</p>
      </aside>
      <div className="lg:pl-56">
        <header className="flex items-center justify-between gap-3 overflow-x-auto border-b border-line bg-ivory px-4 py-3 lg:hidden">
          <Logo compact />
          <nav className="flex gap-3 text-[12px]">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="whitespace-nowrap text-stone">
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <div className="p-5 sm:p-8">{children}</div>
      </div>
    </div>
  );
}
