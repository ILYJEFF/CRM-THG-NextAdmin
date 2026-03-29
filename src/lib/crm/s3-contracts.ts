import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "us-east-2",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
});

const BUCKET =
  process.env.S3_BUCKET_NAME || process.env.AWS_S3_BUCKET_NAME || "";

export function isCrmS3Configured(): boolean {
  return !!(
    process.env.AWS_ACCESS_KEY_ID &&
    process.env.AWS_SECRET_ACCESS_KEY &&
    BUCKET
  );
}

export async function uploadCrmContractToS3(params: {
  buffer: Buffer;
  fileName: string;
  contentType: string;
}): Promise<string> {
  if (!BUCKET) {
    throw new Error(
      "S3_BUCKET_NAME or AWS_S3_BUCKET_NAME is not set on this deployment"
    );
  }
  const safe = params.fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
  const key = `crm-contracts/${Date.now()}-${safe}`;
  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: params.buffer,
      ContentType: params.contentType,
      ACL: "public-read",
    })
  );
  const region = process.env.AWS_REGION || "us-east-2";
  return `https://${BUCKET}.s3.${region}.amazonaws.com/${key}`;
}
