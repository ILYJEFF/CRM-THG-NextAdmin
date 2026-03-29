import { cache } from "react";
import { prisma } from "@/lib/prisma";

/** True when crm_submissions exists (career sync + assignments migration). */
async function submissionsTableExists(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<{ t: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'crm_submissions'
      ) AS t
    `;
    return rows[0]?.t === true;
  } catch {
    return false;
  }
}

export const getSubmissionsModuleReady = cache(submissionsTableExists);
