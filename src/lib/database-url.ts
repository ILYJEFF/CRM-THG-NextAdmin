/**
 * Vercel serverless: each concurrent invocation should use at most one DB
 * connection through PgBouncer. Without this, parallel queries (or Promise.all)
 * can exhaust Prisma's pool and hit "Timed out fetching a new connection".
 *
 * Hosted Postgres URLs (Vercel, Supabase pooler, etc.) often already include
 * `connection_limit=5` or similar.
 * Those defaults must be overridden, or serverless invocations starve the pool.
 */
export function applyServerlessDbUrl(url: string): string {
  if (process.env.NODE_ENV !== "production") return url;
  if (process.env.PRISMA_SERVERLESS_POOL_OFF === "1") return url;

  try {
    const u = new URL(url);
    u.searchParams.set("connection_limit", "1");
    u.searchParams.set("pool_timeout", "20");
    return u.toString();
  } catch {
    const joiner = url.includes("?") ? "&" : "?";
    const stripped = url
      .replace(/([?&])connection_limit=\d+(&|$)/g, "$1")
      .replace(/([?&])pool_timeout=\d+(&|$)/g, "$1")
      .replace(/\?&/, "?")
      .replace(/&&+/g, "&")
      .replace(/[?&]$/, "");
    return `${stripped}${joiner}connection_limit=1&pool_timeout=20`;
  }
}

/**
 * Vercel often injects POSTGRES_PRISMA_URL / POSTGRES_URL; Supabase dashboard
 * uses DATABASE_URL. Prisma schema only names DATABASE_URL, so we normalize here.
 */
export function resolveDatabaseUrl(): string | undefined {
  const direct =
    process.env.DATABASE_URL ||
    process.env.POSTGRES_PRISMA_URL ||
    process.env.POSTGRES_URL;

  if (direct) return direct;

  const host = process.env.POSTGRES_HOST;
  const user = process.env.POSTGRES_USER ?? "postgres";
  const password = process.env.POSTGRES_PASSWORD;
  const database = process.env.POSTGRES_DATABASE ?? "postgres";
  if (host && password) {
    return `postgresql://${encodeURIComponent(user)}:${encodeURIComponent(password)}@${host}:5432/${database}?sslmode=require`;
  }

  return undefined;
}
