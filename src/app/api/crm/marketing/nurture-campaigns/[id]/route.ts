import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const campaign = await prisma.crmNurtureCampaign.findUnique({
      where: { id: params.id },
      include: {
        _count: { select: { members: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[crm/nurture-campaign] GET:", error);
    return NextResponse.json(
      { error: "Failed to load campaign" },
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
      name?: string;
      description?: string | null;
      isActive?: boolean;
    };

    const data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    } = {};

    if (body.name !== undefined) {
      const name = String(body.name).trim();
      if (!name) {
        return NextResponse.json(
          { error: "Name cannot be empty" },
          { status: 400 }
        );
      }
      data.name = name;
    }
    if (body.description !== undefined) {
      data.description = body.description?.trim() || null;
    }
    if (typeof body.isActive === "boolean") {
      data.isActive = body.isActive;
    }

    const campaign = await prisma.crmNurtureCampaign.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[crm/nurture-campaign] PATCH:", error);
    return NextResponse.json(
      { error: "Failed to update campaign" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.crmNurtureCampaign.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[crm/nurture-campaign] DELETE:", error);
    return NextResponse.json(
      { error: "Failed to delete campaign" },
      { status: 500 }
    );
  }
}
