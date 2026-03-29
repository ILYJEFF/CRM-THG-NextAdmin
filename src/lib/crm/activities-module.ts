import { cache } from "react";
import { prisma } from "@/lib/prisma";

async function activitiesTableExists(): Promise<boolean> {
  try {
    const rows = await prisma.$queryRaw<{ t: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'crm_activities'
      ) AS t
    `;
    return rows[0]?.t === true;
  } catch {
    return false;
  }
}

export const getActivitiesModuleReady = cache(activitiesTableExists);
