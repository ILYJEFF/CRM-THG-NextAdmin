import { PrismaClient } from "@prisma/client";
import { resolveDatabaseUrl } from "@/lib/database-url";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function createClient() {
  const url = resolveDatabaseUrl();
  if (!url) {
    throw new Error(
      "Missing database connection string. Set DATABASE_URL on Vercel, or POSTGRES_PRISMA_URL / POSTGRES_URL from the Supabase or Vercel Postgres integration."
    );
  }

  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
    datasources: {
      db: { url },
    },
  });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
