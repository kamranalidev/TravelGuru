import type { CartItem } from "../store/features/cart/cartSlice";

/** Package prices cover the entire trip; duration never multiplies this total. */
export function calculateItemTotal(item: CartItem): number {
  if (!item.participantPricing) return item.unitPrice * item.quantity;
  const { adults, children, infants } = item.participants;
  return adults * item.participantPricing.adultPrice
    + children * (item.participantPricing.childPrice ?? 0)
    + infants * (item.participantPricing.infantPrice ?? 0);
}
