import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCrmSessionUser } from "@/lib/crm/auth-crm";
import { contactWhere } from "@/lib/crm/list-query";
import { toCsvRow } from "@/lib/crm/csv";
import {
  crmContactScalarSelect,
  crmContactScalarSelectLegacy,
} from "@/lib/crm/crm-contact-select";
import { loadContactJobDescriptionUrlMap } from "@/lib/crm/contact-job-description-url";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCrmSessionUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const gate = await getCrmDbGate();
  if (gate.state === "db_error") {
    return new Response("Database unavailable", { status: 503 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const where = contactWhere(q, status);

  const contactSelect =
    gate.state === "ok" ? crmContactScalarSelect : crmContactScalarSelectLegacy;

  const rows = await prisma.crmContact.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
    select: contactSelect,
  });

  const jdMap = await loadContactJobDescriptionUrlMap(rows.map((r) => r.id));

  const includeClientId = gate.state === "ok";
  const header = [
    "id",
    "companyName",
    "contactName",
    "email",
    "phone",
    "city",
    "industry",
    "status",
    "notes",
    "message",
    ...(includeClientId ? (["clientId"] as const) : []),
    "jobDescriptionUrl",
    "createdAt",
    "updatedAt",
  ];

  let csv = "\uFEFF" + toCsvRow(header);
  for (const r of rows) {
    const clientIdVal =
      includeClientId && "clientId" in r ? (r.clientId ?? "") : "";
    const cells: string[] = [
      r.id,
      r.companyName ?? "",
      r.contactName,
      r.email,
      r.phone,
      r.city,
      r.industry ?? "",
      r.status,
      r.notes ?? "",
      r.message,
    ];
    if (includeClientId) {
      cells.push(String(clientIdVal));
    }
    cells.push(
      jdMap.get(r.id) ?? "",
      r.createdAt.toISOString(),
      r.updatedAt.toISOString()
    );
    csv += toCsvRow(cells);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="thg-client-leads-${stamp}.csv"`,
    },
  });
}
