import { test } from "node:test";
import assert from "node:assert/strict";
import { tripEndDate, tripDateLabel } from "./tripDates.ts";
import { calculateItemTotal } from "./cartPricing.ts";

test("single-day and multi-day trips use inclusive end dates", () => {
  assert.equal(tripEndDate("2026-11-22", 1), "2026-11-22");
  assert.equal(tripEndDate("2026-11-22", 5), "2026-11-26");
  assert.equal(tripDateLabel("2026-11-22", "2026-11-26"), "2026-11-22 – 2026-11-26");
  assert.equal(tripDateLabel("2026-11-22", "2026-11-22"), "2026-11-22");
});
test("trips cross leap days, months, years, and daylight-saving dates", () => {
  assert.equal(tripEndDate("2028-02-27", 5), "2028-03-02");
  assert.equal(tripEndDate("2026-12-30", 5), "2027-01-03");
  assert.equal(tripEndDate("2026-03-28", 3), "2026-03-30");
  assert.equal(tripEndDate("2026-10-24", 3), "2026-10-26");
  assert.equal(tripEndDate("2026-01-01", 365), "2026-12-31");
});
test("invalid dates and non-integral trip lengths are rejected", () => {
  for (const value of ["invalid", "2026-02-30", "2026-13-01", "2026-1-01"]) assert.throws(() => tripEndDate(value, 5));
  for (const days of [0, -1, 1.5, NaN, Infinity]) assert.throws(() => tripEndDate("2026-11-22", days));
});
test("full-trip prices are multiplied by participants, never by days", () => {
  const item = { unitPrice: 500, quantity: 4, durationDays: 7,
    participants: { adults: 2, children: 1, infants: 1 },
    participantPricing: { adultPrice: 500, childPrice: 200, infantPrice: 0 } };
  assert.equal(calculateItemTotal(item), 1200);
  assert.equal(calculateItemTotal({ ...item, durationDays: 1 }), 1200);
  assert.equal(calculateItemTotal({ ...item, participantPricing: undefined }), 2000);
});
