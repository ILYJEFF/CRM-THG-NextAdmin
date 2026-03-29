import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { jobApplicationIngestSchema } from "@/lib/crm/ingest-schemas";
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

  const parsed = jobApplicationIngestSchema.safeParse(json);
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
    await prisma.crmJobApplication.upsert({
      where: { id: d.id },
      create: {
        id: d.id,
        jobPostingId: d.jobPostingId,
        jobTitle: d.jobTitle ?? null,
        jobCompanyName: d.jobCompanyName ?? null,
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        currentLocation: d.currentLocation ?? null,
        coverLetter: d.coverLetter ?? null,
        resumeUrl: d.resumeUrl,
        status: d.status,
        notes: d.notes ?? null,
        createdAt,
        updatedAt,
      },
      update: {
        jobPostingId: d.jobPostingId,
        jobTitle: d.jobTitle ?? null,
        jobCompanyName: d.jobCompanyName ?? null,
        firstName: d.firstName,
        lastName: d.lastName,
        email: d.email,
        phone: d.phone,
        currentLocation: d.currentLocation ?? null,
        coverLetter: d.coverLetter ?? null,
        resumeUrl: d.resumeUrl,
        status: d.status,
        notes: d.notes ?? null,
        updatedAt,
      },
    });
  } catch (e) {
    const code =
      e && typeof e === "object" && "code" in e
        ? String((e as { code: string }).code)
        : "";
    console.error("[integrations/job-application]", code || "", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: d.id });
}
