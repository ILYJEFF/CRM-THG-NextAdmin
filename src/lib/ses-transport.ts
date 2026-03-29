import nodemailer from "nodemailer";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";
import type SESTransport from "nodemailer/lib/ses-transport";

export function createSesNodemailerTransport(): nodemailer.Transporter | null {
  const awsAccessKey = process.env.AWS_ACCESS_KEY_ID;
  const awsSecretKey = process.env.AWS_SECRET_ACCESS_KEY;
  const awsRegion = process.env.AWS_REGION || "us-east-2";

  if (!awsAccessKey || !awsSecretKey) {
    return null;
  }

  const sesClient = new SESv2Client({
    region: awsRegion,
    credentials: {
      accessKeyId: awsAccessKey,
      secretAccessKey: awsSecretKey,
    },
  });

  const sesOptions = {
    SES: { sesClient, SendEmailCommand },
  } as unknown as SESTransport.Options;

  return nodemailer.createTransport(sesOptions);
}
