export function normalizeUrl(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

export function isValidUrl(input: string): boolean {
  try {
    const u = new URL(normalizeUrl(input));
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
}

export function hostnameOf(input: string): string {
  try {
    return new URL(normalizeUrl(input)).hostname.replace(/^www\./, "");
  } catch {
    return input;
  }
}
