import pg from "pg";

const { Pool } = pg;

let pool = null;

/** Django app `supportwithemail` → table `supportwithemail_contactmessage` */
const CONTACT_TABLE = "supportwithemail_contactmessage";

export function isHammaDbConfigured() {
  return Boolean(process.env.HAMMA_DATABASE_URL?.trim());
}

export function getHammaPool() {
  if (!isHammaDbConfigured()) {
    throw new Error("HAMMA_DATABASE_URL is not configured");
  }
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.HAMMA_DATABASE_URL,
      ssl:
        process.env.HAMMA_DATABASE_SSL === "false"
          ? false
          : { rejectUnauthorized: false },
      max: 5,
    });
  }
  return pool;
}

export function mapHammaContactRow(row) {
  const parts = String(row.full_name || "")
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
    status: row.responded ? "responded" : "new",
    responded: Boolean(row.responded),
    source: "hamma",
    createdAt: row.created_at,
    updatedAt: row.updated || row.created_at,
  };
}

export async function listHammaContacts() {
  const result = await getHammaPool().query(
    `SELECT id, full_name, email, subject, message, created_at, updated, responded
     FROM ${CONTACT_TABLE}
     ORDER BY created_at DESC`
  );
  return result.rows.map(mapHammaContactRow);
}

export async function getHammaContactById(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return null;
  }
  const result = await getHammaPool().query(
    `SELECT id, full_name, email, subject, message, created_at, updated, responded
     FROM ${CONTACT_TABLE}
     WHERE id = $1`,
    [numericId]
  );
  if (!result.rows[0]) return null;
  return mapHammaContactRow(result.rows[0]);
}

export async function deleteHammaContactById(id) {
  const numericId = Number(id);
  if (!Number.isInteger(numericId) || numericId < 1) {
    return false;
  }
  const result = await getHammaPool().query(
    `DELETE FROM ${CONTACT_TABLE} WHERE id = $1 RETURNING id`,
    [numericId]
  );
  return result.rowCount > 0;
}
