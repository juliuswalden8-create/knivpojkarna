import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe, stripeWebhookSecret } from "@/lib/stripe";
import {
  acknowledgeNonPaidCheckout,
  recordStripeCheckoutPayment,
} from "@/lib/stripe-payments";
import { notifyAdmin } from "@/lib/telegram";
import { siteUrl } from "@/lib/site";
import { prisma } from "@/lib/prisma";
import { logError } from "@/lib/safe-log";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = stripeWebhookSecret();
  if (!secret) {
    return NextResponse.json({ error: "webhook_not_configured" }, { status: 503 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "missing_signature" }, { status: 400 });
  }

  const rawBody = await request.text();
  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(rawBody, signature, secret);
  } catch (err) {
    logError("stripe.webhook_signature", err);
    return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded") {
      const session = event.data.object as Stripe.Checkout.Session;
      // completed + unpaid (async methods) must not create a payment row.
      if (session.payment_status !== "paid") {
        acknowledgeNonPaidCheckout(session, event.type);
      } else {
        const result = await recordStripeCheckoutPayment(session);
        if (result.ok && result.created) {
          const booking = await prisma.booking.findUnique({
            where: { id: result.bookingId },
            select: {
              reference: true,
              customerName: true,
              packageName: true,
              knifeCount: true,
              areaName: true,
              deliveryZone: true,
              estimatedTotalCents: true,
              id: true,
            },
          });
          if (booking) {
            await notifyAdmin(
              {
                kind: "booking",
                reference: booking.reference,
                name: booking.customerName,
                packageName: booking.packageName,
                knifeCount: booking.knifeCount,
                area: booking.areaName || "—",
                deliveryZone: booking.deliveryZone,
                estimatedTotalCents: booking.estimatedTotalCents,
                adminPath: `/admin/bookings/${booking.id}`,
              },
              siteUrl(),
            );
          }
        }
      }
    } else if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      const session = event.data.object as Stripe.Checkout.Session;
      acknowledgeNonPaidCheckout(session, event.type);
    }
  } catch (err) {
    logError("stripe.webhook_handler", err);
    return NextResponse.json({ error: "handler_failed" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
