"use server";

import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  normalizeClientStatus,
  normalizeJobApplicationStatus,
  normalizeMarketingPipelineStage,
  normalizeTalentStatus,
  normalizeSubmissionStage,
  normalizeActivityType,
} from "@/lib/crm/pipeline";
import { getCrmSessionUser } from "@/lib/crm/auth-crm";
import { syncJobOrderToMarketing } from "@/lib/crm/marketing-career-sync";

export async function updateContactStatus(id: string, status: string) {
  const s = normalizeClientStatus(status.trim() || "new");
  await prisma.crmContact.update({
    where: { id },
    data: { status: s },
  });
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  revalidatePath(`/admin/contacts/${id}`);
}

export async function updateJobApplicationStatus(id: string, status: string) {
  const s = normalizeJobApplicationStatus(status);
  await prisma.crmJobApplication.update({
    where: { id },
    data: { status: s },
  });
  revalidatePath("/admin/applicants");
  revalidatePath("/admin");
}

export async function updateContactMarketingPipelineStage(
  id: string,
  pipelineStage: string
) {
  const stage = normalizeMarketingPipelineStage(pipelineStage);
  try {
    await prisma.crmContact.update({
      where: { id },
      data: { pipelineStage: stage },
    });
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2022"
    ) {
      console.warn(
        "[updateContactMarketingPipelineStage] pipelineStage column missing; run prisma migrate deploy."
      );
      return;
    }
    throw e;
  }
  revalidatePath("/admin/contacts");
  revalidatePath("/admin");
  revalidatePath(`/admin/contacts/${id}`);
}

export async function updateContactNotes(id: string, notes: string) {
  const n = notes.slice(0, 8000);
  await prisma.crmContact.update({
    where: { id },
    data: { notes: n || null },
  });
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
}

const CONTACT_MESSAGE_MAX = 50000;

export async function updateContactMessage(id: string, message: string) {
  const m = message.slice(0, CONTACT_MESSAGE_MAX);
  await prisma.crmContact.update({
    where: { id },
    data: { message: m },
  });
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
}

/** Removes stored inquiry text only; does not delete the lead row. */
export async function clearContactMessage(id: string) {
  await prisma.crmContact.update({
    where: { id },
    data: { message: "" },
  });
  revalidatePath("/admin/contacts");
  revalidatePath(`/admin/contacts/${id}`);
}

export async function updateCandidateStatus(id: string, status: string) {
  const s = normalizeTalentStatus(status.trim() || "new");
  await prisma.crmCandidate.update({
    where: { id },
    data: { status: s },
  });
  revalidatePath("/admin/candidates");
  revalidatePath("/admin");
  revalidatePath(`/admin/candidates/${id}`);
}

export async function updateCandidateNotes(
  id: string,
  notes: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const n = notes.slice(0, 8000);
  try {
    await prisma.crmCandidate.update({
      where: { id },
      data: { notes: n || null },
    });
  } catch {
    return {
      ok: false,
      error:
        "Notes could not be saved. Add the notes column to crm_candidates (see prisma/sql/add_candidate_notes.sql) or run prisma db push.",
    };
  }
  revalidatePath("/admin/candidates");
  revalidatePath(`/admin/candidates/${id}`);
  return { ok: true };
}

const contactSelectConvert = {
  id: true,
  companyName: true,
  contactName: true,
  email: true,
  phone: true,
  city: true,
  industry: true,
  notes: true,
  clientId: true,
} as const;

export async function convertContactToClient(
  contactId: string
): Promise<{ ok: true; clientId: string } | { ok: false; error: string }> {
  try {
    const c = await prisma.crmContact.findUnique({
      where: { id: contactId },
      select: contactSelectConvert,
    });
    if (!c) return { ok: false, error: "Lead not found." };
    if (c.clientId) {
      return { ok: false, error: "This lead is already linked to a client." };
    }

    const reviewDue = new Date();
    reviewDue.setDate(reviewDue.getDate() + 90);

    const baseClientData = {
      companyName: c.companyName,
      contactName: c.contactName,
      email: c.email,
      phone: c.phone,
      city: c.city,
      industry: c.industry,
      internalNotes: c.notes,
    };

    const client = await prisma.$transaction(async (tx) => {
      let cl;
      try {
        cl = await tx.crmClient.create({
          data: { ...baseClientData, nextReviewAt: reviewDue },
        });
      } catch (e) {
        if (
          e instanceof Prisma.PrismaClientKnownRequestError &&
          e.code === "P2022"
        ) {
          cl = await tx.crmClient.create({ data: baseClientData });
        } else {
          throw e;
        }
      }
      await tx.crmContact.update({
        where: { id: contactId },
        data: { clientId: cl.id, status: "converted" },
      });
      return cl;
    });

    revalidatePath("/admin/contacts");
    revalidatePath(`/admin/contacts/${contactId}`);
    revalidatePath("/admin/clients");
    revalidatePath("/admin");
    return { ok: true, clientId: client.id };
  } catch (e) {
    console.error("[convertContactToClient]", e);
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Could not convert lead. Check the database schema (prisma db push).",
    };
  }
}

