import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Loads `jobDescriptionUrl` only when the column exists. Missing column returns null.
 */
export async function loadContactJobDescriptionUrl(
  id: string
): Promise<string | null> {
  try {
    const rows = await prisma.$queryRaw<{ jobDescriptionUrl: string | null }[]>`
      SELECT "jobDescriptionUrl" FROM "crm_contacts" WHERE "id" = ${id} LIMIT 1
    `;
    return rows[0]?.jobDescriptionUrl ?? null;
  } catch {
    return null;
  }
}

/** Batch load for list/export; empty map if the column is missing. */
export async function loadContactJobDescriptionUrlMap(
  ids: string[]
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  if (ids.length === 0) return map;
  try {
    const list = Prisma.join(ids.map((id) => Prisma.sql`${id}`));
    const rows = await prisma.$queryRaw<
      { id: string; jobDescriptionUrl: string | null }[]
    >`
      SELECT "id", "jobDescriptionUrl" FROM "crm_contacts" WHERE "id" IN (${list})
    `;
    for (const r of rows) {
      map.set(r.id, r.jobDescriptionUrl);
    }
  } catch {
    /* missing column or DB error */
  }
  return map;
}
