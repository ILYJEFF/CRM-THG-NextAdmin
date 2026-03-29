import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { contactWhere } from "@/lib/crm/list-query";

export const dynamic = "force-dynamic";

export default async function CompaniesPage() {
  const gate = await getCrmDbGate();
  if (gate.state === "db_error") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">
          Company accounts
        </h1>
        <p className="text-sm text-zinc-600">
          Data cannot load until the database connection works.
        </p>
      </div>
    );
  }

  const rows = await prisma.crmContact.findMany({
    where: {
      AND: [
        { companyName: { not: null } },
        contactWhere(undefined, undefined),
      ],
    },
    select: { companyName: true },
  });

  const counts = new Map<string, number>();
  for (const r of rows) {
    const name = r.companyName?.trim();
    if (!name) continue;
    counts.set(name, (counts.get(name) ?? 0) + 1);
  }

  const sorted = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Company accounts
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Grouped from open client lead forms that included a company name. Tap
          a row to search leads for that employer.
        </p>
      </div>

      <ul className="space-y-2 md:rounded-2xl md:border md:border-zinc-200/90 md:bg-white md:shadow-sm md:divide-y md:divide-zinc-100">
        {sorted.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500 md:border-0 md:bg-transparent">
            No company names on file yet. When leads submit with an
            organization, it will show here.
          </li>
        ) : (
          sorted.map(([name, n]) => (
            <li key={name}>
              <Link
                href={`/admin/contacts?q=${encodeURIComponent(name)}`}
                className="flex min-h-[3.5rem] items-center justify-between gap-4 rounded-2xl border border-zinc-200/90 bg-white px-4 py-3 shadow-sm transition active:scale-[0.99] hover:border-amber-200/80 md:border-0 md:shadow-none md:rounded-none"
              >
                <span className="min-w-0 flex-1 font-medium text-zinc-900">
                  {name}
                </span>
                <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-sm font-semibold tabular-nums text-zinc-700">
                  {n} lead{n === 1 ? "" : "s"}
                </span>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
