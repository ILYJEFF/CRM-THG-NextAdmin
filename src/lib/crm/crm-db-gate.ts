import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type CrmDbGate =
  | { state: "ok" }
  | { state: "clients_module_missing" }
  | { state: "db_error" };

/**
 * Detects whether production has the clients module (crm_clients + crm_contacts.clientId).
 * Uses information_schema only so it does not require those objects to exist.
 */
async function getCrmDbGateInner(): Promise<CrmDbGate> {
  try {
    const rows = await prisma.$queryRaw<
      { clientsTable: boolean; clientIdColumn: boolean }[]
    >`
      SELECT
        EXISTS (
          SELECT 1 FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'crm_clients'
        ) AS "clientsTable",
        EXISTS (
          SELECT 1 FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = 'crm_contacts'
            AND column_name = 'clientId'
        ) AS "clientIdColumn"
    `;
    const row = rows[0];
    if (row?.clientsTable && row?.clientIdColumn) {
      return { state: "ok" };
    }
    return { state: "clients_module_missing" };
  } catch {
    return { state: "db_error" };
  }
}

/** One information_schema check per request (layout + pages dedupe). */
export const getCrmDbGate = cache(getCrmDbGateInner);
