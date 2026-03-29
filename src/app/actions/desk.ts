"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { PLAYBOOK_DEFAULT_SECTIONS } from "@/lib/crm/playbook-defaults";

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .max(64)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Use lowercase letters, numbers, and hyphens only"
  );

export async function seedPlaybookDefaults(): Promise<
  { ok: true; created: number } | { ok: false; error: string }
> {
  try {
    let created = 0;
    for (const row of PLAYBOOK_DEFAULT_SECTIONS) {
      const existing = await prisma.crmPlaybookSection.findUnique({
        where: { slug: row.slug },
      });
      if (existing) continue;
      await prisma.crmPlaybookSection.create({
        data: {
          slug: row.slug,
          eyebrow: row.eyebrow,
          title: row.title,
          sortOrder: row.sortOrder,
          body: row.body,
        },
      });
      created += 1;
    }
    revalidatePath("/admin/playbook");
    revalidatePath("/admin/playbook/manage");
    return { ok: true, created };
  } catch (e) {
    console.error("[seedPlaybookDefaults]", e);
    return {
      ok: false,
      error:
        e instanceof Error
          ? e.message
          : "Could not seed. Run prisma migrate deploy or prisma db push, then retry.",
    };
  }
}

const createSectionSchema = z.object({
  slug: slugSchema,
  eyebrow: z.string().max(120).optional(),
  title: z.string().trim().min(1).max(200),
  body: z.string().max(100000),
});

export async function createPlaybookSection(
  raw: z.infer<typeof createSectionSchema>
): Promise<{ ok: true; slug: string } | { ok: false; error: string }> {
  const parsed = createSectionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const p = parsed.data;
  try {
    const max = await prisma.crmPlaybookSection.aggregate({
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;
    await prisma.crmPlaybookSection.create({
      data: {
        slug: p.slug,
        eyebrow: (p.eyebrow ?? "").trim(),
        title: p.title,
        body: p.body,
        sortOrder,
      },
    });
    revalidatePath("/admin/playbook");
    revalidatePath("/admin/playbook/manage");
    return { ok: true, slug: p.slug };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Could not create section";
    if (msg.includes("Unique constraint")) {
      return { ok: false, error: "That slug is already in use." };
    }
    return { ok: false, error: msg };
  }
}

const updateSectionSchema = z.object({
  eyebrow: z.string().max(120).optional(),
  title: z.string().trim().min(1).max(200).optional(),
  body: z.string().max(100000).optional(),
});

export async function updatePlaybookSection(
  slug: string,
  raw: z.infer<typeof updateSectionSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = updateSectionSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const data = parsed.data;
  if (Object.keys(data).length === 0) {
    return { ok: false, error: "Nothing to update." };
  }
  try {
    await prisma.crmPlaybookSection.update({
      where: { slug },
      data,
    });
    revalidatePath("/admin/playbook");
    revalidatePath("/admin/playbook/manage");
    revalidatePath(`/admin/playbook/sections/${encodeURIComponent(slug)}/edit`);
    return { ok: true };
  } catch {
    return { ok: false, error: "Section not found or could not save." };
  }
}

export async function deletePlaybookSection(
  id: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await prisma.crmPlaybookSection.delete({ where: { id } });
    revalidatePath("/admin/playbook");
    revalidatePath("/admin/playbook/manage");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete section." };
  }
}

export async function movePlaybookSection(
  id: string,
  direction: "up" | "down"
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const sections = await prisma.crmPlaybookSection.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, sortOrder: true },
    });
    const idx = sections.findIndex((s) => s.id === id);
    if (idx < 0) return { ok: false, error: "Not found." };
    const swapWith = direction === "up" ? idx - 1 : idx + 1;
    if (swapWith < 0 || swapWith >= sections.length) {
      return { ok: true };
    }
    const a = sections[idx];
    const b = sections[swapWith];
    await prisma.$transaction([
      prisma.crmPlaybookSection.update({
        where: { id: a.id },
        data: { sortOrder: b.sortOrder },
      }),
      prisma.crmPlaybookSection.update({
        where: { id: b.id },
        data: { sortOrder: a.sortOrder },
      }),
    ]);
    revalidatePath("/admin/playbook");
    revalidatePath("/admin/playbook/manage");
    return { ok: true };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not reorder.",
    };
  }
}

function parseOptionalDateInput(
  v: string | null | undefined
): Date | null {
  if (v == null || String(v).trim() === "") return null;
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? null : d;
}

