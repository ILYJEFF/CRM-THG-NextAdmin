/**
 * Push job orders from CRM to the marketing site's JobPosting table.
 * Requires THG_FORM_INTEGRATION_SECRET on both deployments (same value).
 */

export type CareerSyncPayload = {
  jobOrderId: string;
  title: string;
  description: string;
  location: string;
  employmentType:
    | "FULL_TIME"
    | "PART_TIME"
    | "CONTRACT"
    | "TEMPORARY"
    | "INTERN";
  companyName?: string;
  industry?: string;
  responsibilities?: string;
  requirements?: string;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryPeriod?: "YEARLY" | "MONTHLY" | "HOURLY" | null;
  published: boolean;
};

export type CareerSyncResult =
  | {
      ok: true;
      postingId: string;
      slug: string;
      publicUrl: string;
      published: boolean;
    }
  | { ok: false; error: string };

function getMarketingJobIntegrationUrl(): { ok: true; url: string; secret: string } | { ok: false; error: string } {
  const secret = process.env.THG_FORM_INTEGRATION_SECRET?.trim();
  if (!secret) {
    return {
      ok: false,
      error:
        "THG_FORM_INTEGRATION_SECRET is not set on the CRM deployment.",
    };
  }
  const base = (
    process.env.THG_MARKETING_SITE_URL ||
    process.env.NEXT_PUBLIC_MARKETING_URL ||
    "https://www.thehammittgroup.com"
  )
    .replace(/\/$/, "")
    .trim();
  if (!base.startsWith("http")) {
    return { ok: false, error: "Invalid marketing site URL in env." };
  }
  return { ok: true, url: `${base}/api/integrations/crm-job-posting`, secret };
}

export async function syncJobOrderToMarketing(
  payload: CareerSyncPayload
): Promise<CareerSyncResult> {
  const cfg = getMarketingJobIntegrationUrl();
  if (!cfg.ok) return { ok: false, error: cfg.error };

  try {
    const res = await fetch(cfg.url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${cfg.secret}`,
        "X-THG-Integration-Secret": cfg.secret,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let json: { ok?: boolean; error?: string; id?: string; slug?: string; publicUrl?: string; published?: boolean };
    try {
      json = JSON.parse(text) as typeof json;
    } catch {
      return {
        ok: false,
        error: `Marketing site returned non-JSON (${res.status}): ${text.slice(0, 200)}`,
      };
    }
    if (!res.ok || json.ok !== true) {
      return {
        ok: false,
        error: json.error || `Marketing site error (${res.status})`,
      };
    }
    if (!json.id || !json.slug || !json.publicUrl) {
      return { ok: false, error: "Marketing site response missing fields." };
    }
    return {
      ok: true,
      postingId: json.id,
      slug: json.slug,
      publicUrl: json.publicUrl,
      published: Boolean(json.published),
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, error: msg };
  }
}
