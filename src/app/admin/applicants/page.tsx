import { Suspense } from "react";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { FilterChips } from "@/components/crm/FilterChips";
import { SearchForm } from "@/components/crm/SearchForm";
import { ListToolbar } from "@/components/crm/ListToolbar";
import { PaginationBar } from "@/components/crm/PaginationBar";
import { CrmPageHeader } from "@/components/crm/CrmPageHeader";
import { JOB_APPLICATION_STATUSES } from "@/lib/crm/pipeline";
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
import {
  JobApplicationsTable,
  type JobAppRow,
} from "@/components/crm/JobApplicationsTable";

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

function toJobAppRow(r: ApplicantListRow): JobAppRow {
  return {
    id: r.id,
    jobPostingId: r.jobPostingId,
    jobTitle: r.jobTitle,
    jobCompanyName: r.jobCompanyName,
    firstName: r.firstName,
    lastName: r.lastName,
    email: r.email,
    phone: r.phone,
    currentLocation: r.currentLocation,
    resumeUrl: r.resumeUrl,
    status: r.status,
    createdAt: r.createdAt.toISOString(),
  };
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
          title="Applications"
          description="Job applications from the career site apply form."
        />
        <p className="text-sm text-zinc-600">
          This view needs the latest database migration (
          <code className="rounded bg-zinc-100 px-1 text-xs">
            crm_job_applications
          </code>
          ). Run{" "}
          <code className="rounded bg-zinc-100 px-1 text-xs">
            npx prisma migrate deploy
          </code>{" "}
          on the CRM project.
        </p>
      </div>
    );
  }

  const tableRows = rows.map(toJobAppRow);

  return (
    <div className="space-y-6 md:space-y-8">
      <CrmPageHeader
        title="Applications"
        description={`Posted job applies from the website (not general resume intake). ${tableRows.length} of ${total} on this page. Expand a row to change status.`}
      />

      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-4 shadow-inner md:p-5">
        <Suspense fallback={<SearchFallback />}>
          <SearchForm placeholder="Search name, email, job title…" />
        </Suspense>
      </div>

      <ListToolbar listPath={LIST_PATH} current={lq} sort={sort} />

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Status
        </p>
        <FilterChips chips={chips} />
      </div>

      <JobApplicationsTable rows={tableRows} />

      <PaginationBar
        listPath={LIST_PATH}
        current={lq}
        page={safePage}
        totalPages={pages}
      />
    </div>
  );
}