export async function deleteContactLead(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const c = await prisma.crmContact.findUnique({
      where: { id },
      select: { clientId: true },
    });
    if (!c) return { ok: false, error: "Lead not found." };
    if (c.clientId) {
      return {
        ok: false,
        error:
          "This lead is linked to a client. Open the client profile to manage the relationship, or contact support to unlink.",
      };
    }
    await prisma.crmContact.delete({ where: { id } });
    revalidatePath("/admin/contacts");
    revalidatePath("/admin");
    return { ok: true };
  } catch (e) {
    console.error("[deleteContactLead]", e);
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Could not delete this lead.",
    };
  }
}

export async function updateClientInternalNotes(clientId: string, notes: string) {
  const n = notes.slice(0, 16000);
  await prisma.crmClient.update({
    where: { id: clientId },
    data: { internalNotes: n || null },
  });
  revalidatePath("/admin/clients");
  revalidatePath(`/admin/clients/${clientId}`);
}

const jobOrderCreateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  roleSummary: z.string().trim().max(4000).optional(),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
  notes: z.string().trim().max(16000).optional(),
});

export async function createJobOrder(
  clientId: string,
  raw: {
    title: string;
    roleSummary?: string;
    priority?: string;
    notes?: string;
  }
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = jobOrderCreateSchema.safeParse({
    title: raw.title,
    roleSummary: raw.roleSummary || undefined,
    priority: raw.priority || "normal",
    notes: raw.notes || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }
  const p = parsed.data;
  try {
    const row = await prisma.crmJobOrder.create({
      data: {
        clientId,
        title: p.title,
        roleSummary: p.roleSummary || null,
        priority: p.priority ?? "normal",
        notes: p.notes || null,
        status: "open",
      },
    });
    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath("/admin/clients");
    revalidatePath("/admin/jobs");
    return { ok: true, id: row.id };
  } catch (e) {
    console.error("[createJobOrder]", e);
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Could not create job order.",
    };
  }
}

export async function updateJobOrderStatus(id: string, status: string) {
  const s = (status || "open").trim().slice(0, 64);
  const row = await prisma.crmJobOrder.update({
    where: { id },
    data: { status: s },
    select: { clientId: true },
  });
  revalidatePath(`/admin/clients/${row.clientId}`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/jobs");
}

export async function updateJobOrderPriority(id: string, priority: string) {
  const p = (priority || "normal").trim().slice(0, 32);
  const row = await prisma.crmJobOrder.update({
    where: { id },
    data: { priority: p },
    select: { clientId: true },
  });
  revalidatePath(`/admin/clients/${row.clientId}`);
  revalidatePath("/admin/clients");
  revalidatePath("/admin/jobs");
}

export async function deleteJobOrder(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const row = await prisma.crmJobOrder.findUnique({
      where: { id },
      select: { clientId: true },
    });
    if (!row) return { ok: false, error: "Job order not found." };
    await prisma.crmJobOrder.delete({ where: { id } });
    revalidatePath(`/admin/clients/${row.clientId}`);
    revalidatePath("/admin/clients");
    revalidatePath("/admin/jobs");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not delete.",
    };
  }
}

const contractLinkSchema = z.object({
  label: z.string().trim().max(200).optional(),
  fileUrl: z.string().url().max(4000),
  fileName: z.string().trim().min(1).max(500),
});

