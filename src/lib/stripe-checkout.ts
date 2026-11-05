import type Stripe from "stripe";
import type { DeliveryQuote } from "@/lib/delivery-zones";

export type CheckoutLineItem = {
  name: string;
  amountCents: number;
};

/**
 * Online payment is only allowed when the server can compute a firm total.
 * REVIEW / OUTSIDE (null delivery fee) must not reach Stripe.
 */
export function isPayableQuote(quote: DeliveryQuote): boolean {
  return (
    quote.inServiceArea &&
    !quote.deliveryNeedsReview &&
    quote.deliveryFeeCents != null &&
    quote.estimatedTotalCents > 0 &&
    quote.sharpeningSubtotalCents > 0
  );
}

/** Line items for Stripe Checkout — amounts come only from the server quote. */
export function buildCheckoutLineItems(
  packageName: string,
  quote: DeliveryQuote,
  labels: { delivery: string },
): CheckoutLineItem[] | null {
  if (!isPayableQuote(quote) || quote.deliveryFeeCents == null) return null;

  const items: CheckoutLineItem[] = [
    {
      name: packageName,
      amountCents: quote.sharpeningSubtotalCents,
    },
  ];

  if (quote.deliveryFeeCents > 0) {
    items.push({
      name: labels.delivery,
      amountCents: quote.deliveryFeeCents,
    });
  }

  const sum = items.reduce((total, item) => total + item.amountCents, 0);
  if (sum !== quote.estimatedTotalCents) return null;
  return items;
}

export function checkoutLineItemsToStripe(
  items: CheckoutLineItem[],
): Stripe.Checkout.SessionCreateParams.LineItem[] {
  return items.map((item) => ({
    quantity: 1,
    price_data: {
      currency: "eur",
      unit_amount: item.amountCents,
      product_data: { name: item.name },
    },
  }));
}
