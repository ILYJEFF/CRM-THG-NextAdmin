import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const template = await prisma.crmMarketingEmailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    console.error("[crm/marketing/email-template] GET:", error);
    return NextResponse.json(
      { error: "Failed to fetch template" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = (await request.json()) as {
      subject?: string;
      htmlBody?: string;
      name?: string;
      description?: string | null;
      isActive?: boolean;
    };

    const template = await prisma.crmMarketingEmailTemplate.update({
      where: { id: params.id },
      data: {
        ...(body.subject !== undefined && { subject: body.subject }),
        ...(body.htmlBody !== undefined && { htmlBody: body.htmlBody }),
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && {
          description: body.description,
        }),
        ...(body.isActive !== undefined && { isActive: body.isActive }),
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("[crm/marketing/email-template] PATCH:", error);
    return NextResponse.json(
      { error: "Failed to update template" },
      { status: 500 }
    );
  }
}
