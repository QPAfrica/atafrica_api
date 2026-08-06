const ALLOWED_SOURCES = new Set([
  "atafrica",
  "clipperfc",
  "qpafrica",
  "ft9ja-hero",
]);

export function normalizeNewsletterSource(raw) {
  const source = String(raw || "atafrica")
    .toLowerCase()
    .trim();
  return ALLOWED_SOURCES.has(source) ? source : "atafrica";
}
