/** Calendar dates use UTC arithmetic to avoid daylight-saving shifts. End dates are inclusive. */
export function tripEndDate(startDate: string, durationDays: number = 1): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) throw new Error("Choose a valid start date.");
  if (!Number.isInteger(durationDays) || durationDays < 1) throw new Error("Package length must be a positive whole number of days.");
  const date = new Date(`${startDate}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== startDate) throw new Error("Choose a valid start date.");
  date.setUTCDate(date.getUTCDate() + durationDays - 1);
  if (!Number.isFinite(date.getTime())) throw new Error("Package end date is out of range.");
  return date.toISOString().slice(0, 10);
}

export function tripDateLabel(start: string, end?: string | null): string {
  return end && end !== start ? `${start} – ${end}` : start;
}
