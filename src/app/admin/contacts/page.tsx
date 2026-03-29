import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { FilterChips } from "@/components/crm/FilterChips";
import { SearchForm } from "@/components/crm/SearchForm";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { CLIENT_LEAD_STATUSES, formatStatusLabel } from "@/lib/crm/pipeline";
import {
  buildListSearchParams,
  contactWhere,
} from "@/lib/crm/list-query";

export const dynamic = "force-dynamic";

function SearchFallback() {
  return (
    <div className="min-h-12 animate-pulse rounded-2xl bg-zinc-200/60" aria-hidden />
  );
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const q = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const status =
    typeof searchParams.status === "string" ? searchParams.status : undefined;

  const contacts = await prisma.crmContact.findMany({
    where: contactWhere(q, status),
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const chipBase = { q };
  const chips = [
    {
      href: `/admin/contacts${buildListSearchParams(chipBase, { status: null })}`,
      label: "All",
      active: !status,
    },
    ...CLIENT_LEAD_STATUSES.map((s) => ({
      href: `/admin/contacts${buildListSearchParams(chipBase, { status: s.value })}`,
      label: s.label,
      active: status === s.value,
    })),
  ];

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Client leads
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Employers and hiring contacts from your site. {contacts.length}{" "}
          {contacts.length === 1 ? "row" : "rows"} (max 500).
        </p>
      </div>

      <Suspense fallback={<SearchFallback />}>
        <SearchForm placeholder="Search name, email, company, city…" />
      </Suspense>

      <FilterChips chips={chips} />

      {/* Mobile cards */}
      <ul className="space-y-3 md:hidden">
        {contacts.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
            No leads match. Try another filter or search.
          </li>
        ) : (
          contacts.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/contacts/${c.id}`}
                className="block rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition active:scale-[0.99] hover:border-amber-200/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">
                      {c.contactName}
                    </p>
                    {c.companyName ? (
                      <p className="mt-0.5 text-sm text-zinc-600">
                        {c.companyName}
                      </p>
                    ) : null}
                    <p className="mt-2 truncate text-sm text-zinc-500">
                      {c.email}
                    </p>
                    <p className="mt-1 text-xs text-zinc-400">
                      {c.city} · {format(c.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <StatusBadge
                    status={c.status}
                    label={formatStatusLabel(c.status, "client")}
                    className="shrink-0"
                  />
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                  {c.message}
                </p>
                <p className="mt-3 text-xs font-semibold text-amber-800">
                  Open lead →
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>

      {/* Desktop table */}
      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Received
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Lead
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Email
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Market
                </th>
                <th className="min-w-[200px] px-4 py-3 font-semibold text-zinc-700">
                  Message
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Stage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No leads match this view.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr
                    key={c.id}
                    className="transition hover:bg-amber-50/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top text-zinc-600">
                      {format(c.createdAt, "MMM d, yyyy")}
                      <span className="block text-xs text-zinc-400">
                        {format(c.createdAt, "h:mm a")}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <Link
                        href={`/admin/contacts/${c.id}`}
                        className="font-medium text-zinc-900 hover:text-amber-900 hover:underline"
                      >
                        {c.contactName}
                      </Link>
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
                    <td className="max-w-md px-4 py-3 align-top text-zinc-600">
                      <p className="line-clamp-3 whitespace-pre-wrap">
                        {c.message}
                      </p>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <StatusBadge
                        status={c.status}
                        label={formatStatusLabel(c.status, "client")}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
