import { prisma } from "@/lib/prisma";

const TALENT_SUBMITTER_SUBJECT =
  "We received your resume, {{firstName}}";

const CONTACT_SUBMITTER_SUBJECT = "Thanks for reaching out, {{contactName}}!";

const contactSubmitterHtml = (siteUrl: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f1f5f9;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,#b91c1c,#dc2626);padding:28px 24px;text-align:center;">
<p style="margin:0;color:#fff;font-size:20px;font-weight:700;">Thank you</p>
</td></tr>
<tr><td style="padding:32px 28px;">
<p style="margin:0 0 16px;color:#111827;font-size:16px;">Hi {{contactName}},</p>
<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
Thank you for contacting The Hammitt Group. We received your message and a member of our team will follow up soon.
</p>
<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
Explore <a href="${siteUrl}/openings" style="color:#dc2626;font-weight:600;">current openings</a> or learn more about <a href="${siteUrl}/services" style="color:#dc2626;font-weight:600;">our services</a>.
</p>
<p style="margin:28px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
Best,<br/><strong>The Hammitt Group</strong>
</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

const talentSubmitterHtml = (siteUrl: string) => `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/></head>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#f1f5f9;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f1f5f9;padding:32px 16px;">
<tr><td align="center">
<table role="presentation" width="600" style="max-width:600px;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
<tr><td style="background:linear-gradient(135deg,#1e3a5f,#2563eb);padding:28px 24px;text-align:center;">
<p style="margin:0;color:#fff;font-size:20px;font-weight:700;">The Hammitt Group</p>
<p style="margin:8px 0 0;color:#e0e7ff;font-size:14px;">Talent network</p>
</td></tr>
<tr><td style="padding:32px 28px;">
<p style="margin:0 0 16px;color:#111827;font-size:16px;">Hi {{firstName}},</p>
<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
Thanks for sharing your background with us. We have received your resume for <strong>{{positionType}}</strong> roles and our team will review it.
</p>
<p style="margin:0 0 16px;color:#374151;font-size:15px;line-height:1.6;">
While we match you with the right opportunities, you can explore open roles on our site anytime.
</p>
<p style="margin:24px 0 0;text-align:center;">
<a href="${siteUrl}/openings" style="display:inline-block;background:#dc2626;color:#fff!important;text-decoration:none;padding:12px 28px;border-radius:8px;font-weight:600;font-size:15px;">View openings</a>
</p>
<p style="margin:28px 0 0;color:#6b7280;font-size:14px;line-height:1.6;">
Best,<br/><strong>The Hammitt Group</strong>
</p>
</td></tr>
</table>
</td></tr></table>
</body></html>`;

export async function ensureFormSubmitterTemplates(): Promise<void> {
  const siteUrl = (
    process.env.NEXT_PUBLIC_MARKETING_URL || "https://www.thehammittgroup.com"
  ).replace(/\/$/, "");

  await prisma.crmMarketingEmailTemplate.upsert({
    where: { slug: "contact-response" },
    create: {
      slug: "contact-response",
      name: "Contact form thank-you (submitter)",
      category: "submitter",
      subject: CONTACT_SUBMITTER_SUBJECT,
      description:
        "Email the visitor receives after submitting the contact form. Internal team alerts are not controlled here.",
      variables: JSON.stringify(["contactName", "companyName"]),
      htmlBody: contactSubmitterHtml(siteUrl),
      isActive: true,
    },
    update: {
      category: "submitter",
      description:
        "Email the visitor receives after submitting the contact form. Internal team alerts are not controlled here.",
    },
  });

  await prisma.crmMarketingEmailTemplate.upsert({
    where: { slug: "talent-form-submitter" },
    create: {
      slug: "talent-form-submitter",
      name: "Talent / resume form thank-you",
      category: "submitter",
      subject: TALENT_SUBMITTER_SUBJECT,
      description:
        "Email the visitor receives after submitting the talent / resume form. Internal team alerts are not controlled here.",
      variables: JSON.stringify([
        "firstName",
        "lastName",
        "positionType",
        "siteUrl",
      ]),
      htmlBody: talentSubmitterHtml(siteUrl),
      isActive: true,
    },
    update: {
      category: "submitter",
      description:
        "Email the visitor receives after submitting the talent / resume form. Internal team alerts are not controlled here.",
    },
  });
}