const commercialSchema = z.object({
  engagementType: z.string().trim().max(120).optional().nullable(),
  feeSummary: z.string().max(32000).optional().nullable(),
  warrantySummary: z.string().max(32000).optional().nullable(),
  commercialNotes: z.string().max(32000).optional().nullable(),
  agreementRenewalAt: z.string().max(40).optional().nullable(),
  nextReviewAt: z.string().max(40).optional().nullable(),
  lastReviewAt: z.string().max(40).optional().nullable(),
});

export async function updateClientCommercial(
  clientId: string,
  raw: z.infer<typeof commercialSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = commercialSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const p = parsed.data;
  try {
    await prisma.crmClient.update({
      where: { id: clientId },
      data: {
        engagementType: p.engagementType?.trim() || null,
        feeSummary: p.feeSummary?.trim() || null,
        warrantySummary: p.warrantySummary?.trim() || null,
        commercialNotes: p.commercialNotes?.trim() || null,
        agreementRenewalAt: parseOptionalDateInput(p.agreementRenewalAt),
        nextReviewAt: parseOptionalDateInput(p.nextReviewAt),
        lastReviewAt: parseOptionalDateInput(p.lastReviewAt),
      },
    });
    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath("/admin/clients");
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save commercial fields." };
  }
}

export async function markClientReviewComplete(
  clientId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const now = new Date();
  const next = new Date(now);
  next.setDate(next.getDate() + 90);
  try {
    await prisma.crmClient.update({
      where: { id: clientId },
      data: { lastReviewAt: now, nextReviewAt: next },
    });
    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update review dates." };
  }
}

const taskCreateSchema = z.object({
  title: z.string().trim().min(1).max(240),
  description: z.string().max(8000).optional().nullable(),
  dueAt: z.string().max(40).optional().nullable(),
});

export async function createAccountTask(
  clientId: string,
  raw: z.infer<typeof taskCreateSchema>
): Promise<{ ok: true; id: string } | { ok: false; error: string }> {
  const parsed = taskCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const p = parsed.data;
  try {
    const max = await prisma.crmAccountTask.aggregate({
      where: { clientId },
      _max: { sortOrder: true },
    });
    const sortOrder = (max._max.sortOrder ?? -1) + 1;
    const row = await prisma.crmAccountTask.create({
      data: {
        clientId,
        title: p.title,
        description: p.description?.trim() || null,
        dueAt: parseOptionalDateInput(p.dueAt),
        sortOrder,
      },
    });
    revalidatePath(`/admin/clients/${clientId}`);
    revalidatePath("/admin");
    return { ok: true, id: row.id };
  } catch (e) {
    return {
      ok: false,
      error:
        e instanceof Error ? e.message : "Could not create task. Run db push.",
    };
  }
}

export async function toggleAccountTaskComplete(
  taskId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const row = await prisma.crmAccountTask.findUnique({
      where: { id: taskId },
      select: { id: true, clientId: true, completedAt: true },
    });
    if (!row) return { ok: false, error: "Task not found." };
    await prisma.crmAccountTask.update({
      where: { id: taskId },
      data: { completedAt: row.completedAt ? null : new Date() },
    });
    revalidatePath(`/admin/clients/${row.clientId}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not update task." };
  }
}

export async function deleteAccountTask(
  taskId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const row = await prisma.crmAccountTask.findUnique({
      where: { id: taskId },
      select: { clientId: true },
    });
    if (!row) return { ok: false, error: "Not found." };
    await prisma.crmAccountTask.delete({ where: { id: taskId } });
    revalidatePath(`/admin/clients/${row.clientId}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not delete task." };
  }
}

const taskUpdateSchema = z.object({
  title: z.string().trim().min(1).max(240).optional(),
  description: z.string().max(8000).optional().nullable(),
  dueAt: z.string().max(40).optional().nullable(),
});

export async function updateAccountTask(
  taskId: string,
  raw: z.infer<typeof taskUpdateSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  const parsed = taskUpdateSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid" };
  }
  const p = parsed.data;
  try {
    const row = await prisma.crmAccountTask.findUnique({
      where: { id: taskId },
      select: { clientId: true },
    });
    if (!row) return { ok: false, error: "Not found." };
    await prisma.crmAccountTask.update({
      where: { id: taskId },
      data: {
        ...(p.title !== undefined ? { title: p.title } : {}),
        ...(p.description !== undefined
          ? { description: p.description?.trim() || null }
          : {}),
        ...(p.dueAt !== undefined
          ? { dueAt: parseOptionalDateInput(p.dueAt) }
          : {}),
      },
    });
    revalidatePath(`/admin/clients/${row.clientId}`);
    revalidatePath("/admin");
    return { ok: true };
  } catch {
    return { ok: false, error: "Could not save task." };
  }
}