export async function addClientContractLink(
  clientId: string,
  raw: { label?: string; fileUrl: string; fileName: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = contractLinkSchema.safeParse({
    label: raw.label,
    fileUrl: raw.fileUrl,
    fileName: raw.fileName,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid link" };
  }
  try {
    await prisma.crmClientContract.create({
      data: {
        clientId,
        label: parsed.data.label || null,
        fileUrl: parsed.data.fileUrl,
        fileName: parsed.data.fileName,
        mimeType: null,
      },
    });
    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath("/admin/clients");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save contract.",
    };
  }
}

export async function deleteClientContract(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const row = await prisma.crmClientContract.findUnique({
      where: { id },
      select: { clientId: true },
    });
    if (!row) return { ok: false, error: "Not found." };
    await prisma.crmClientContract.delete({ where: { id } });
    revalidatePath(`/admin/clients/${row.clientId}`);
    revalidatePath("/admin/clients");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not delete.",
    };
  }
}

const careerDraftSchema = z.object({
  publicDescription: z.string().max(120_000).optional(),
  publicLocation: z.string().max(200).optional(),
  publicEmploymentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "TEMPORARY", "INTERN"])
    .optional(),
  publicCompanyName: z.string().max(200).optional(),
  responsibilities: z.string().max(120_000).optional(),
  requirements: z.string().max(120_000).optional(),
  salaryMin: z.coerce.number().int().positive().optional().nullable(),
  salaryMax: z.coerce.number().int().positive().optional().nullable(),
  salaryPeriod: z.enum(["YEARLY", "MONTHLY", "HOURLY"]).optional().nullable(),
});

export async function saveJobOrderCareerDraft(
  jobOrderId: string,
  raw: Record<string, unknown>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = careerDraftSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid fields",
    };
  }
  const p = parsed.data;
  try {
    const row = await prisma.crmJobOrder.update({
      where: { id: jobOrderId },
      data: {
        publicDescription: p.publicDescription?.trim() || null,
        publicLocation: p.publicLocation?.trim() || null,
        publicEmploymentType: p.publicEmploymentType ?? "FULL_TIME",
        publicCompanyName: p.publicCompanyName?.trim() || null,
        responsibilities: p.responsibilities?.trim() || null,
        requirements: p.requirements?.trim() || null,
        salaryMin: p.salaryMin ?? null,
        salaryMax: p.salaryMax ?? null,
        salaryPeriod: p.salaryPeriod ?? null,
      },
      select: { clientId: true },
    });
    revalidatePath(`/admin/clients/${row.clientId}`);
    revalidatePath("/admin/jobs");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not save posting fields.",
    };
  }
}

function mapEmploymentType(
  s: string | null | undefined
):
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "TEMPORARY"
  | "INTERN" {
  const u = (s || "FULL_TIME").toUpperCase().replace(/-/g, "_");
  if (
    u === "FULL_TIME" ||
    u === "PART_TIME" ||
    u === "CONTRACT" ||
    u === "TEMPORARY" ||
    u === "INTERN"
  ) {
    return u;
  }
  return "FULL_TIME";
}

export async function syncJobOrderCareerPosting(
  jobOrderId: string,
  published: boolean
): Promise<{ ok: true } | { ok: false; error: string }> {
  const job = await prisma.crmJobOrder.findUnique({
    where: { id: jobOrderId },
    include: { client: true },
  });
  if (!job) return { ok: false, error: "Job order not found." };

  const description = (
    job.publicDescription ||
    job.roleSummary ||
    ""
  ).trim();
  const bodyDescription =
    description ||
    `We are recruiting for ${job.title}. Details will be shared with qualified applicants.`;

  const location = (
    job.publicLocation ||
    job.client.city ||
    "United States"
  ).trim();

  const companyName =
    job.publicCompanyName?.trim() ||
    job.client.companyName?.trim() ||
    job.client.contactName;

  const salaryPeriod =
    job.salaryPeriod === "YEARLY" ||
    job.salaryPeriod === "MONTHLY" ||
    job.salaryPeriod === "HOURLY"
      ? job.salaryPeriod
      : null;

  const result = await syncJobOrderToMarketing({
    jobOrderId: job.id,
    title: job.title,
    description: bodyDescription,
    location,
    employmentType: mapEmploymentType(job.publicEmploymentType),
    companyName,
    industry: job.client.industry ?? undefined,
    responsibilities: job.responsibilities ?? undefined,
    requirements: job.requirements ?? undefined,
    salaryMin: job.salaryMin ?? null,
    salaryMax: job.salaryMax ?? null,
    salaryPeriod,
    published,
  });

  const now = new Date();
  if (!result.ok) {
    await prisma.crmJobOrder.update({
      where: { id: jobOrderId },
      data: { careerLastSyncAt: now, careerLastError: result.error },
    });
    revalidatePath(`/admin/clients/${job.clientId}`);
    revalidatePath("/admin/jobs");
    return result;
  }

  await prisma.crmJobOrder.update({
    where: { id: jobOrderId },
    data: {
      careerPostingId: result.postingId,
      careerSlug: result.slug,
      careerPublishedAt: published ? now : null,
      careerLastSyncAt: now,
      careerLastError: null,
    },
  });
  revalidatePath(`/admin/clients/${job.clientId}`);
  revalidatePath("/admin/jobs");
  return { ok: true };
}

