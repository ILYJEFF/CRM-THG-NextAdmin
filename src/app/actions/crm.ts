"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
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

export async function updateCandidateNotes(id: string, notes: string) {
  const n = notes.slice(0, 8000);
  await prisma.crmCandidate.update({
    where: { id },
    data: { notes: n || null },
  });
  revalidatePath("/admin/candidates");
  revalidatePath(`/admin/candidates/${id}`);
}
