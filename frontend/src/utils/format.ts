export function formatNumber(n: number | string | undefined): string {
  if (n === undefined || n === null || n === "") return "—";
  const num = typeof n === "string" ? Number(n) : n;
  if (Number.isNaN(num)) return String(n);
  return new Intl.NumberFormat("en-US").format(num);
}

export function formatDuration(t: number | string | undefined): string {
  if (t === undefined || t === null || t === "") return "—";
  const seconds = typeof t === "string" ? parseFloat(t) : t;
  if (Number.isNaN(seconds)) return String(t);
  if (seconds < 1) return `${Math.round(seconds * 1000)} ms`;
  if (seconds < 60) return `${seconds.toFixed(1)} s`;
  return `${Math.floor(seconds / 60)}m ${Math.round(seconds % 60)}s`;
}
