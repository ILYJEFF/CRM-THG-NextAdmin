import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; memberId: string } }
) {
  try {
    const member = await prisma.crmNurtureCampaignMember.findFirst({
      where: {
        id: params.memberId,
        campaignId: params.id,
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.crmNurtureCampaignMember.delete({
      where: { id: params.memberId },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[crm/nurture-member] DELETE:", error);
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    );
  }
}
