import { resolveDatabaseUrl } from "@/lib/database-url";

export const dynamic = "force-dynamic";

/**
 * No auth, no Prisma client (avoids throwing if DATABASE_URL is unset).
 * Use on Vercel to verify env: GET /api/health
 */
export async function GET() {
  const databaseUrl = Boolean(resolveDatabaseUrl());
  const supabasePublic = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
  const ok = databaseUrl && supabasePublic;

  return Response.json(
    {
      ok,
      service: "thg-crm",
      checks: {
        databaseUrl,
        supabasePublic,
      },
    },
    { status: ok ? 200 : 503 }
  );
}
