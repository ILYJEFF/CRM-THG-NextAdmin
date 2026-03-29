import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

/**
 * Loads `notes` only when the column exists. Missing column (pre-migration DB)
 * returns null instead of throwing.
 */
export async function loadCandidateNotes(id: string): Promise<string | null> {
  try {
    const rows = await prisma.$queryRaw<{ notes: string | null }[]>`
      SELECT "notes" FROM "crm_candidates" WHERE "id" = ${id} LIMIT 1
    `;
    return rows[0]?.notes ?? null;
  } catch {
    return null;
  }
}

/** Best-effort batch load for CSV export; empty map if `notes` column is missing. */
export async function loadCandidateNotesMap(
  ids: string[]
): Promise<Map<string, string | null>> {
  const map = new Map<string, string | null>();
  if (ids.length === 0) return map;
  try {
    const list = Prisma.join(ids.map((id) => Prisma.sql`${id}`));
    const rows = await prisma.$queryRaw<{ id: string; notes: string | null }[]>`
      SELECT "id", "notes" FROM "crm_candidates" WHERE "id" IN (${list})
    `;
    for (const r of rows) {
      map.set(r.id, r.notes);
    }
  } catch {
    /* missing column or DB error */
  }
  return map;
}
