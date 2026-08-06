import pg from "pg";

const { Pool } = pg;

let pool = null;

export function isSabiDbConfigured() {
  return Boolean(process.env.SABI_DATABASE_URL?.trim());
}

export function getSabiPool() {
  if (!isSabiDbConfigured()) {
    throw new Error("SABI_DATABASE_URL is not configured");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.SABI_DATABASE_URL,
      ssl: process.env.SABI_DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export function mapSabiContactRow(row) {
  const parts = String(row.name || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const firstName = parts[0] || "";
  const lastName = parts.slice(1).join(" ");

  return {
    _id: String(row.id),
    firstName,
    lastName,
    email: row.email,
    phone: "",
    subject: row.subject,
    message: row.message,
    topic: row.topic,
    priority: row.priority,
    status: row.status,
    source: "sabi",
    createdAt: row.created_at,
    updatedAt: row.resolved_at || row.read_at || row.created_at,
  };
}

export async function listSabiContacts() {
  const result = await getSabiPool().query(
    `SELECT id, name, email, topic, subject, message, priority, status,
            created_at, read_at, resolved_at
     FROM contact_messages
     ORDER BY created_at DESC`
  );
  return result.rows.map(mapSabiContactRow);
}

export async function getSabiContactById(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }
  const result = await getSabiPool().query(
    `SELECT id, name, email, topic, subject, message, priority, status,
            created_at, read_at, resolved_at
     FROM contact_messages
     WHERE id = $1`,
    [numericId]
  );
  if (!result.rows[0]) return null;
  return mapSabiContactRow(result.rows[0]);
}

export async function deleteSabiContactById(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return false;
  }
  const result = await getSabiPool().query(
    `DELETE FROM contact_messages WHERE id = $1 RETURNING id`,
    [numericId]
  );
  return result.rowCount > 0;
}
