import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatCrm } from "@/lib/crm/datetime";
import { FilterChips } from "@/components/crm/FilterChips";
import { SearchForm } from "@/components/crm/SearchForm";
import { ListToolbar } from "@/components/crm/ListToolbar";
import { PaginationBar } from "@/components/crm/PaginationBar";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { CrmPageHeader } from "@/components/crm/CrmPageHeader";
import { WebsitePipelineFilterSelect } from "@/components/crm/WebsitePipelineFilterSelect";
import {
  CLIENT_LEAD_STATUSES,
  formatMarketingPipelineStageLabel,
  formatStatusLabel,
} from "@/lib/crm/pipeline";
import {
  buildListSearchParams,
  contactDirectoryWhere,
  listQueryFromSearchParams,
} from "@/lib/crm/list-query";
import {
  PAGE_SIZE,
  orderByCreatedAt,
  parsePage,
  parseSort,
  totalPages,
} from "@/lib/crm/pagination";
import {
  crmContactScalarSelect,
  crmContactScalarSelectLegacy,
} from "@/lib/crm/crm-contact-select";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { ClickableTableRow } from "@/components/crm/ClickableTableRow";

export const dynamic = "force-dynamic";

const LIST_PATH = "/admin/contact-directory";

function SearchFallback() {
  return (
    <div
      className="min-h-12 animate-pulse rounded-2xl bg-zinc-200/60"
      aria-hidden
    />
  );
}

export default async function ContactDirectoryPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const gate = await getCrmDbGate();
  const lq = listQueryFromSearchParams(searchParams);
  const q = lq.q;
  const status = lq.status;
  const wp = lq.wp;
  const sort = parseSort(lq.sort);
  const page = parsePage(lq.page);

  const where = contactDirectoryWhere(q, status, wp);
  const orderBy = orderByCreatedAt(sort);

  const contactSelect =
    gate.state === "ok" ? crmContactScalarSelect : crmContactScalarSelectLegacy;

  if (gate.state === "db_error") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">All contacts</h1>
        <p className="text-sm text-zinc-600">
          Directory cannot load until the database connection works.
        </p>
      </div>
    );
  }

  const total = await prisma.crmContact.count({ where });
  const pages = totalPages(total);
  const safePage = Math.min(Math.max(1, page), pages);

  const rows = await prisma.crmContact.findMany({
    where,
    orderBy,
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: contactSelect,
  });

  const chipBase = { q, sort, wp };
  const chips = [
    {
      href: `${LIST_PATH}${buildListSearchParams(chipBase, { status: null, page: null })}`,
      label: "Everyone",
      active: !status,
    },
    ...CLIENT_LEAD_STATUSES.map((s) => ({
      href: `${LIST_PATH}${buildListSearchParams(chipBase, {
        status: s.value,
        page: null,
      })}`,
      label: s.label,
      active: status === s.value,
    })),
  ];

  return (
    <div className="space-y-6 md:space-y-8">
      <CrmPageHeader
        title="All contacts"
        description={`Every inquiry synced from the marketing site (${rows.length} of ${total} on this page). Desk status is your CRM state. Site stage is the marketing spreadsheet column.`}
      />

      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-4 shadow-inner md:p-5">
        <Suspense fallback={<SearchFallback />}>
          <SearchForm placeholder="Search name, email, company, message…" />
        </Suspense>
      </div>

      <ListToolbar listPath={LIST_PATH} current={lq} sort={sort}>
        <WebsitePipelineFilterSelect listPath={LIST_PATH} current={lq} />
      </ListToolbar>

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Filter by desk status
        </p>
        <FilterChips chips={chips} />
      </div>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg shadow-zinc-900/[0.06] ring-1 ring-zinc-950/[0.04] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-gradient-to-r from-zinc-50 to-amber-50/30">
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Received
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Contact
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Email
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  City
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Desk
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-violet-900">
                  Site stage
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Account
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No contacts match this view.
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const clientId =
                    gate.state === "ok" && "clientId" in c
                      ? (c.clientId as string | null)
                      : null;
                  return (
                    <ClickableTableRow
                      key={c.id}
                      href={`/admin/contacts/${c.id}`}
                    >
                      <td className="whitespace-nowrap px-4 py-3 align-top text-zinc-600">
                        {formatCrm(c.createdAt, "MMM d, yyyy")}
                      </td>
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
                      <td className="max-w-[180px] break-all px-4 py-3 align-top text-zinc-700">
                        {c.email}
                      </td>
                      <td className="px-4 py-3 align-top text-zinc-600">
                        {c.city}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge
                          status={c.status}
                          label={formatStatusLabel(c.status, "client")}
                        />
                      </td>
                      <td className="px-4 py-3 align-top">
                        <span className="inline-flex rounded-lg bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-900 ring-1 ring-violet-200/80">
                          {formatMarketingPipelineStageLabel(c.pipelineStage)}
                        </span>
                      </td>
                      <td
                        className="px-4 py-3 align-top"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        {clientId ? (
                          <Link
                            href={`/admin/clients/${clientId}`}
                            className="text-sm font-semibold text-emerald-800 hover:underline"
                          >
                            Client workspace
                          </Link>
                        ) : (
                          <span className="text-xs text-zinc-400">—</span>
                        )}
                      </td>
                    </ClickableTableRow>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
            No contacts match.
          </li>
        ) : (
          rows.map((c) => (
            <li
              key={c.id}
              className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-md shadow-zinc-900/5 ring-1 ring-zinc-950/[0.03]"
            >
              <Link
                href={`/admin/contacts/${c.id}`}
                className="block font-semibold text-zinc-900"
              >
                {c.contactName}
              </Link>
              <p className="mt-1 text-xs text-zinc-500">
                {formatStatusLabel(c.status, "client")} ·{" "}
                {formatMarketingPipelineStageLabel(c.pipelineStage)}
              </p>
              <p className="mt-2 text-sm text-zinc-600">{c.email}</p>
            </li>
          ))
        )}
      </ul>

      <PaginationBar
        listPath={LIST_PATH}
        current={lq}
        page={safePage}
        totalPages={pages}
      />
    </div>
  );
}
