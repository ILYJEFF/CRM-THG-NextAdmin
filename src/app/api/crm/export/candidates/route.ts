import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCrmSessionUser } from "@/lib/crm/auth-crm";
import { candidateWhere } from "@/lib/crm/list-query";
import { toCsvRow } from "@/lib/crm/csv";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const user = await getCrmSessionUser();
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const status = request.nextUrl.searchParams.get("status") ?? undefined;
  const where = candidateWhere(q, status);

  const rows = await prisma.crmCandidate.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10000,
  });

  const header = [
    "id",
    "firstName",
    "lastName",
    "email",
    "phone",
    "currentLocation",
    "desiredLocation",
    "industry",
    "positionType",
    "status",
    "notes",
    "resumeUrl",
    "createdAt",
    "updatedAt",
  ];

  let csv = "\uFEFF" + toCsvRow(header);
  for (const r of rows) {
    csv += toCsvRow([
      r.id,
      r.firstName,
      r.lastName,
      r.email,
      r.phone,
      r.currentLocation,
      r.desiredLocation,
      r.industry,
      r.positionType,
      r.status,
      r.notes ?? "",
      r.resumeUrl ?? "",
      r.createdAt.toISOString(),
      r.updatedAt.toISOString(),
    ]);
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="thg-talent-${stamp}.csv"`,
    },
  });
}
