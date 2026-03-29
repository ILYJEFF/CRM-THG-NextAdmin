import Link from "next/link";
import { Suspense } from "react";
import { prisma } from "@/lib/prisma";
import { CrmPageHeader } from "@/components/crm/CrmPageHeader";
import { DeskViewLinks } from "@/components/crm/DeskViewLinks";
import { SearchForm } from "@/components/crm/SearchForm";
import { ListToolbar } from "@/components/crm/ListToolbar";
import { FilterChips } from "@/components/crm/FilterChips";
import { PaginationBar } from "@/components/crm/PaginationBar";
import {
  DeskUnifiedRows,
  type DeskClientRow,
  type DeskLeadRow,
  type DeskRowPayload,
} from "@/components/crm/DeskUnifiedRows";
import { CLIENT_LEAD_STATUSES } from "@/lib/crm/pipeline";
import {
  buildListSearchParams,
  contactDirectoryWhere,
  deskLeadsWhere,
  clientWhere,
  listQueryFromSearchParams,
  parseDeskView,
  type ListQueryBase,
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
  type CrmContactScalar,
  type CrmContactScalarLegacy,
} from "@/lib/crm/crm-contact-select";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { loadContactJobDescriptionUrlMap } from "@/lib/crm/contact-job-description-url";
import { marketingAssetUrl } from "@/lib/crm/links";

export const dynamic = "force-dynamic";

const LIST_PATH = "/admin";

const clientListSelect = {
  id: true,
  companyName: true,
  contactName: true,
  email: true,
  phone: true,
  city: true,
  industry: true,
  internalNotes: true,
  engagementType: true,
  createdAt: true,
  updatedAt: true,
  convertedLead: { select: { id: true } },
} as const;

function SearchFallback() {
  return (
    <div
      className="min-h-12 animate-pulse rounded-xl bg-zinc-200/50"
      aria-hidden
    />
  );
}

function toLeadRow(
  c: CrmContactScalar | CrmContactScalarLegacy,
  jdHref: string | null
): DeskLeadRow {
  const clientId =
    "clientId" in c && typeof c.clientId === "string" ? c.clientId : null;
  return {
    variant: "lead",
    rowKey: `lead-${c.id}`,
    contactId: c.id,
    clientId,
    contactName: c.contactName,
    companyName: c.companyName,
    email: c.email,
    phone: c.phone,
    city: c.city,
    industry: c.industry,
    openPositions: c.openPositions,
    payBand: c.payBand,
    message: c.message,
    pipelineStage: c.pipelineStage ?? "inbox",
    status: c.status,
    notes: c.notes,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
    jdHref,
  };
}

function toClientRow(c: {
  id: string;
  companyName: string | null;
  contactName: string;
  email: string;
  phone: string;
  city: string;
  industry: string | null;
  internalNotes: string | null;
  engagementType: string | null;
  createdAt: Date;
  updatedAt: Date;
  convertedLead: { id: string } | null;
}): DeskClientRow {
  return {
    variant: "client",
    rowKey: `client-${c.id}`,
    clientId: c.id,
    sourceContactId: c.convertedLead?.id ?? null,
    contactName: c.contactName,
    companyName: c.companyName,
    email: c.email,
    phone: c.phone,
    city: c.city,
    industry: c.industry,
    internalNotes: c.internalNotes,
    engagementType: c.engagementType,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  };
}

function deskNavQuery(lq: ListQueryBase): ListQueryBase {
  return {
    q: lq.q,
    status: lq.status,
    sort: lq.sort,
    page: lq.page,
    view: lq.view,
  };
}

