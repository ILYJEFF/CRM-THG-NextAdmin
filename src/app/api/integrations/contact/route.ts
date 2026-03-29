import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactIngestSchema } from "@/lib/crm/ingest-schemas";
import {
  integrationSecretMissingResponse,
  integrationUnauthorizedResponse,
  verifyIntegrationSecret,
} from "@/lib/crm/integration-secret";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!process.env.THG_FORM_INTEGRATION_SECRET) {
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

  try {
    await prisma.crmContact.upsert({
      where: { id: d.id },
      create: {
        id: d.id,
        companyName: d.companyName ?? null,
        contactName: d.contactName,
        email: d.email,
        phone: d.phone,
        city: d.city,
        industry: d.industry ?? null,
        message: d.message,
        status: d.status,
        notes: d.notes ?? null,
        createdAt,
        updatedAt,
      },
      update: {
        companyName: d.companyName ?? null,
        contactName: d.contactName,
        email: d.email,
        phone: d.phone,
        city: d.city,
        industry: d.industry ?? null,
        message: d.message,
        status: d.status,
        notes: d.notes ?? null,
        updatedAt,
      },
    });
  } catch (e) {
    console.error("[integrations/contact]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: d.id });
}
