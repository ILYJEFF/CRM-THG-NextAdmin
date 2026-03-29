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
    sort: current.sort,
    view: current.view,
  };

  const views = [
    { id: "leads" as const, label: "Leads" },
    { id: "clients" as const, label: "Clients" },
    { id: "all" as const, label: "All" },
  ];

  return (
    <div className="w-full">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
        View
      </p>
      <div className="grid grid-cols-3 gap-1 rounded-xl bg-zinc-100/90 p-1 ring-1 ring-zinc-200/70">
        {views.map((v) => {
          const href =
            v.id === "clients"
              ? `/admin${buildListSearchParams(
                  { ...base, view: v.id },
                  { page: null, status: null }
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
                "flex min-h-11 items-center justify-center rounded-lg px-2 text-center text-sm font-semibold transition",
                active === v.id
                  ? "bg-white text-zinc-950 shadow-sm ring-1 ring-zinc-200/80"
                  : "text-zinc-600 hover:text-zinc-900"
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
