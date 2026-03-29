import Link from "next/link";
import { buildListSearchParams, type ListQueryBase } from "@/lib/crm/list-query";

export function PaginationBar({
  listPath,
  current,
  page,
  totalPages,
}: {
  listPath: string;
  current: ListQueryBase;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  const base: ListQueryBase = {
    q: current.q,
    status: current.status,
    wp: current.wp,
    sort: current.sort,
  };

  const prev =
    page > 1
      ? `${listPath}${buildListSearchParams(base, { page: String(page - 1) })}`
      : null;
  const next =
    page < totalPages
      ? `${listPath}${buildListSearchParams(base, { page: String(page + 1) })}`
      : null;

  return (
    <nav
      className="flex items-center justify-between gap-4 border-t border-zinc-200/80 pt-4"
      aria-label="Pagination"
    >
      {prev ? (
        <Link
          href={prev}
          className="inline-flex min-h-12 min-w-[44%] flex-1 items-center justify-center rounded-2xl bg-white px-4 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200 transition active:bg-zinc-50 sm:min-w-0 sm:flex-none sm:px-6"
        >
          Previous
        </Link>
      ) : (
        <span className="min-h-12 min-w-[44%] flex-1 sm:min-w-0 sm:flex-none" />
      )}
      <p className="shrink-0 text-center text-sm text-zinc-600">
        Page {page} of {totalPages}
      </p>
      {next ? (
        <Link
          href={next}
          className="inline-flex min-h-12 min-w-[44%] flex-1 items-center justify-center rounded-2xl bg-[#0f1419] px-4 text-sm font-semibold text-white transition active:bg-zinc-800 sm:min-w-0 sm:flex-none sm:px-6"
        >
          Next
        </Link>
      ) : (
        <span className="min-h-12 min-w-[44%] flex-1 sm:min-w-0 sm:flex-none" />
      )}
    </nav>
  );
}
