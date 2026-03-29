import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { marketingOptInIngestSchema } from "@/lib/crm/ingest-schemas";
import {
  integrationSecretMissingResponse,
  integrationUnauthorizedResponse,
  verifyIntegrationSecret,
} from "@/lib/crm/integration-secret";

export const dynamic = "force-dynamic";

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

  const parsed = marketingOptInIngestSchema.safeParse(json);
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
    await prisma.crmAgreedToMarketing.upsert({
      where: { id: d.id },
      create: {
        id: d.id,
        contactName: d.contactName,
        phone: d.phone,
        email: d.email.trim().toLowerCase(),
        companyName: d.companyName ?? null,
        jobTitle: d.jobTitle?.trim() || null,
        city: d.city,
        createdAt,
        updatedAt,
      },
      update: {
        contactName: d.contactName,
        phone: d.phone,
        email: d.email.trim().toLowerCase(),
        companyName: d.companyName ?? null,
        jobTitle: d.jobTitle?.trim() || null,
        city: d.city,
        updatedAt,
      },
    });
    return NextResponse.json({ ok: true, id: d.id });
  } catch (e) {
    console.error("[integrations/marketing-opt-in]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
