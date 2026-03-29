import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { FilterChips } from "@/components/crm/FilterChips";
import { SearchForm } from "@/components/crm/SearchForm";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { ListToolbar } from "@/components/crm/ListToolbar";
import { PaginationBar } from "@/components/crm/PaginationBar";
import { TALENT_STATUSES, formatStatusLabel } from "@/lib/crm/pipeline";
import {
  buildListSearchParams,
  candidateWhere,
  listQueryFromSearchParams,
} from "@/lib/crm/list-query";
import {
  PAGE_SIZE,
  orderByCreatedAt,
  parsePage,
  parseSort,
  totalPages,
} from "@/lib/crm/pagination";
import { marketingResumeUrl } from "@/lib/crm/links";
import { crmCandidateScalarSelect } from "@/lib/crm/candidate-select";

export const dynamic = "force-dynamic";

const LIST_PATH = "/admin/candidates";

function SearchFallback() {
  return (
    <div
      className="min-h-12 animate-pulse rounded-2xl bg-zinc-200/60"
      aria-hidden
    />
  );
}

export default async function CandidatesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lq = listQueryFromSearchParams(searchParams);
  const q = lq.q;
  const status = lq.status;
  const sort = parseSort(lq.sort);
  const page = parsePage(lq.page);

  const where = candidateWhere(q, status);
  const orderBy = orderByCreatedAt(sort);

  const total = await prisma.crmCandidate.count({ where });
  const pages = totalPages(total);
  const safePage = Math.min(Math.max(1, page), pages);

  const candidates = await prisma.crmCandidate.findMany({
    where,
    select: crmCandidateScalarSelect,
    orderBy,
    skip: (safePage - 1) * PAGE_SIZE,
    take: PAGE_SIZE,
  });

  const chipBase = { q, sort };
  const chips = [
    {
      href: `${LIST_PATH}${buildListSearchParams(chipBase, { status: null, page: null })}`,
      label: "All",
      active: !status,
    },
    ...TALENT_STATUSES.map((s) => ({
      href: `${LIST_PATH}${buildListSearchParams(chipBase, {
        status: s.value,
        page: null,
      })}`,
      label: s.label,
      active: status === s.value,
    })),
  ];

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (status) exportParams.set("status", status);
  const exportQs = exportParams.toString();
  const exportHref = `/api/crm/export/candidates${exportQs ? `?${exportQs}` : ""}`;

  return (
    <div className="space-y-5 md:space-y-6">
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Talent pipeline
        </h1>
        <p className="mt-2 text-sm text-zinc-600">
          Candidates from resume submissions. Showing {candidates.length} of{" "}
          {total} (page {safePage} of {pages}).
        </p>
      </div>

      <Suspense fallback={<SearchFallback />}>
        <SearchForm placeholder="Search name, email, role, location…" />
      </Suspense>

      <ListToolbar
        listPath={LIST_PATH}
        exportHref={exportHref}
        current={lq}
        sort={sort}
      />

      <FilterChips chips={chips} />

      <ul className="space-y-3 md:hidden">
        {candidates.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
            No candidates match. Try another filter or search.
          </li>
        ) : (
          candidates.map((c) => {
            const resumeHref = marketingResumeUrl(c.resumeUrl);
            return (
              <li key={c.id}>
                <Link
                  href={`/admin/candidates/${c.id}`}
                  className="block rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm transition active:scale-[0.99] hover:border-amber-200/80"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-zinc-900">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="mt-1 truncate text-sm text-zinc-600">
                        {c.positionType}
                      </p>
                      <p className="mt-0.5 text-xs text-zinc-500">
                        Wants {c.desiredLocation} · from {c.currentLocation}
                      </p>
                      <p className="mt-2 truncate text-xs text-zinc-400">
                        {format(c.createdAt, "MMM d, yyyy")}
                      </p>
                    </div>
                    <StatusBadge
                      status={c.status}
                      label={formatStatusLabel(c.status, "talent")}
                      className="shrink-0"
                    />
                  </div>
                  {resumeHref ? (
                    <p className="mt-3 text-xs font-semibold text-amber-800">
                      Resume on file · open profile
                    </p>
                  ) : (
                    <p className="mt-3 text-xs font-semibold text-zinc-500">
                      Open profile →
                    </p>
                  )}
                </Link>
              </li>
            );
          })
        )}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Received
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Candidate
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Target role
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Locations
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Resume
                </th>
                <th className="whitespace-nowrap px-4 py-3 font-semibold text-zinc-700">
                  Stage
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {candidates.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No candidates match this view.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => {
                  const resumeHref = marketingResumeUrl(c.resumeUrl);
                  return (
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
                          href={`/admin/candidates/${c.id}`}
                          className="font-medium text-zinc-900 hover:text-amber-900 hover:underline"
                        >
                          {c.firstName} {c.lastName}
                        </Link>
                        <span className="mt-0.5 block break-all text-xs text-zinc-500">
                          {c.email}
                        </span>
                      </td>
                      <td className="px-4 py-3 align-top text-zinc-700">
                        <span className="font-medium text-zinc-800">
                          {c.positionType}
                        </span>
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          {c.industry}
                        </span>
                      </td>
                      <td className="max-w-[140px] px-4 py-3 align-top text-xs text-zinc-600">
                        <span className="text-zinc-400">Open to</span>{" "}
                        {c.desiredLocation}
                        <br />
                        <span className="text-zinc-400">Based</span>{" "}
                        {c.currentLocation}
                      </td>
                      <td className="px-4 py-3 align-top">
                        {resumeHref ? (
                          <a
                            href={resumeHref}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-amber-800 hover:underline"
                          >
                            Open file
                          </a>
                        ) : (
                          <span className="text-zinc-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 align-top">
                        <StatusBadge
                          status={c.status}
                          label={formatStatusLabel(c.status, "talent")}
                        />
                      </td>
                    </tr>
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
