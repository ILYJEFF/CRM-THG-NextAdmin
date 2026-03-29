import type { Prisma } from "@prisma/client";

/**
 * All contact fields except `jobDescriptionUrl`. Use for list/detail/export so the app
 * still runs if `crm_contacts.jobDescriptionUrl` has not been migrated yet.
 * Load URLs with `loadContactJobDescriptionUrl` / `loadContactJobDescriptionUrlMap`.
 */
export const crmContactScalarSelect = {
  id: true,
  companyName: true,
  contactName: true,
  email: true,
  phone: true,
  city: true,
  industry: true,
  message: true,
  status: true,
  notes: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CrmContactSelect;

export type CrmContactScalar = Prisma.CrmContactGetPayload<{
  select: typeof crmContactScalarSelect;
}>;
