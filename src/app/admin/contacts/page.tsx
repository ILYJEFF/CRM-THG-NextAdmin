import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { formatCrm } from "@/lib/crm/datetime";
import { FilterChips } from "@/components/crm/FilterChips";
import { SearchForm } from "@/components/crm/SearchForm";
import { ContactStatusSelect } from "@/components/crm/ContactStatusSelect";
import { ContactStageTableCell } from "@/components/crm/ContactStageTableCell";
import { ListToolbar } from "@/components/crm/ListToolbar";
import { PaginationBar } from "@/components/crm/PaginationBar";
import {
  CLIENT_LEAD_STATUSES,
  MARKETING_WEBSITE_PIPELINE_OPTIONS,
} from "@/lib/crm/pipeline";
import {
  buildListSearchParams,
  contactWhere,
  listQueryFromSearchParams,
} from "@/lib/crm/list-query";
import {
  PAGE_SIZE,
  orderByCreatedAt,
  parsePage,
  parseSort,
  totalPages,
} from "@/lib/crm/pagination";
import { marketingAssetUrl } from "@/lib/crm/links";
import {
  crmContactScalarSelect,
  crmContactScalarSelectLegacy,
} from "@/lib/crm/crm-contact-select";
import { loadContactJobDescriptionUrlMap } from "@/lib/crm/contact-job-description-url";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { ClickableTableRow } from "@/components/crm/ClickableTableRow";
import { JdTableCell } from "@/components/crm/JdTableCell";
import { ContactWebsitePipelineTableCell } from "@/components/crm/ContactWebsitePipelineTableCell";
import { ContactWebsitePipelineSelect } from "@/components/crm/ContactWebsitePipelineSelect";

export const dynamic = "force-dynamic";

const LIST_PATH = "/admin/contacts";

function SearchFallback() {
  return (
    <div
      className="min-h-12 animate-pulse rounded-2xl bg-zinc-200/60"
      aria-hidden
    />
  );
}

export default async function ContactsPage({
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

  const where = contactWhere(q, status, wp);
  const orderBy = orderByCreatedAt(sort);

  const contactSelect =
    gate.state === "ok" ? crmContactScalarSelect : crmContactScalarSelectLegacy;

  if (gate.state === "db_error") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Client leads</h1>
        <p className="text-sm text-zinc-600">
          Leads cannot load until the database connection works. See the alert
          at the top of the page.
        </p>
      </div>
    );
  }

  const total = await prisma.crmContact.count({ where });
  const pages = totalPages(total);
  const safePage = Math.min(Math.max(1, page), pages);

  const contacts = await prisma.crmContact.findMany({
    where,
    orderBy,
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
    select: contactSelect,
  });

  const jdMap = await loadContactJobDescriptionUrlMap(
    contacts.map((c) => c.id)
  );

  const chipBase = { q, sort, wp };
  const chips = [
    {
      href: `${LIST_PATH}${buildListSearchParams(chipBase, { status: null, page: null })}`,
      label: "Open",
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

  const websiteChipBase = { q, sort, status };
  const websiteChips = [
    {
      href: `${LIST_PATH}${buildListSearchParams(websiteChipBase, {
        wp: null,
        page: null,
      })}`,
      label: "All sites",
      active: !wp,
    },
    ...MARKETING_WEBSITE_PIPELINE_OPTIONS.map((s) => ({
      href: `${LIST_PATH}${buildListSearchParams(websiteChipBase, {
        wp: s.value,
        page: null,
      })}`,
      label: s.label,
      active: wp === s.value,
    })),
  ];

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (status) exportParams.set("status", status);
  if (wp) exportParams.set("wp", wp);
  const exportQs = exportParams.toString();
  const exportHref = `/api/crm/export/contacts${exportQs ? `?${exportQs}` : ""}`;

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Client leads
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Employers and hiring managers from your site. Showing{" "}
          {contacts.length} of {total} (page {safePage} of {pages}).
        </p>
      </div>

      <Suspense fallback={<SearchFallback />}>
        <SearchForm placeholder="Search name, email, company, city…" />
      </Suspense>

      <ListToolbar
        listPath={LIST_PATH}
        exportHref={exportHref}
        current={lq}
        sort={sort}
      />

      <FilterChips chips={chips} />

      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-violet-900/80">
          Website pipeline
        </p>
        <FilterChips chips={websiteChips} />
      </div>

      <ul className="space-y-3 md:hidden">
        {contacts.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
            No leads match. Try another filter or search.
          </li>
        ) : (
          contacts.map((c) => (
            <li
              key={c.id}
              className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm"
            >
              <Link
                href={`/admin/contacts/${c.id}`}
                className="block p-4 transition active:scale-[0.99] hover:bg-amber-50/30"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-900">{c.contactName}</p>
                  {c.companyName ? (
                    <p className="mt-0.5 text-sm text-zinc-600">
                      {c.companyName}
                    </p>
                  ) : null}
                  <p className="mt-2 truncate text-sm text-zinc-500">
                    {c.email}
                  </p>
                  <p className="mt-1 text-xs text-zinc-400">
                    {c.city} · {formatCrm(c.createdAt, "MMM d, yyyy")}
                  </p>
                </div>
                <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-zinc-600">
                  {c.message}
                </p>
                {jdMap.get(c.id) ? (
                  <p className="mt-2 text-xs font-semibold text-emerald-800">
                    Job description on file
                  </p>
                ) : null}
                <p className="mt-3 text-xs font-semibold text-amber-800">
                  Open lead →
                </p>
              </Link>
              <div className="space-y-4 border-t border-zinc-200/80 bg-zinc-50/70 px-4 py-3">
                <ContactStatusSelect id={c.id} current={c.status} />
                <ContactWebsitePipelineSelect
                  id={c.id}
                  current={c.pipelineStage}
                />
              </div>
            </li>
          ))
        )}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] text-left text-sm">
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
                  JD
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Desk
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-violet-900">
                  Website
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No leads match this view.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => {
                  const jdHref = marketingAssetUrl(jdMap.get(c.id) ?? null);
                  return (
                  <ClickableTableRow
                    key={c.id}
                    href={`/admin/contacts/${c.id}`}
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top text-zinc-600">
                      {formatCrm(c.createdAt, "MMM d, yyyy")}
                      <span className="block text-xs text-zinc-400">
                        {formatCrm(c.createdAt, "h:mm a")}
                      </span>
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
                    <JdTableCell href={jdHref} />
                    <ContactStageTableCell id={c.id} current={c.status} />
                    <ContactWebsitePipelineTableCell
                      id={c.id}
                      current={c.pipelineStage}
                    />
                  </ClickableTableRow>
                );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaginationBar
        listPath={LIST_PATH}
        current={lq}
        page={safePage}
        totalPages={pages}
      />
    </div>
  );
}
