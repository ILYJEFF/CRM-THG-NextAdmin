import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";
import { createSesNodemailerTransport } from "@/lib/ses-transport";
import { getTestValueForTemplateVariable } from "@/lib/crm/test-template-vars";

export const dynamic = "force-dynamic";

function replaceVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, "g");
    result = result.replace(regex, String(value));
  }
  result = result.replace(/{{\s*\w+\s*}}/g, "");
  return result;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email?.trim()) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const template = await prisma.crmMarketingEmailTemplate.findUnique({
      where: { id: params.id },
    });

    if (!template) {
      return NextResponse.json({ error: "Template not found" }, { status: 404 });
    }

    const varNames: string[] = template.variables
      ? JSON.parse(template.variables)
      : [];
    const testData: Record<string, string> = {};
    for (const variable of varNames) {
      testData[variable] = getTestValueForTemplateVariable(variable);
    }

    const subject = replaceVariables(template.subject, testData);
    const html = replaceVariables(template.htmlBody, testData);

    const transporter: nodemailer.Transporter | null =
      createSesNodemailerTransport();

    if (!transporter) {
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    await transporter.sendMail({
      from: `Test <alert@thehammittgroup.com>`,
      to: email.trim(),
      subject: `[TEST] ${subject}`,
      html,
    });

    return NextResponse.json({ success: true, message: "Test email sent" });
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Failed to send test email";
    console.error("[crm/marketing/email-template/test]", error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
