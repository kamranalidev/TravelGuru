import dayjs from "dayjs";

// Bookings supplied here have already been scoped by country and creation date.
export function summarizeCountryBookings(bookings, currency, endDate) {
  const services = new Map();
  const statuses = new Map();
  const days = Array.from({ length: 7 }, (_, i) => ({
    date: dayjs(endDate).subtract(6 - i, "day").format("YYYY-MM-DD"), revenue: 0, bookings: 0,
  }));
  let totalRevenue = 0;
  for (const booking of bookings) {
    const name = booking.services?.service_name || "Unknown";
    const status = booking.payment_status || "pending";
    services.set(name, (services.get(name) || 0) + 1);
    statuses.set(status, (statuses.get(status) || 0) + 1);
    const revenue = status === "succeeded" && (booking.currency || "AED").toUpperCase() === currency.toUpperCase()
      ? Number(booking.amount || 0) / 100 : 0;
    totalRevenue += revenue;
    const day = days.find(d => d.date === dayjs(booking.created_at).format("YYYY-MM-DD"));
    if (day) { day.bookings += 1; day.revenue += revenue; }
  }
  const chart = map => Array.from(map, ([name, value]) => ({ name, value }));
  return { totalRevenue, bookingsByService: chart(services), paymentStatuses: chart(statuses), days };
}
