import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCrmSessionUser } from "@/lib/crm/auth-crm";
import { prisma } from "@/lib/prisma";
import {
  isCrmS3Configured,
  uploadCrmContractToS3,
} from "@/lib/crm/s3-contracts";

export const dynamic = "force-dynamic";

const ALLOWED = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCrmSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clientId = params.id;
  const client = await prisma.crmClient.findUnique({
    where: { id: clientId },
    select: { id: true },
  });
  if (!client) {
    return NextResponse.json({ error: "Client not found" }, { status: 404 });
  }

  const ct = request.headers.get("content-type") || "";
  if (!ct.includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Use multipart/form-data with field file" },
      { status: 400 }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  const labelRaw = formData.get("label");

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Missing file" }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "File too large (max 12MB)" },
      { status: 400 }
    );
  }
  if (!ALLOWED.has(file.type)) {
    return NextResponse.json(
      { error: "Only PDF, DOC, and DOCX are allowed" },
      { status: 400 }
    );
  }

  if (!isCrmS3Configured()) {
    return NextResponse.json(
      {
        error:
          "S3 is not configured on the CRM. Set AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and S3_BUCKET_NAME, or paste a hosted document link in the client profile.",
      },
      { status: 503 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  let fileUrl: string;
  try {
    fileUrl = await uploadCrmContractToS3({
      buffer,
      fileName: file.name,
      contentType: file.type,
    });
  } catch (e) {
    console.error("[api/crm/clients/.../contracts]", e);
    return NextResponse.json({ error: "Upload to storage failed" }, { status: 500 });
  }

  const label =
    typeof labelRaw === "string" && labelRaw.trim()
      ? labelRaw.trim().slice(0, 200)
      : null;

  await prisma.crmClientContract.create({
    data: {
      clientId,
      label,
      fileUrl,
      fileName: file.name.slice(0, 500),
      mimeType: file.type,
    },
  });

  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);

  return NextResponse.json({ ok: true });
}
