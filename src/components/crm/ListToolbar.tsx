import type { ReactNode } from "react";
import Link from "next/link";
import { buildListSearchParams, type ListQueryBase } from "@/lib/crm/list-query";

function sortQueryBase(current: ListQueryBase) {
  return {
    q: current.q,
    status: current.status,
    view: current.view,
  };
}

export function ListToolbar({
  listPath,
  exportHref,
  current,
  sort,
  children,
}: {
  listPath: string;
  exportHref?: string | null;
  current: ListQueryBase;
  sort: "newest" | "oldest";
  children?: ReactNode;
}) {
  const q = sortQueryBase(current);
  const newestHref = `${listPath}${buildListSearchParams(q, { sort: null, page: null })}`;
  const oldestHref = `${listPath}${buildListSearchParams(q, { sort: "oldest", page: null })}`;

  return (
    <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex w-full gap-2 sm:w-auto sm:flex-wrap">
        <Link
          href={newestHref}
          className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold transition sm:flex-none ${
            sort === "newest"
              ? "bg-[#0f1419] text-white"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200"
          }`}
        >
          Newest
        </Link>
        <Link
          href={oldestHref}
          className={`inline-flex min-h-11 flex-1 items-center justify-center rounded-full px-4 text-sm font-semibold transition sm:flex-none ${
            sort === "oldest"
              ? "bg-[#0f1419] text-white"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200"
          }`}
        >
          Oldest
        </Link>
      </div>
      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end sm:gap-3">
        {children}
        {exportHref ? (
          <a
            href={exportHref}
            className="inline-flex min-h-11 min-w-0 flex-1 items-center justify-center rounded-full border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 shadow-sm transition hover:bg-zinc-50 sm:min-w-[8rem] sm:flex-none"
          >
            Export CSV
          </a>
        ) : null}
      </div>
    </div>
  );
}
