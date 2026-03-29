export const PAGE_SIZE = 25;

export function parsePage(raw: string | undefined): number {
  const n = parseInt(raw ?? "1", 10);
  if (!Number.isFinite(n) || n < 1) return 1;
  return n;
}

export function parseSort(
  raw: string | undefined
): "newest" | "oldest" {
  return raw === "oldest" ? "oldest" : "newest";
}

export function orderByCreatedAt(sort: "newest" | "oldest") {
  return sort === "oldest"
    ? ({ createdAt: "asc" } as const)
    : ({ createdAt: "desc" } as const);
}

export function totalPages(total: number): number {
  return Math.max(1, Math.ceil(total / PAGE_SIZE));
}
