import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const campaigns = await prisma.crmNurtureCampaign.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        _count: { select: { members: true } },
      },
    });

    return NextResponse.json(campaigns);
  } catch (error) {
    console.error("[crm/nurture-campaigns] GET:", error);
    return NextResponse.json(
      { error: "Failed to load campaigns" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      name?: string;
      description?: string | null;
    };
    const name = String(body.name ?? "").trim();
    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    const campaign = await prisma.crmNurtureCampaign.create({
      data: {
        name,
        description: body.description?.trim() || null,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.error("[crm/nurture-campaigns] POST:", error);
    return NextResponse.json(
      { error: "Failed to create campaign" },
      { status: 500 }
    );
  }
}
