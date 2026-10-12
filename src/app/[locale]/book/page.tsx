import type { Metadata } from "next";
import { resolveLocale } from "@/i18n/locale";
import { getAreas, getAvailability, getPackages, getSettings } from "@/lib/site";
import { LAUNCH_SERVICE_AREAS } from "@/lib/launch-areas";
import { BookingFlow } from "@/components/booking/booking-flow";
import { localizedPath } from "@/i18n/routes";
import { siteUrl } from "@/lib/site";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale, dict } = await resolveLocale(params);
  return {
    title: dict.meta.book.title,
    description: dict.meta.book.description,
    alternates: { canonical: `${siteUrl()}${localizedPath(locale, "book")}` },
  };
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ package?: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const { package: pkgSlug } = await searchParams;
  const [packages, availability, settings, dbAreas] = await Promise.all([
    getPackages(locale),
    getAvailability(),
    getSettings(),
    getAreas(true),
  ]);
  const areas = (dbAreas.length ? dbAreas : LAUNCH_SERVICE_AREAS).map((area) => ({ name: area.name }));
  const single = packages.find((p) => p.knifeCount === 1)?.priceCents ?? settings.extraKnifePriceCents;
  const prelaunch = settings.businessStatus === "PRELAUNCH";
  const paused = settings.businessStatus === "PAUSED";

  return (
    <div className="container-x py-16 sm:py-24">
      <p className="kicker">{paused ? dict.mode.pausedTitle : prelaunch ? dict.mode.bookingKicker : dict.booking.kicker}</p>
      <h1 className="display mt-4 max-w-3xl text-[2.4rem] sm:text-5xl">
        {paused ? dict.mode.pausedTitle : prelaunch ? dict.mode.bookingTitle : dict.booking.title}
      </h1>
      <p className="mt-4 max-w-2xl text-stone">
        {paused ? dict.mode.pausedText : prelaunch ? dict.mode.bookingIntro : dict.booking.intro}
      </p>
      {paused ? null : (
        <div className="mt-10">
          <BookingFlow
            locale={locale}
            dict={dict}
            packages={packages}
            initialSlug={pkgSlug}
            extraKnifePriceCents={settings.extraKnifePriceCents}
            singlePriceCents={single}
            openWeekdays={availability.openWeekdays}
            timeSlots={availability.timeSlots}
            leadTimeDays={availability.leadTimeDays}
            bookingWindowDays={availability.bookingWindowDays}
            blocked={availability.blocked}
            businessStatus={settings.businessStatus}
            areas={areas}
            deliveryFees={{
              zone1Cents: settings.deliveryZone1FeeCents,
              zone2Cents: settings.deliveryZone2FeeCents,
              zone3Cents: settings.deliveryZone3FeeCents,
              freeThresholdCents: settings.freeDeliveryThresholdCents,
            }}
            pickupInstructions={locale === "es" ? settings.pickupInstructionsEs : settings.pickupInstructionsEn}
            returnInstructions={locale === "es" ? settings.returnInstructionsEs : settings.returnInstructionsEn}
          />
        </div>
      )}
    </div>
  );
}
