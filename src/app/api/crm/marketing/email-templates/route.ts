import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureFormSubmitterTemplates } from "@/lib/crm/ensure-form-submitter-templates";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    try {
      await ensureFormSubmitterTemplates();
    } catch (e) {
      console.warn("[crm/marketing/email-templates] ensure:", e);
    }

    const templates = await prisma.crmMarketingEmailTemplate.findMany({
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return NextResponse.json(templates);
  } catch (error) {
    console.error("[crm/marketing/email-templates] GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch templates" },
      { status: 500 }
    );
  }
}
