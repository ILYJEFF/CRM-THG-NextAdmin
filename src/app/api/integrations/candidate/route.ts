import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { candidateIngestSchema } from "@/lib/crm/ingest-schemas";
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

  const parsed = candidateIngestSchema.safeParse(json);
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
    await prisma.crmCandidate.upsert({
      where: { id: d.id },
      create: {
        id: d.id,
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        currentLocation: d.currentLocation,
        desiredLocation: d.desiredLocation,
        industry: d.industry,
        positionType: d.positionType,
        resumeUrl: d.resumeUrl ?? null,
        coverLetter: d.coverLetter ?? null,
        status: d.status,
        notes: d.notes ?? null,
        createdAt,
        updatedAt,
      },
      update: {
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        currentLocation: d.currentLocation,
        desiredLocation: d.desiredLocation,
        industry: d.industry,
        positionType: d.positionType,
        resumeUrl: d.resumeUrl ?? null,
        coverLetter: d.coverLetter ?? null,
        status: d.status,
        notes: d.notes ?? null,
        updatedAt,
      },
    });
  } catch (e) {
    console.error("[integrations/candidate]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: d.id });
}
