/** Read the image shapes used by both legacy and current service records. */
export function firstServiceImage(value: unknown): string | undefined {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    if (Array.isArray(parsed)) return typeof parsed[0] === "string" ? parsed[0] : parsed[0]?.url;
    if (parsed && typeof parsed === "object" && "url" in parsed) {
      const url = (parsed as { url: string | string[] }).url;
      return Array.isArray(url) ? url[0] : url;
    }
  } catch {
    if (typeof value === "string" && /^https?:/.test(value)) return value;
  }
  return undefined;
}
