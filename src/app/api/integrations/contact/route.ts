import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { contactIngestSchema } from "@/lib/crm/ingest-schemas";
import {
  integrationSecretMissingResponse,
  integrationUnauthorizedResponse,
  verifyIntegrationSecret,
} from "@/lib/crm/integration-secret";

export const dynamic = "force-dynamic";

function isMissingJobDescriptionUrlColumn(error: unknown): boolean {
  if (!(error instanceof Prisma.PrismaClientKnownRequestError)) return false;
  const col =
    error.meta &&
    typeof error.meta === "object" &&
    "column" in error.meta &&
    typeof (error.meta as { column?: unknown }).column === "string"
      ? String((error.meta as { column: string }).column).toLowerCase()
      : "";
  if (col.includes("jobdescriptionurl")) return true;
  const m = error.message.toLowerCase();
  return error.code === "P2022" && m.includes("jobdescriptionurl");
}

export async function POST(request: NextRequest) {
  if (!process.env.THG_FORM_INTEGRATION_SECRET?.trim()) {
    return integrationSecretMissingResponse();
  }
  if (!verifyIntegrationSecret(request)) {
    return integrationUnauthorizedResponse();
  }

  let json: unknown;
  try {
    json = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = contactIngestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const createdAt = new Date(d.createdAt);
  const updatedAt = new Date(d.updatedAt);

  const baseCreate = {
    id: d.id,
    companyName: d.companyName ?? null,
    contactName: d.contactName,
    email: d.email,
    phone: d.phone,
    city: d.city,
    industry: d.industry ?? null,
    openPositions: d.openPositions ?? null,
    payBand: d.payBand ?? null,
    message: d.message,
    status: d.status,
    notes: d.notes ?? null,
    createdAt,
    updatedAt,
  };

  const baseUpdate = {
    companyName: d.companyName ?? null,
    contactName: d.contactName,
    email: d.email,
    phone: d.phone,
    city: d.city,
    industry: d.industry ?? null,
    openPositions: d.openPositions ?? null,
    payBand: d.payBand ?? null,
    message: d.message,
    status: d.status,
    notes: d.notes ?? null,
    updatedAt,
  };

  const jd = d.jobDescriptionUrl ?? null;

  try {
    try {
      await prisma.crmContact.upsert({
        where: { id: d.id },
        create: { ...baseCreate, jobDescriptionUrl: jd },
        update: { ...baseUpdate, jobDescriptionUrl: jd },
      });
    } catch (e) {
      if (isMissingJobDescriptionUrlColumn(e)) {
        console.warn(
          "[integrations/contact] crm_contacts.jobDescriptionUrl missing; upsert without it. Run prisma db push or prisma/sql/add_contact_job_description_url.sql"
        );
        await prisma.crmContact.upsert({
          where: { id: d.id },
          create: baseCreate,
          update: baseUpdate,
        });
      } else {
        throw e;
      }
    }
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code: string }).code)
        : "";
    console.error("[integrations/contact]", code || "", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: d.id });
}
