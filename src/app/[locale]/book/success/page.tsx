import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { resolveLocale } from "@/i18n/locale";
import { prisma } from "@/lib/prisma";
import { formatPrice, interpolate } from "@/lib/utils";
import { localizedPath } from "@/i18n/routes";
import { ButtonLink } from "@/components/ui/button";
import { getSettings, whatsappLink } from "@/lib/site";
import { isWaitlistBooking } from "@/lib/waitlist";
import { syncCheckoutSessionById } from "@/lib/stripe-payments";
import { paymentSummary } from "@/lib/payments";
import { stripeConfigured } from "@/lib/stripe";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { dict } = await resolveLocale(params);
  return { title: dict.booking.success.title, robots: { index: false, follow: false } };
}

export default async function BookingSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; session_id?: string }>;
}) {
  const { locale, dict } = await resolveLocale(params);
  const { ref, session_id: sessionId } = await searchParams;
  if (!ref) notFound();

  if (sessionId && stripeConfigured()) {
    // Bind the Stripe session to this booking reference before any payment row is written.
    await syncCheckoutSessionById(sessionId, ref);
  }

  const booking = await prisma.booking.findUnique({
    where: { reference: ref },
    include: { payments: { select: { eurCents: true, voidedAt: true } } },
  });
  if (!booking) notFound();

  const settings = await getSettings();
  const wa = whatsappLink(settings.whatsappNumber, `${dict.whatsapp.message} (${booking.reference})`);
  const waitlist = isWaitlistBooking(booking) || settings.businessStatus === "PRELAUNCH";
  const paid = paymentSummary(
    booking.estimatedTotalCents,
    booking.payments.map((payment) => ({ eurCents: payment.eurCents, voided: payment.voidedAt != null })),
  ).status === "Paid";

  const title = waitlist
    ? dict.mode.successTitle
    : paid
      ? dict.booking.success.paidTitle
      : dict.booking.successActiveTitle;
  const text = waitlist
    ? dict.mode.successText
    : paid
      ? dict.booking.success.paidText
      : dict.booking.successActiveText;
  const keep = waitlist ? dict.mode.successKeep : dict.booking.success.keep;
  const kicker = waitlist
    ? dict.mode.bookingKicker
    : paid
      ? dict.booking.success.paidKicker
      : dict.booking.success.kicker;

  return (
    <div className="container-x py-16 sm:py-24">
      <p className="kicker">{kicker}</p>
      <h1 className="display mt-4 max-w-3xl text-[2.4rem] sm:text-5xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-stone">{text}</p>
      <div className="mt-10 max-w-xl border-t border-line pt-8">
        <p className="kicker">{dict.booking.success.reference}</p>
        <p className="mt-2 font-display text-3xl font-semibold tracking-[-0.02em]">{booking.reference}</p>
        <p className="mt-3 text-sm text-stone">{keep}</p>
        {waitlist ? (
          <dl className="mt-6 space-y-2 text-sm text-stone">
            <div className="flex justify-between gap-4">
              <dt>{dict.booking.review.town}</dt>
              <dd className="text-ink">{booking.areaName || "—"}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{dict.booking.review.contact}</dt>
              <dd className="text-right text-ink">
                {[booking.customerName, booking.email || null, booking.phone || null].filter(Boolean).join(" · ")}
              </dd>
            </div>
          </dl>
        ) : (
          <dl className="mt-6 space-y-2 text-sm text-stone">
            <div className="flex justify-between gap-4">
              <dt>{dict.booking.review.package}</dt>
              <dd className="text-ink">{booking.packageName}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt>{dict.booking.review.knives}</dt>
              <dd className="text-ink">{booking.knifeCount}</dd>
            </div>
            {booking.sharpeningSubtotalCents != null ? (
              <div className="flex justify-between gap-4">
                <dt>{dict.booking.review.subtotal}</dt>
                <dd className="text-ink">{formatPrice(booking.sharpeningSubtotalCents, locale)}</dd>
              </div>
            ) : null}
            {booking.sharpeningSubtotalCents != null ? (
              <div className="flex justify-between gap-4">
                <dt>{dict.booking.review.fee}</dt>
                <dd className="text-ink">
                  {booking.deliveryFeeWaived
                    ? interpolate(dict.booking.review.deliveryFree, {
                        threshold: formatPrice(settings.freeDeliveryThresholdCents, locale),
                      })
                    : booking.deliveryFeeCents == null
                      ? booking.deliveryNeedsReview
                        ? dict.booking.review.deliveryReview
                        : dict.booking.review.feeUnconfigured
                      : formatPrice(booking.deliveryFeeCents, locale)}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between gap-4">
              <dt>{dict.booking.review.estimate}</dt>
              <dd className="text-ink">{formatPrice(booking.estimatedTotalCents, locale)}</dd>
            </div>
          </dl>
        )}
        {waitlist ? <p className="mt-4 text-xs leading-relaxed text-stone">{dict.booking.review.interestNote}</p> : null}
      </div>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href={localizedPath(locale, "home")}>{dict.booking.success.home}</ButtonLink>
        {wa && (
          <ButtonLink href={wa} variant="secondary">
            {dict.booking.success.whatsapp}
          </ButtonLink>
        )}
      </div>
    </div>
  );
}
