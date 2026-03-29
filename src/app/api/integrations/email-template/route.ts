import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  integrationSecretMissingResponse,
  integrationUnauthorizedResponse,
  verifyIntegrationSecret,
} from "@/lib/crm/integration-secret";
import { ensureFormSubmitterTemplates } from "@/lib/crm/ensure-form-submitter-templates";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (!process.env.THG_FORM_INTEGRATION_SECRET?.trim()) {
    return integrationSecretMissingResponse();
  }
  if (!verifyIntegrationSecret(request)) {
    return integrationUnauthorizedResponse();
  }

  const slug = request.nextUrl.searchParams.get("slug")?.trim();
  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  try {
    await ensureFormSubmitterTemplates();
  } catch (e) {
    console.warn("[integrations/email-template] ensure submitter templates:", e);
  }

  try {
    const template = await prisma.crmMarketingEmailTemplate.findUnique({
      where: { slug },
    });

    if (!template) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let variables: string[] = [];
    if (template.variables) {
      try {
        const parsed = JSON.parse(template.variables) as unknown;
        if (Array.isArray(parsed) && parsed.every((v) => typeof v === "string")) {
          variables = parsed;
        }
      } catch {
        variables = [];
      }
    }

    return NextResponse.json({
      id: template.id,
      slug: template.slug,
      name: template.name,
      subject: template.subject,
      htmlBody: template.htmlBody,
      description: template.description,
      variables,
      category: template.category,
      isActive: template.isActive,
    });
  } catch (e) {
    console.error("[integrations/email-template]", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
