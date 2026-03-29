import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { FilterChips } from "@/components/crm/FilterChips";
import { SearchForm } from "@/components/crm/SearchForm";
import { ListToolbar } from "@/components/crm/ListToolbar";
import { PaginationBar } from "@/components/crm/PaginationBar";
import { TALENT_STATUSES } from "@/lib/crm/pipeline";
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
import { crmCandidateScalarSelect } from "@/lib/crm/candidate-select";
import { CrmPageHeader } from "@/components/crm/CrmPageHeader";
import {
  ResumeSubmissionsTable,
  type ResumeRow,
} from "@/components/crm/ResumeSubmissionsTable";

export const dynamic = "force-dynamic";

const LIST_PATH = "/admin/candidates";

const candidateListSelect = {
  ...crmCandidateScalarSelect,
  notes: true,
} as const;

function SearchFallback() {
  return (
    <div
      className="min-h-12 animate-pulse rounded-2xl bg-zinc-200/60"
      aria-hidden
    />
  );
}

function toResumeRow(c: {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentLocation: string;
  desiredLocation: string;
  industry: string;
  positionType: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: string;
  notes: string | null;
  createdAt: Date;
}): ResumeRow {
  return {
    id: c.id,
    firstName: c.firstName,
    lastName: c.lastName,
    email: c.email,
    phone: c.phone,
    currentLocation: c.currentLocation,
    desiredLocation: c.desiredLocation,
    industry: c.industry,
    positionType: c.positionType,
    resumeUrl: c.resumeUrl,
    coverLetter: c.coverLetter,
    status: c.status,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
  };
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

  let list: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    currentLocation: string;
    desiredLocation: string;
    industry: string;
    positionType: string;
    resumeUrl: string | null;
    coverLetter: string | null;
    status: string;
    notes: string | null;
    createdAt: Date;
  }>;

  try {
    list = await prisma.crmCandidate.findMany({
      where,
      select: candidateListSelect,
      orderBy,
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
  } catch {
    const basic = await prisma.crmCandidate.findMany({
      where,
      select: crmCandidateScalarSelect,
      orderBy,
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    });
    list = basic.map((r) => ({ ...r, notes: null as string | null }));
  }

  const rows = list.map(toResumeRow);

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
    <div className="space-y-6 md:space-y-8">
      <CrmPageHeader
        title="Resume submissions"
        description={`General resume uploads from the site (not job posting applies). Showing ${rows.length} of ${total} (page ${safePage} of ${pages}). Expand a row for notes and stage.`}
      />

      <div className="rounded-2xl border border-zinc-200/80 bg-zinc-50/40 p-4 shadow-inner md:p-5">
        <Suspense fallback={<SearchFallback />}>
          <SearchForm placeholder="Search name, email, role, location…" />
        </Suspense>
      </div>

      <ListToolbar
        listPath={LIST_PATH}
        exportHref={exportHref}
        current={lq}
        sort={sort}
      />

      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-zinc-500">
          Desk stage
        </p>
        <FilterChips chips={chips} />
      </div>

      <ResumeSubmissionsTable rows={rows} />

      <PaginationBar
        listPath={LIST_PATH}
        current={lq}
        page={safePage}
        totalPages={pages}
      />
    </div>
  );
}
