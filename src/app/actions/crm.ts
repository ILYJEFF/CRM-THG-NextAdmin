"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import {
  normalizeClientStatus,
  normalizeTalentStatus,
} from "@/lib/crm/pipeline";

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

export async function updateContactNotes(id: string, notes: string) {
  const n = notes.slice(0, 8000);
  await prisma.crmContact.update({
    where: { id },
    data: { notes: n || null },
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

    const client = await prisma.$transaction(async (tx) => {
      const cl = await tx.crmClient.create({
        data: {
          companyName: c.companyName,
          contactName: c.contactName,
          email: c.email,
          phone: c.phone,
          city: c.city,
          industry: c.industry,
          internalNotes: c.notes,
        },
      });
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
