/**
 * Requires `x-admin-api-key` header to match process.env.ADMIN_API_KEY.
 * Protects list/mutate routes that must not be public.
 */
export function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_API_KEY;

  if (!expected) {
    return res.status(500).json({ msg: "Admin auth is not configured" });
  }

  const provided = req.header("x-admin-api-key");
  if (!provided || provided !== expected) {
    return res.status(401).json({ msg: "Unauthorized" });
  }

  return next();
}
