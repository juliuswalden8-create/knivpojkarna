import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { InquiryFilters } from "@/components/admin/inquiry-filters";
import { parseInquiryFilters, inquiryWhere } from "@/lib/admin-query";
import { INQUIRY_STATUSES, INQUIRY_STATUS_LABELS } from "@/lib/inquiry-status";

export const metadata = { title: "Business inquiries | BladeBud", robots: { index: false } };

export default async function InquiriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; from?: string; to?: string }>;
}) {
  const filters = parseInquiryFilters(await searchParams);
  const inquiries = await prisma.businessInquiry.findMany({
    where: inquiryWhere(filters),
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl">Business inquiries</h1>
          <p className="mt-1 text-sm text-stone">Quote requests from restaurants, chefs and other kitchens.</p>
        </div>
        <Link href="/admin/export?type=inquiries" className="text-xs uppercase tracking-[0.14em] text-forest">
          Export CSV
        </Link>
      </div>
      <InquiryFilters
        action="/admin/inquiries"
        values={filters}
        statusOptions={INQUIRY_STATUSES.map((status) => ({ value: status, label: INQUIRY_STATUS_LABELS[status] }))}
      />
      <div className="mt-6 overflow-x-auto border border-line">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="text-[11px] uppercase tracking-[0.14em] text-stone">
            <tr>
              <th className="px-4 py-2">Ref</th>
              <th className="px-4 py-2">Business</th>
              <th className="px-4 py-2">Contact</th>
              <th className="px-4 py-2">Location</th>
              <th className="px-4 py-2">Knives</th>
              <th className="px-4 py-2">Submitted</th>
              <th className="px-4 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {inquiries.map((inq) => (
              <tr key={inq.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <Link href={`/admin/inquiries/${inq.id}`} className="text-forest">
                    {inq.reference}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  {inq.businessName}
                  <span className="block text-xs text-stone">{inq.businessType}</span>
                </td>
                <td className="px-4 py-3">
                  {inq.contactName}
                  <span className="block text-xs text-stone">
                    {inq.email} {inq.phone ? `· ${inq.phone}` : ""}
                  </span>
                </td>
                <td className="px-4 py-3">{inq.address || "—"}</td>
                <td className="px-4 py-3">
                  {inq.estimatedKnives ?? "?"}
                  {inq.frequency ? <span className="block text-xs text-stone">{inq.frequency}</span> : null}
                </td>
                <td className="px-4 py-3">{formatDateTime(inq.createdAt)}</td>
                <td className="px-4 py-3">
                  {INQUIRY_STATUS_LABELS[inq.status as keyof typeof INQUIRY_STATUS_LABELS] ?? inq.status}
                </td>
              </tr>
            ))}
            {inquiries.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-10 text-center text-stone">
                  No matching inquiries.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
