import Link from "next/link";
import { getSettings } from "@/lib/site";
import { saveSettings } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { BUSINESS_STATUSES } from "@/lib/business-status";
import { emailConfigured } from "@/lib/email/send";

export const metadata = { title: "Settings | KNIVPOJKARNA", robots: { index: false } };

const statusHelp: Record<(typeof BUSINESS_STATUSES)[number], string> = {
  PRELAUNCH: "Customers can register interest. No confirmed appointments, no payment.",
  ACTIVE: "Booking requests are accepted. Confirm times yourself — the form does not auto-confirm.",
  PAUSED: "New household and business requests are rejected. Existing records stay in admin.",
};

export default async function SettingsPage() {
  const settings = await getSettings();
  const mailReady = emailConfigured();

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl">Settings</h1>
      <p className="mt-1 text-sm text-stone">WhatsApp number in international format, digits only (e.g. 34600000000).</p>
      <form action={saveSettings} className="mt-8 grid gap-4 border border-line p-5">
        {settings.openWeekdays.split(",").map((d) => (
          <input key={d} type="hidden" name="weekday" value={d} />
        ))}
        <input type="hidden" name="timeSlots" defaultValue={settings.timeSlots} />
        <input type="hidden" name="leadTimeDays" defaultValue={settings.leadTimeDays} />
        <input type="hidden" name="bookingWindowDays" defaultValue={settings.bookingWindowDays} />
        <fieldset>
          <legend className="kicker">Business status</legend>
          <div className="mt-3 grid gap-3">
            {BUSINESS_STATUSES.map((status) => (
              <label key={status} className="flex items-start gap-3 border border-line bg-ivory p-3 text-sm">
                <input
                  type="radio"
                  name="businessStatus"
                  value={status}
                  defaultChecked={settings.businessStatus === status}
                  className="mt-1"
                />
                <span>
                  <span className="block font-medium tracking-[0.04em]">{status}</span>
                  <span className="mt-1 block text-stone">{statusHelp[status]}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          <span className="kicker">WhatsApp number</span>
          <input name="whatsappNumber" defaultValue={settings.whatsappNumber} className="field mt-2" />
        </label>
        <label>
          <span className="kicker">WhatsApp message (EN)</span>
          <textarea name="whatsappMessageEn" rows={3} defaultValue={settings.whatsappMessageEn} className="field mt-2" />
        </label>
        <label>
          <span className="kicker">WhatsApp message (ES)</span>
          <textarea name="whatsappMessageEs" rows={3} defaultValue={settings.whatsappMessageEs} className="field mt-2" />
        </label>
        <label>
          <span className="kicker">Public contact email</span>
          <input name="contactEmail" type="email" defaultValue={settings.contactEmail} className="field mt-2" />
          <span className="mt-1 block text-xs text-stone">Shown in the footer and privacy page only when set. Prefer info@knivpojkarna.com once the domain exists.</span>
        </label>
        <label>
          <span className="kicker">Instagram URL</span>
          <input name="instagramUrl" defaultValue={settings.instagramUrl} className="field mt-2" />
        </label>
        <label>
          <span className="kicker">Extra knife price (€)</span>
          <input
            name="extraKnifePrice"
            type="number"
            step="0.01"
            defaultValue={(settings.extraKnifePriceCents / 100).toString()}
            className="field mt-2"
          />
        </label>
        <label>
          <span className="kicker">Pickup & return fee (€)</span>
          <input
            name="pickupFee"
            type="number"
            step="0.01"
            min="0"
            defaultValue={settings.pickupFeeCents == null ? "" : (settings.pickupFeeCents / 100).toString()}
            placeholder="Leave empty until decided"
            className="field mt-2"
          />
          <span className="mt-1 block text-xs text-stone">
            {settings.pickupFeeCents == null
              ? "Not configured. Customers see “to be confirmed” — never advertised as free."
              : "Shown separately from the package price."}
          </span>
        </label>
        <label>
          <span className="kicker">Customer pickup instructions (EN)</span>
          <textarea name="pickupInstructionsEn" rows={3} defaultValue={settings.pickupInstructionsEn} className="field mt-2" />
        </label>
        <label>
          <span className="kicker">Customer pickup instructions (ES)</span>
          <textarea name="pickupInstructionsEs" rows={3} defaultValue={settings.pickupInstructionsEs} className="field mt-2" />
        </label>
        <label>
          <span className="kicker">Return delivery instructions (EN)</span>
          <textarea name="returnInstructionsEn" rows={3} defaultValue={settings.returnInstructionsEn} className="field mt-2" />
        </label>
        <label>
          <span className="kicker">Return delivery instructions (ES)</span>
          <textarea name="returnInstructionsEs" rows={3} defaultValue={settings.returnInstructionsEs} className="field mt-2" />
        </label>
        <p className="text-sm text-stone">
          Service towns are edited in{" "}
          <Link href="/admin/areas" className="text-forest">
            Areas
          </Link>
          . Pickup availability (open days, blocked dates, lead time) is in{" "}
          <Link href="/admin/availability" className="text-forest">
            Availability
          </Link>
          . Launch coverage is Marbella to Fuengirola.
        </p>
        <p className="text-sm text-stone">
          Transactional email: {mailReady ? "Resend credentials are present." : "RESEND_API_KEY and EMAIL_FROM are not set. Templates are ready; no production emails will be sent."}
        </p>
        <Button type="submit">Save settings</Button>
      </form>
    </div>
  );
}
