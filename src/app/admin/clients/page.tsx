import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatCrm } from "@/lib/crm/datetime";
import { SearchForm } from "@/components/crm/SearchForm";
import { ListToolbar } from "@/components/crm/ListToolbar";
import { PaginationBar } from "@/components/crm/PaginationBar";
import { clientWhere, listQueryFromSearchParams } from "@/lib/crm/list-query";
import {
  PAGE_SIZE,
  orderByCreatedAt,
  parsePage,
  parseSort,
  totalPages,
} from "@/lib/crm/pagination";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { ClientsModulePlaceholder } from "@/components/crm/ClientsModulePlaceholder";
import { ClickableTableRow } from "@/components/crm/ClickableTableRow";

export const dynamic = "force-dynamic";

const LIST_PATH = "/admin/clients";

function SearchFallback() {
  return (
    <div
      className="min-h-12 animate-pulse rounded-2xl bg-zinc-200/60"
      aria-hidden
    />
  );
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const gate = await getCrmDbGate();
  if (gate.state !== "ok") {
    return <ClientsModulePlaceholder gate={gate} />;
  }

  const lq = listQueryFromSearchParams(searchParams);
  const q = lq.q;
  const sort = parseSort(lq.sort);
  const page = parsePage(lq.page);

  const where = clientWhere(q);
  const orderBy = orderByCreatedAt(sort);

  const total = await prisma.crmClient.count({ where });
  const pages = totalPages(total);
  const safePage = Math.min(Math.max(1, page), pages);

  const clients = await prisma.crmClient.findMany({
    where,
    orderBy,
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: {
      id: true,
      companyName: true,
      contactName: true,
      email: true,
      city: true,
      createdAt: true,
      _count: { select: { jobOrders: true, contracts: true } },
    },
  });

  const chipBase = { q, sort };

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Active clients
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
          Converted leads live here. Track multiple job orders and store
          contracts per account.
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Showing {clients.length} of {total} (page {safePage} of {pages}).
        </p>
      </div>

      <Suspense fallback={<SearchFallback />}>
        <SearchForm placeholder="Search name, email, company, city…" />
      </Suspense>

      <ListToolbar listPath={LIST_PATH} current={lq} sort={sort} />

      <ul className="space-y-3 md:hidden">
        {clients.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
            No clients yet. Convert a lead from a lead profile to create one.
          </li>
        ) : (
          clients.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/clients/${c.id}`}
                className="block rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition active:scale-[0.99] hover:border-amber-200/80"
              >
                <p className="font-semibold text-zinc-900">{c.contactName}</p>
                {c.companyName ? (
                  <p className="mt-0.5 text-sm text-zinc-600">{c.companyName}</p>
                ) : null}
                <p className="mt-2 truncate text-sm text-zinc-500">{c.email}</p>
                <p className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-zinc-600">
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-amber-900 ring-1 ring-amber-200/80">
                    {c._count.jobOrders} job order
                    {c._count.jobOrders === 1 ? "" : "s"}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-zinc-700 ring-1 ring-zinc-200/80">
                    {c._count.contracts} contract
                    {c._count.contracts === 1 ? "" : "s"}
                  </span>
                </p>
                <p className="mt-3 text-xs text-zinc-400">
                  Since {formatCrm(c.createdAt, "MMM d, yyyy")}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Client
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Email
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Market
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Job orders
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Contracts
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Since
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {clients.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No clients match this view.
                  </td>
                </tr>
              ) : (
                clients.map((c) => (
                  <ClickableTableRow
                    key={c.id}
                    href={`/admin/clients/${c.id}`}
                  >
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-zinc-900">
                        {c.contactName}
                      </span>
                      {c.companyName ? (
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          {c.companyName}
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-[200px] break-all px-4 py-3 align-top text-zinc-700">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 align-top text-zinc-600">
                      {c.city}
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums text-zinc-800">
                      {c._count.jobOrders}
                    </td>
                    <td className="px-4 py-3 align-top tabular-nums text-zinc-800">
                      {c._count.contracts}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 align-top text-zinc-500">
                      {formatCrm(c.createdAt, "MMM d, yyyy")}
                    </td>
                  </ClickableTableRow>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationBar
        listPath={LIST_PATH}
        current={chipBase}
        page={safePage}
        totalPages={pages}
      />
    </div>
  );
}
