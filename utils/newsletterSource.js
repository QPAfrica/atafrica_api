const ALLOWED_SOURCES = new Set(["atafrica", "clipperfc"]);

export function normalizeNewsletterSource(raw) {
  const source = String(raw || "atafrica")
    .toLowerCase()
    .trim();
  return ALLOWED_SOURCES.has(source) ? source : "atafrica";
}
