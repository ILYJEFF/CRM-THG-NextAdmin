import Link from "next/link";
import { buildListSearchParams, type ListQueryBase } from "@/lib/crm/list-query";

export function ListToolbar({
  listPath,
  exportHref,
  current,
  sort,
}: {
  listPath: string;
  exportHref?: string | null;
  current: ListQueryBase;
  sort: "newest" | "oldest";
}) {
  const q = { q: current.q, status: current.status };
  const newestHref = `${listPath}${buildListSearchParams(q, { sort: null, page: null })}`;
  const oldestHref = `${listPath}${buildListSearchParams(q, { sort: "oldest", page: null })}`;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap gap-2">
        <Link
          href={newestHref}
          className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition ${
            sort === "newest"
              ? "bg-[#0f1419] text-white"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200"
          }`}
        >
          Newest first
        </Link>
        <Link
          href={oldestHref}
          className={`inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold transition ${
            sort === "oldest"
              ? "bg-[#0f1419] text-white"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200"
          }`}
        >
          Oldest first
        </Link>
      </div>
      {exportHref ? (
        <a
          href={exportHref}
          className="inline-flex min-h-11 items-center justify-center rounded-2xl border-2 border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-900 transition active:bg-zinc-50"
        >
          Export CSV
        </a>
      ) : null}
    </div>
  );
}
