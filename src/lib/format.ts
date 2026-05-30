export const inr = (n: number | string) => {
  const v = typeof n === "string" ? parseFloat(n) : n;
  if (!isFinite(v)) return "₹0";
  return "₹" + Math.round(v).toLocaleString("en-IN");
};

export const slugify = (s: string) =>
  s.toLowerCase().trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const PLACEHOLDER_IMG =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 800'><rect fill='%23f5f5f5' width='600' height='800'/><text x='50%25' y='50%25' fill='%23bbb' font-family='serif' font-size='28' text-anchor='middle' dy='.3em'>BUTTERBYTE</text></svg>";