export async function assignCandidateToJobOrder(
  candidateId: string,
  jobOrderId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.crmSubmission.create({
      data: {
        candidateId,
        jobOrderId,
        stage: "triage",
      },
    });
  } catch (e: unknown) {
    const code =
      typeof e === "object" && e !== null && "code" in e
        ? String((e as { code: string }).code)
        : "";
    if (code === "P2002") {
      return { ok: false, error: "This candidate is already on that job order." };
    }
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not assign.",
    };
  }
  revalidatePath(`/admin/candidates/${candidateId}`);
  revalidatePath("/admin/jobs");
  revalidatePath("/admin/clients");
  return { ok: true };
}

export async function updateSubmissionStage(
  submissionId: string,
  stage: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const s = normalizeSubmissionStage(stage);
  try {
    const row = await prisma.crmSubmission.update({
      where: { id: submissionId },
      data: { stage: s },
      select: { candidateId: true, jobOrderId: true },
    });
    revalidatePath(`/admin/candidates/${row.candidateId}`);
    revalidatePath("/admin/jobs");
    const job = await prisma.crmJobOrder.findUnique({
      where: { id: row.jobOrderId },
      select: { clientId: true },
    });
    if (job) revalidatePath(`/admin/clients/${job.clientId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not update stage.",
    };
  }
}

export async function removeSubmission(
  submissionId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const row = await prisma.crmSubmission.findUnique({
      where: { id: submissionId },
      select: { candidateId: true, jobOrderId: true },
    });
    if (!row) return { ok: false, error: "Not found." };
    await prisma.crmSubmission.delete({ where: { id: submissionId } });
    revalidatePath(`/admin/candidates/${row.candidateId}`);
    revalidatePath("/admin/jobs");
    const job = await prisma.crmJobOrder.findUnique({
      where: { id: row.jobOrderId },
      select: { clientId: true },
    });
    if (job) revalidatePath(`/admin/clients/${job.clientId}`);
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not remove.",
    };
  }
}

const addActivitySchema = z.object({
  activityType: z.string().optional(),
  body: z.string().trim().min(1).max(16000),
});

export async function addCrmActivity(
  entityType: "contact" | "client" | "candidate",
  entityId: string,
  raw: { activityType?: string; body: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = addActivitySchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid activity",
    };
  }

  const user = await getCrmSessionUser();
  if (!user) {
    return { ok: false, error: "You must be signed in to log activity." };
  }

  if (entityType === "contact") {
    const row = await prisma.crmContact.findUnique({
      where: { id: entityId },
      select: { id: true },
    });
    if (!row) return { ok: false, error: "Lead not found." };
  } else if (entityType === "client") {
    const row = await prisma.crmClient.findUnique({
      where: { id: entityId },
      select: { id: true },
    });
    if (!row) return { ok: false, error: "Client not found." };
  } else {
    const row = await prisma.crmCandidate.findUnique({
      where: { id: entityId },
      select: { id: true },
    });
    if (!row) return { ok: false, error: "Candidate not found." };
  }

  try {
    await prisma.crmActivity.create({
      data: {
        entityType,
        entityId,
        activityType: normalizeActivityType(parsed.data.activityType ?? "note"),
        body: parsed.data.body,
        actorEmail: user.email ?? null,
      },
    });
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "Could not save activity. Run prisma/sql/add_crm_activities.sql or db push.",
    };
  }

  if (entityType === "contact") {
    revalidatePath(`/admin/contacts/${entityId}`);
    revalidatePath("/admin/contacts");
  } else if (entityType === "client") {
    revalidatePath(`/admin/clients/${entityId}`);
    revalidatePath("/admin/clients");
  } else {
    revalidatePath(`/admin/candidates/${entityId}`);
    revalidatePath("/admin/candidates");
  }
  revalidatePath("/admin");
  return { ok: true };
}