export default async function AdminDeskPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const gate = await getCrmDbGate();
  const lq = listQueryFromSearchParams(searchParams);
  const navQuery = deskNavQuery(lq);
  const q = lq.q;
  const status = lq.status;
  const sort = parseSort(lq.sort);
  const page = parsePage(lq.page);
  const view = parseDeskView(lq.view);

  const contactSelect =
    gate.state === "ok" ? crmContactScalarSelect : crmContactScalarSelectLegacy;

  if (gate.state === "db_error") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold text-zinc-900">Desk</h1>
        <p className="text-sm text-zinc-600">
          Fix the database connection, then refresh. See the alert above.
        </p>
      </div>
    );
  }

  if (view === "clients" && gate.state !== "ok") {
    return (
      <div className="space-y-4">
        <CrmPageHeader
          title="Desk"
          description="Clients need the full CRM schema (crm_clients). Apply migrations, then reload."
        />
      </div>
    );
  }

  const orderBy = orderByCreatedAt(sort);
  let total = 0;
  let rows: DeskRowPayload[] = [];

  if (view === "clients") {
    const where = clientWhere(q);
    total = await prisma.crmClient.count({ where });
    const pages = totalPages(total);
    const safePage = Math.min(Math.max(1, page), pages);
    const list = await prisma.crmClient.findMany({
      where,
      orderBy,
      skip: (safePage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: clientListSelect,
    });
    rows = list.map(toClientRow);
  } else {
    const where =
      view === "leads" && gate.state === "ok"
        ? deskLeadsWhere(q, status, undefined)
        : contactDirectoryWhere(q, status, undefined);

    total = await prisma.crmContact.count({ where });
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
    rows = contacts.map((c) =>
      toLeadRow(c, marketingAssetUrl(jdMap.get(c.id) ?? null))
    );
  }

  const pages = totalPages(total);
  const safePage = Math.min(Math.max(1, page), pages);

  const chipBase = { q, sort, view };
  const chips =
    view === "clients"
      ? []
      : [
          {
            href: `${LIST_PATH}${buildListSearchParams(chipBase, {
              status: null,
              page: null,
            })}`,
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

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (status) exportParams.set("status", status);
  const exportQs = exportParams.toString();
  const exportHref =
    view === "clients"
      ? null
      : `/api/crm/export/contacts${exportQs ? `?${exportQs}` : ""}`;

  const viewLabel =
    view === "leads"
      ? "Open leads (not yet a client)"
      : view === "clients"
        ? "Client accounts"
        : "Every contact row";

  return (
    <div className="space-y-5 md:space-y-6">
      <CrmPageHeader
        title="Desk"
        className="mb-5 pb-4 md:mb-6"
        description={`${viewLabel}. Expand a row for full detail and to change stage or convert. ${rows.length} of ${total} on this page (${safePage} / ${pages}).`}
      />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:gap-6">
        <div className="w-full shrink-0 lg:max-w-sm">
          <DeskViewLinks current={navQuery} />
        </div>
        <div className="min-w-0 flex-1 space-y-4">
          <div className="rounded-xl border border-zinc-200/70 bg-zinc-50/50 p-3 md:p-4">
            <Suspense fallback={<SearchFallback />}>
              <SearchForm placeholder="Search name, email, company, city…" />
            </Suspense>
          </div>

          <ListToolbar
            listPath={LIST_PATH}
            exportHref={exportHref}
            current={navQuery}
            sort={sort}
          />

          {chips.length > 0 ? (
            <div className="rounded-xl border border-zinc-200/60 bg-white/60 px-2 py-3 md:px-3">
              <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-zinc-500">
                Stage
              </p>
              <FilterChips chips={chips} />
            </div>
          ) : null}
        </div>
      </div>

      <DeskUnifiedRows
        rows={rows}
        viewMode={view}
        canConvertLead={gate.state === "ok"}
      />

      <PaginationBar
        listPath={LIST_PATH}
        current={navQuery}
        page={safePage}
        totalPages={pages}
      />

      <div className="flex flex-col gap-2 border-t border-zinc-200/80 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
        <Link
          href="/admin/applicants"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-100 px-4 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200/80 transition hover:bg-zinc-50"
        >
          Job applications
        </Link>
        <Link
          href="/admin/candidates"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-zinc-100 px-4 text-sm font-semibold text-zinc-900 ring-1 ring-zinc-200/80 transition hover:bg-zinc-50"
        >
          Resume submissions
        </Link>
      </div>
    </div>
  );
}
