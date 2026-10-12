import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { updateInquiryStatus } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { getSettings } from "@/lib/site";
import { allowedInquiryStatuses, INQUIRY_STATUS_LABELS, canSetInquiryStatus } from "@/lib/inquiry-status";

export default async function InquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [inquiry, settings] = await Promise.all([
    prisma.businessInquiry.findUnique({ where: { id } }),
    getSettings(),
  ]);
  if (!inquiry) notFound();
  const statusOptions = allowedInquiryStatuses(settings.businessStatus);

  return (
    <div className="max-w-3xl">
      <p className="kicker">{inquiry.reference}</p>
      <h1 className="mt-2 font-serif text-3xl">{inquiry.businessName}</h1>
      <p className="mt-2 text-sm text-stone">
        {inquiry.contactName} · {inquiry.email} {inquiry.phone ? `· ${inquiry.phone}` : ""} · {formatDateTime(inquiry.createdAt)}
      </p>

      <dl className="mt-8 grid gap-3 border border-line p-5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-stone">Business type</dt>
          <dd>{inquiry.businessType}</dd>
        </div>
        <div>
          <dt className="text-stone">Location</dt>
          <dd>{inquiry.address || "—"}</dd>
        </div>
        <div>
          <dt className="text-stone">Estimated knives</dt>
          <dd>{inquiry.estimatedKnives ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-stone">Frequency</dt>
          <dd>{inquiry.frequency || "—"}</dd>
        </div>
        <div>
          <dt className="text-stone">Pickup needed</dt>
          <dd>{inquiry.needsPickup ? "Yes" : "No"}</dd>
        </div>
        <div>
          <dt className="text-stone">Submitted</dt>
          <dd>{formatDateTime(inquiry.createdAt)}</dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-stone">Message</dt>
          <dd>{inquiry.message || "—"}</dd>
        </div>
      </dl>

      <form action={updateInquiryStatus} className="mt-8 grid gap-4 border border-line p-5">
        <input type="hidden" name="id" value={inquiry.id} />
        {settings.businessStatus === "PRELAUNCH" && (
          <p className="text-sm text-stone">PRELAUNCH: this is interest, not a confirmed job. Won / quoted job statuses are disabled.</p>
        )}
        <label>
          <span className="kicker">Status</span>
          <select
            name="status"
            defaultValue={canSetInquiryStatus(settings.businessStatus, inquiry.status) ? inquiry.status : "NEW"}
            className="field mt-2"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>
                {INQUIRY_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </label>
        <label>
          <span className="kicker">Admin notes</span>
          <textarea name="adminNotes" rows={4} defaultValue={inquiry.adminNotes ?? ""} className="field mt-2" />
        </label>
        <Button type="submit">Save inquiry</Button>
      </form>
    </div>
  );
}
