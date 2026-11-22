import { test } from "node:test";
import assert from "node:assert/strict";
import { summarizeCountryBookings } from "./countryReports.js";

const booking = (amount, currency, payment_status = "succeeded", created_at = "2026-11-22T12:00:00") => ({
  amount, currency, payment_status, created_at, services: { service_name: "Baku city tour" },
});

test("country reports never combine currencies or count pending/failed payments as revenue", () => {
  const rows = [booking(10000, "aed"), booking(25000, "MYR"), booking(8000, "AED", "pending"), booking(5000, "AED", "failed")];
  const aed = summarizeCountryBookings(rows, "AED", "2026-11-22");
  assert.equal(aed.totalRevenue, 100);
  assert.equal(aed.days[6].revenue, 100);
  assert.equal(aed.days[6].bookings, 4);
  assert.equal(summarizeCountryBookings(rows, "MYR", "2026-11-22").totalRevenue, 250);
});

test("seven-day charts include both boundary days and exclude older bookings", () => {
  const report = summarizeCountryBookings([
    booking(2000, "AED", "succeeded", "2026-11-15T12:00:00"),
    booking(3000, "AED", "succeeded", "2026-11-16T12:00:00"),
    booking(4000, "AED", "succeeded", "2026-11-22T12:00:00"),
  ], "AED", "2026-11-22");
  assert.equal(report.totalRevenue, 90);
  assert.equal(report.days[0].revenue, 30);
  assert.equal(report.days[6].revenue, 40);
  assert.equal(report.days.reduce((sum, d) => sum + d.bookings, 0), 2);
});

test("empty countries and legacy bookings produce usable reports", () => {
  assert.equal(summarizeCountryBookings([], "AED", "2026-11-22").totalRevenue, 0);
  const report = summarizeCountryBookings([{ amount: null, services: null, payment_status: null }], "AED", "2026-11-22");
  assert.deepEqual(report.bookingsByService, [{ name: "Unknown", value: 1 }]);
  assert.deepEqual(report.paymentStatuses, [{ name: "pending", value: 1 }]);
  assert.equal(report.totalRevenue, 0);
});
