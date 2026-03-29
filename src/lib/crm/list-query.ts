import type { Prisma } from "@prisma/client";

export function buildListSearchParams(
  current: Record<string, string | undefined>,
  patch: Record<string, string | undefined | null>
): string {
  const p = new URLSearchParams();
  const merged = { ...current, ...patch };
  for (const [k, v] of Object.entries(merged)) {
    if (v != null && v !== "") p.set(k, v);
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function contactWhere(
  q?: string | null,
  status?: string | null
): Prisma.CrmContactWhereInput {
  const parts: Prisma.CrmContactWhereInput[] = [];
  const trimmed = q?.trim();
  if (trimmed) {
    parts.push({
      OR: [
        { contactName: { contains: trimmed, mode: "insensitive" } },
        { email: { contains: trimmed, mode: "insensitive" } },
        { companyName: { contains: trimmed, mode: "insensitive" } },
        { city: { contains: trimmed, mode: "insensitive" } },
        { phone: { contains: trimmed } },
        { message: { contains: trimmed, mode: "insensitive" } },
      ],
    });
  }
  if (status?.trim()) {
    parts.push({ status: status.trim() });
  }
  if (parts.length === 0) return {};
  if (parts.length === 1) return parts[0];
  return { AND: parts };
}

/** Base query keys carried across list filters (pagination, sort, search). */
export type ListQueryBase = {
  q?: string;
  status?: string;
  sort?: string;
  page?: string;
};

export function listQueryFromSearchParams(
  sp: Record<string, string | string[] | undefined>
): ListQueryBase {
  const g = (k: string) => {
    const v = sp[k];
    return typeof v === "string" ? v : undefined;
  };
  return {
    q: g("q"),
    status: g("status"),
    sort: g("sort"),
    page: g("page"),
  };
}

export function clientWhere(q?: string | null): Prisma.CrmClientWhereInput {
  const trimmed = q?.trim();
  if (!trimmed) return {};
  return {
    OR: [
      { contactName: { contains: trimmed, mode: "insensitive" } },
      { email: { contains: trimmed, mode: "insensitive" } },
      { companyName: { contains: trimmed, mode: "insensitive" } },
      { city: { contains: trimmed, mode: "insensitive" } },
      { phone: { contains: trimmed } },
    ],
  };
}

export function candidateWhere(
  q?: string | null,
  status?: string | null
): Prisma.CrmCandidateWhereInput {
  const parts: Prisma.CrmCandidateWhereInput[] = [];
  const trimmed = q?.trim();
  if (trimmed) {
    parts.push({
      OR: [
        { firstName: { contains: trimmed, mode: "insensitive" } },
        { lastName: { contains: trimmed, mode: "insensitive" } },
        { email: { contains: trimmed, mode: "insensitive" } },
        { phone: { contains: trimmed } },
        { positionType: { contains: trimmed, mode: "insensitive" } },
        { industry: { contains: trimmed, mode: "insensitive" } },
        { currentLocation: { contains: trimmed, mode: "insensitive" } },
        { desiredLocation: { contains: trimmed, mode: "insensitive" } },
      ],
    });
  }
  if (status?.trim()) {
    parts.push({ status: status.trim() });
  }
  if (parts.length === 0) return {};
  if (parts.length === 1) return parts[0];
  return { AND: parts };
}
