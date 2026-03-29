import type { Prisma } from "@prisma/client";

/**
 * All candidate fields except `notes`. Use for list/detail/export so the app
 * still runs if `crm_candidates.notes` has not been migrated yet (Prisma
 * otherwise generates SELECT * and Postgres errors on missing column).
 */
export const crmCandidateScalarSelect = {
  id: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  currentLocation: true,
  desiredLocation: true,
  industry: true,
  positionType: true,
  resumeUrl: true,
  coverLetter: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CrmCandidateSelect;

export type CrmCandidateScalar = Prisma.CrmCandidateGetPayload<{
  select: typeof crmCandidateScalarSelect;
}>;
