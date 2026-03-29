import Link from "next/link";
import {
  buildListSearchParams,
  parseDeskView,
  type ListQueryBase,
} from "@/lib/crm/list-query";
import { cn } from "@/lib/cn";

export function DeskViewLinks({ current }: { current: ListQueryBase }) {
  const active = parseDeskView(current.view);
  const base: Record<string, string | undefined> = {
    q: current.q,
    status: current.status,
    wp: current.wp,
    sort: current.sort,
  };

  const views = [
    { id: "leads" as const, label: "Leads" },
    { id: "clients" as const, label: "Clients" },
    { id: "all" as const, label: "All" },
  ];

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/50 p-3 sm:p-4">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
        View
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        {views.map((v) => {
          const href =
            v.id === "clients"
              ? `/admin${buildListSearchParams(
                  { ...base, view: v.id },
                  { page: null, status: null, wp: null }
                )}`
              : `/admin${buildListSearchParams(
                  { ...base, view: v.id },
                  { page: null }
                )}`;
          return (
            <Link
              key={v.id}
              href={href}
              scroll={false}
              className={cn(
                "inline-flex min-h-12 flex-1 items-center justify-center rounded-full px-5 text-sm font-semibold transition sm:min-w-[7rem] sm:flex-none",
                active === v.id
                  ? "bg-[#0f1419] text-white shadow-md"
                  : "bg-white text-zinc-700 ring-1 ring-zinc-200 hover:bg-zinc-50"
              )}
            >
              {v.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
