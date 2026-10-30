export function formatPrice(value: number | null | undefined, purpose?: string): string {
  if (value == null || value <= 0) return "Price on request";
  let s: string;
  if (value >= 10000000) s = `₹${trim(value / 10000000)} Cr`;
  else if (value >= 100000) s = `₹${trim(value / 100000)} Lakh`;
  else s = `₹${value.toLocaleString("en-IN")}`;
  return purpose === "rent" || purpose === "lease" ? `${s}/month` : s;
}
function trim(n: number) {
  return Number(n.toFixed(2)).toString();
}

export function formatINR(value: number | null | undefined): string {
  if (value == null) return "—";
  return `₹${Number(value).toLocaleString("en-IN")}`;
}

export function formatDate(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
export function formatDateTime(d: string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

export function humanize(s: string | null | undefined): string {
  if (!s) return "—";
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

export const purposeLabel = (p: string) => (p === "sell" ? "Sell" : p === "rent" ? "Rent" : p === "lease" ? "Lease" : p);
export const categoryLabel = (c: string) =>
  c === "residential" ? "Residential" : c === "commercial" ? "Commercial" : c === "plot" ? "Plot / Land" : c;
