import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.crmNurtureCampaign.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const members = await prisma.crmNurtureCampaignMember.findMany({
      where: { campaignId: params.id },
      orderBy: { createdAt: "desc" },
      take: 10000,
    });

    return NextResponse.json(members);
  } catch (error) {
    console.error("[crm/nurture-members] GET:", error);
    return NextResponse.json(
      { error: "Failed to load members" },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.crmNurtureCampaign.findUnique({
      where: { id: params.id },
      select: { id: true },
    });
    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const body = (await request.json()) as {
      email?: string;
      firstName?: string | null;
      lastName?: string | null;
      notes?: string | null;
      source?: string | null;
    };

    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json(
        { error: "Valid email is required" },
        { status: 400 }
      );
    }

    const member = await prisma.crmNurtureCampaignMember.upsert({
      where: {
        campaignId_email: {
          campaignId: params.id,
          email,
        },
      },
      create: {
        campaignId: params.id,
        email,
        firstName: body.firstName?.trim() || null,
        lastName: body.lastName?.trim() || null,
        notes: body.notes?.trim() || null,
        source: body.source?.trim() || "manual",
      },
      update: {
        firstName: body.firstName?.trim() || null,
        lastName: body.lastName?.trim() || null,
        notes: body.notes?.trim() || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error) {
    console.error("[crm/nurture-members] POST:", error);
    return NextResponse.json(
      { error: "Failed to add member" },
      { status: 500 }
    );
  }
}
