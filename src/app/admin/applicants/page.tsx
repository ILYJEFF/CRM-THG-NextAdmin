import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { formatCrm } from "@/lib/crm/datetime";
import { FilterChips } from "@/components/crm/FilterChips";
import { SearchForm } from "@/components/crm/SearchForm";
import { ListToolbar } from "@/components/crm/ListToolbar";
import { PaginationBar } from "@/components/crm/PaginationBar";
import { CrmPageHeader } from "@/components/crm/CrmPageHeader";
import { ApplicantStatusSelect } from "@/components/crm/ApplicantStatusSelect";
import { JOB_APPLICATION_STATUSES, formatJobApplicationStatusLabel } from "@/lib/crm/pipeline";
import {
  buildListSearchParams,
  jobApplicationWhere,
  listQueryFromSearchParams,
} from "@/lib/crm/list-query";
import {
  PAGE_SIZE,
  orderByCreatedAt,
  parsePage,
  parseSort,
  totalPages,
} from "@/lib/crm/pagination";

export const dynamic = "force-dynamic";

const LIST_PATH = "/admin/applicants";

const applicantSelect = {
  id: true,
  jobPostingId: true,
  jobTitle: true,
  jobCompanyName: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  currentLocation: true,
  resumeUrl: true,
  status: true,
  createdAt: true,
} as const;

type ApplicantListRow = Prisma.CrmJobApplicationGetPayload<{
  select: typeof applicantSelect;
}>;

function SearchFallback() {
  return (
    <div
      className="min-h-12 animate-pulse rounded-2xl bg-zinc-200/60"
      aria-hidden
    />
  );
}

export default async function ApplicantsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const lq = listQueryFromSearchParams(searchParams);
  const q = lq.q;
  const status = lq.status;
  const sort = parseSort(lq.sort);
  const page = parsePage(lq.page);

  const where = jobApplicationWhere(q, status);
  const orderBy = orderByCreatedAt(sort);

  let total = 0;
  let rows: ApplicantListRow[] = [];
  let loadError = false;

  try {
    total = await prisma.crmJobApplication.count({ where });
    const pg = totalPages(total);
    const sp = Math.min(Math.max(1, page), pg);
    rows = await prisma.crmJobApplication.findMany({
      where,
      orderBy,
      skip: (sp - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: applicantSelect,
    });
  } catch {
    loadError = true;
  }

  const pages = totalPages(total);
  const safePage = Math.min(Math.max(1, page), pages);

  const chipBase = { q, sort };
  const chips = [
    {
      href: `${LIST_PATH}${buildListSearchParams(chipBase, { status: null, page: null })}`,
      label: "All",
      active: !status,
    },
    ...JOB_APPLICATION_STATUSES.map((s) => ({
      href: `${LIST_PATH}${buildListSearchParams(chipBase, {
        status: s.value,
        page: null,
      })}`,
      label: s.label,
      active: status === s.value,
    })),
  ];

  if (loadError) {
    return (
      <div className="space-y-4">
        <CrmPageHeader
          title="Applicants"
          description="Job applications from the career site apply form."
        />
        <p className="text-sm text-zinc-600">
          This view needs the latest database migration (
          <code className="rounded bg-zinc-100 px-1 text-xs">crm_job_applications</code>
          ). Run{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs">
            npx prisma migrate deploy
          </code>{" "}
          on the CRM project.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <CrmPageHeader
        title="Applicants"
        description={`People who applied to a posted role through the website form (not the general resume submission). ${rows.length} of ${total} on this page.`}
      />

      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-4 shadow-inner md:p-5">
        <Suspense fallback={<SearchFallback />}>
          <SearchForm placeholder="Search name, email, job title…" />
        </Suspense>
      </div>

      <ListToolbar listPath={LIST_PATH} current={lq} sort={sort} />

      <FilterChips chips={chips} />

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg shadow-zinc-900/[0.06] ring-1 ring-zinc-950/[0.04] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-gradient-to-r from-sky-50/80 to-white">
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Applied
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Applicant
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Role
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Contact
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Resume
                </th>
                <th className="whitespace-nowrap px-4 py-3.5 font-semibold text-zinc-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No applications yet. They appear here when someone applies
                    to a live posting and the site syncs to this CRM.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="transition hover:bg-sky-50/40"
                  >
                    <td className="whitespace-nowrap px-4 py-3 align-top text-zinc-600">
                      {formatCrm(r.createdAt, "MMM d, yyyy")}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="font-medium text-zinc-900">
                        {r.firstName} {r.lastName}
                      </span>
                      {r.currentLocation ? (
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          {r.currentLocation}
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-[220px] px-4 py-3 align-top text-zinc-700">
                      <span className="font-medium text-zinc-900">
                        {r.jobTitle ?? "Role"}
                      </span>
                      {r.jobCompanyName ? (
                        <span className="mt-0.5 block text-xs text-zinc-500">
                          {r.jobCompanyName}
                        </span>
                      ) : null}
                    </td>
                    <td className="max-w-[200px] break-all px-4 py-3 align-top text-zinc-700">
                      <div className="text-sm">{r.email}</div>
                      <div className="mt-1 text-xs text-zinc-500">{r.phone}</div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <a
                        href={r.resumeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-sky-800 hover:underline"
                        onClick={(e) => e.stopPropagation()}
                        onKeyDown={(e) => e.stopPropagation()}
                      >
                        Open file
                      </a>
                    </td>
                    <td
                      className="px-4 py-3 align-top"
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => e.stopPropagation()}
                    >
                      <ApplicantStatusSelect id={r.id} current={r.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ul className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
            No applications yet.
          </li>
        ) : (
          rows.map((r) => (
            <li
              key={r.id}
              className="rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-md ring-1 ring-zinc-950/[0.03]"
            >
              <p className="font-semibold text-zinc-900">
                {r.firstName} {r.lastName}
              </p>
              <p className="mt-1 text-sm text-zinc-600">{r.jobTitle}</p>
              <p className="mt-2 text-xs text-zinc-500">
                {formatJobApplicationStatusLabel(r.status)}
              </p>
              <ApplicantStatusSelect id={r.id} current={r.status} />
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
