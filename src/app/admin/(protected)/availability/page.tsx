import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/site";
import { utcToISODate } from "@/lib/dates";
import { addBlockedDate, removeBlockedDate, saveSettings } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

const days = [
  { n: "1", l: "Mon" },
  { n: "2", l: "Tue" },
  { n: "3", l: "Wed" },
  { n: "4", l: "Thu" },
  { n: "5", l: "Fri" },
  { n: "6", l: "Sat" },
  { n: "0", l: "Sun" },
];

export const metadata = { title: "Availability | BladeBud", robots: { index: false } };

export default async function AvailabilityPage() {
  const [settings, blocked] = await Promise.all([getSettings(), prisma.blockedDate.findMany({ orderBy: { date: "asc" } })]);
  const open = new Set(settings.openWeekdays.split(","));

  return (
    <div className="max-w-3xl">
      <h1 className="font-serif text-3xl">Availability</h1>
      <form action={saveSettings} className="mt-8 grid gap-5 border border-line p-5">
        <input type="hidden" name="whatsappNumber" defaultValue={settings.whatsappNumber} />
        <input type="hidden" name="whatsappMessageEn" defaultValue={settings.whatsappMessageEn} />
        <input type="hidden" name="whatsappMessageEs" defaultValue={settings.whatsappMessageEs} />
        <input type="hidden" name="contactEmail" defaultValue={settings.contactEmail} />
        <input type="hidden" name="instagramUrl" defaultValue={settings.instagramUrl} />
        <input type="hidden" name="extraKnifePrice" defaultValue={(settings.extraKnifePriceCents / 100).toString()} />
        <input type="hidden" name="businessStatus" defaultValue={settings.businessStatus} />
        <input type="hidden" name="pickupInstructionsEn" defaultValue={settings.pickupInstructionsEn} />
        <input type="hidden" name="pickupInstructionsEs" defaultValue={settings.pickupInstructionsEs} />
        <input type="hidden" name="returnInstructionsEn" defaultValue={settings.returnInstructionsEn} />
        <input type="hidden" name="returnInstructionsEs" defaultValue={settings.returnInstructionsEs} />
        <input type="hidden" name="pickupFee" defaultValue={settings.pickupFeeCents == null ? "" : (settings.pickupFeeCents / 100).toString()} />
        <input type="hidden" name="deliveryZone1Fee" defaultValue={(settings.deliveryZone1FeeCents / 100).toString()} />
        <input type="hidden" name="deliveryZone2Fee" defaultValue={(settings.deliveryZone2FeeCents / 100).toString()} />
        <input type="hidden" name="deliveryZone3Fee" defaultValue={(settings.deliveryZone3FeeCents / 100).toString()} />
        <input type="hidden" name="freeDeliveryThreshold" defaultValue={(settings.freeDeliveryThresholdCents / 100).toString()} />
        <fieldset>
          <legend className="kicker">Open weekdays</legend>
          <div className="mt-3 flex flex-wrap gap-3">
            {days.map((d) => (
              <label key={d.n} className="flex items-center gap-2 text-sm">
                <input type="checkbox" name="weekday" value={d.n} defaultChecked={open.has(d.n)} className="accent-forest" />
                {d.l}
              </label>
            ))}
          </div>
        </fieldset>
        <label>
          <span className="kicker">Time slots (comma separated)</span>
          <input name="timeSlots" defaultValue={settings.timeSlots} className="field mt-2" />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label>
            <span className="kicker">Lead time (days)</span>
            <input type="number" name="leadTimeDays" defaultValue={settings.leadTimeDays} className="field mt-2" />
          </label>
          <label>
            <span className="kicker">Booking window (days)</span>
            <input type="number" name="bookingWindowDays" defaultValue={settings.bookingWindowDays} className="field mt-2" />
          </label>
        </div>
        <Button type="submit" size="sm">
          Save availability
        </Button>
      </form>

      <h2 className="mt-12 font-serif text-xl">Blocked dates</h2>
      <form action={addBlockedDate} className="mt-4 flex flex-wrap gap-3">
        <input type="date" name="date" required className="field" />
        <input name="reason" placeholder="Reason" className="field" />
        <Button type="submit" size="sm">
          Block date
        </Button>
      </form>
      <ul className="mt-6 space-y-2">
        {blocked.map((row) => (
          <li key={row.id} className="flex items-center justify-between border border-line px-4 py-3 text-sm">
            <span>
              {utcToISODate(row.date)} {row.reason ? `· ${row.reason}` : ""}
            </span>
            <form action={removeBlockedDate}>
              <input type="hidden" name="id" value={row.id} />
              <button type="submit" className="text-forest">
                Remove
              </button>
            </form>
          </li>
        ))}
        {blocked.length === 0 && <li className="text-sm text-stone">No blocked dates.</li>}
      </ul>
    </div>
  );
}
