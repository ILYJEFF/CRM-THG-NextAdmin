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
