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

function isP2022(error: unknown): error is Prisma.PrismaClientKnownRequestError {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2022"
  );
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
  const pipelineStage = d.pipelineStage ?? "inbox";
  const jd = d.jobDescriptionUrl ?? null;

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

  const tries: { useJd: boolean; usePipeline: boolean }[] = [
    { useJd: true, usePipeline: true },
    { useJd: true, usePipeline: false },
    { useJd: false, usePipeline: true },
    { useJd: false, usePipeline: false },
  ];

  try {
    let lastError: unknown;
    for (const t of tries) {
      if (t.useJd && !jd) {
        continue;
      }
      const extraCreate: Record<string, unknown> = {};
      const extraUpdate: Record<string, unknown> = {};
      if (t.usePipeline) {
        extraCreate.pipelineStage = pipelineStage;
        extraUpdate.pipelineStage = pipelineStage;
      }
      if (t.useJd && jd) {
        extraCreate.jobDescriptionUrl = jd;
        extraUpdate.jobDescriptionUrl = jd;
      }
      try {
        await prisma.crmContact.upsert({
          where: { id: d.id },
          create: { ...baseCreate, ...extraCreate },
          update: { ...baseUpdate, ...extraUpdate },
        });
        return NextResponse.json({ ok: true, id: d.id });
      } catch (e) {
        lastError = e;
        if (!isP2022(e)) {
          throw e;
        }
      }
    }
    throw lastError;
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code: string }).code)
        : "";
    console.error("[integrations/contact]", code || "", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
