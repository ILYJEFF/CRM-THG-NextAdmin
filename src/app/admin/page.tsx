import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CRM_TIME_ZONE_LABEL, formatCrm } from "@/lib/crm/datetime";
import { StatusBadge } from "@/components/crm/StatusBadge";
import {
  formatStatusLabel,
  CLIENT_LEAD_DESK_PIPELINE,
  TALENT_STATUSES,
} from "@/lib/crm/pipeline";
import { contactWhere } from "@/lib/crm/list-query";
import { crmCandidateScalarSelect } from "@/lib/crm/candidate-select";
import {
  crmContactScalarSelect,
  crmContactScalarSelectLegacy,
} from "@/lib/crm/crm-contact-select";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { getActivitiesModuleReady } from "@/lib/crm/activities-module";
import { formatActivityTypeLabel } from "@/lib/crm/pipeline";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const gate = await getCrmDbGate();

  if (gate.state === "db_error") {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Recruiting desk
        </h1>
        <p className="max-w-xl text-sm leading-relaxed text-zinc-600">
          Stats and lists load from Postgres. Fix the connection (see the alert
          above), then refresh this page.
        </p>
      </div>
    );
  }

  const contactSelect =
    gate.state === "ok" ? crmContactScalarSelect : crmContactScalarSelectLegacy;

  const [
    contactTotal,
    clientTotal,
    jobOrderTotal,
    candidateTotal,
    newContacts,
    newCandidates,
    contactGroups,
    candidateGroups,
    recentContacts,
    recentCandidates,
    companyNameRows,
  ] = await Promise.all([
    prisma.crmContact.count({
      where: contactWhere(undefined, undefined),
    }),
    gate.state === "ok" ? prisma.crmClient.count() : Promise.resolve(0),
    gate.state === "ok" ? prisma.crmJobOrder.count() : Promise.resolve(0),
    prisma.crmCandidate.count(),
    prisma.crmContact.count({ where: { status: "new" } }),
    prisma.crmCandidate.count({ where: { status: "new" } }),
    prisma.crmContact.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.crmCandidate.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.crmContact.findMany({
      where: contactWhere(undefined, undefined),
      select: contactSelect,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.crmCandidate.findMany({
      select: crmCandidateScalarSelect,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.crmContact.findMany({
      where: {
        AND: [
          { companyName: { not: null } },
          contactWhere(undefined, undefined),
        ],
      },
      select: { companyName: true },
    }),
  ]);

  const uniqueEmployers = new Set(
    companyNameRows
      .map((r) => r.companyName?.trim())
      .filter((n): n is string => Boolean(n))
  ).size;

  const contactPipeline = Object.fromEntries(
    contactGroups.map((g) => [g.status, g._count])
  );
  const talentPipeline = Object.fromEntries(
    candidateGroups.map((g) => [g.status, g._count])
  );

  const activitiesReady = await getActivitiesModuleReady();
  const recentLoggedActivities = activitiesReady
    ? await prisma.crmActivity.findMany({
        orderBy: { createdAt: "desc" },
        take: 14,
      })
    : [];

  type DeskTaskRow = {
    id: string;
    title: string;
    dueAt: Date | null;
    client: { id: string; companyName: string | null; contactName: string };
  };
  let deskOverdueTasks: DeskTaskRow[] = [];
  let deskUpcomingTasks: DeskTaskRow[] = [];
  let deskReviewsDue: {
    id: string;
    companyName: string | null;
    contactName: string;
    nextReviewAt: Date;
  }[] = [];

  if (gate.state === "ok") {
    try {
      const startToday = new Date();
      startToday.setHours(0, 0, 0, 0);
      const horizon = new Date();
      horizon.setDate(horizon.getDate() + 14);
      horizon.setHours(23, 59, 59, 999);

      const [overdue, upcoming, reviews] = await Promise.all([
        prisma.crmAccountTask.findMany({
          where: {
            completedAt: null,
            dueAt: { not: null, lt: startToday },
          },
          orderBy: { dueAt: "asc" },
          take: 14,
          include: {
            client: {
              select: { id: true, companyName: true, contactName: true },
            },
          },
        }),
        prisma.crmAccountTask.findMany({
          where: {
            completedAt: null,
            dueAt: { not: null, gte: startToday, lte: horizon },
          },
          orderBy: { dueAt: "asc" },
          take: 14,
          include: {
            client: {
              select: { id: true, companyName: true, contactName: true },
            },
          },
        }),
        prisma.crmClient.findMany({
          where: { nextReviewAt: { not: null, lte: horizon } },
          orderBy: { nextReviewAt: "asc" },
          take: 14,
          select: {
            id: true,
            companyName: true,
            contactName: true,
            nextReviewAt: true,
          },
        }),
      ]);
      deskOverdueTasks = overdue;
      deskUpcomingTasks = upcoming;
      deskReviewsDue = reviews
        .filter((r) => r.nextReviewAt)
        .map((r) => ({
          id: r.id,
          companyName: r.companyName,
          contactName: r.contactName,
          nextReviewAt: r.nextReviewAt as Date,
        }));
    } catch {
      /* Desk migration not applied yet */
    }
  }

  function activityRecordHref(a: { entityType: string; entityId: string }) {
    if (a.entityType === "contact") {
      return `/admin/contacts/${a.entityId}`;
    }
    if (a.entityType === "client") {
      return `/admin/clients/${a.entityId}`;
    }
    return `/admin/candidates/${a.entityId}`;
  }

  function activityEntityLabel(entityType: string) {
    if (entityType === "contact") return "Lead";
    if (entityType === "client") return "Client";
    return "Candidate";
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Recruiting desk
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
          Inquiries become leads, then active clients. Job orders power your
          searches: publish to the career site, assign candidates, and keep
          contracts next to each account.
        </p>
        <p className="mt-2 text-xs font-medium text-zinc-500">
          Dates and times are shown in {CRM_TIME_ZONE_LABEL} (Chicago).
        </p>
      </div>

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm md:p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Quick actions
        </h2>
        <ul className="mt-3 flex flex-wrap gap-2">
          <li>
            <a
              href="/api/crm/export/contacts"
              className="inline-flex min-h-10 items-center rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white ring-1 ring-zinc-900 transition hover:bg-zinc-800"
            >
              Export leads (CSV)
            </a>
          </li>
          <li>
            <a
              href="/api/crm/export/candidates"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
            >
              Export talent (CSV)
            </a>
          </li>
          <li>
            <Link
              href="/admin/companies"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
            >
              Company accounts
            </Link>
          </li>
          <li>
            <Link
              href="/admin/jobs"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50"
            >
              Job orders pipeline
            </Link>
          </li>
          <li>
            <Link
              href="/admin/playbook"
              className="inline-flex min-h-10 items-center rounded-full bg-gradient-to-r from-amber-100 to-violet-100 px-4 text-sm font-semibold text-zinc-900 ring-1 ring-amber-200/80 transition hover:from-amber-50 hover:to-violet-50"
            >
              Desk playbook
            </Link>
          </li>
          <li>
            <Link
              href="/admin/playbook/manage"
              className="inline-flex min-h-10 items-center rounded-full bg-white px-4 text-sm font-semibold text-violet-900 ring-1 ring-violet-200 transition hover:bg-violet-50/80"
            >
              Playbook CMS
            </Link>
          </li>
        </ul>
      </section>

      {gate.state === "ok" ? (
        <section className="rounded-2xl border-2 border-violet-200/70 bg-gradient-to-br from-violet-50/90 via-white to-amber-50/40 p-4 shadow-md md:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-violet-900">
                Account care command center
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-zinc-600">
                Maintenance tasks and scheduled client reviews in the next two
                weeks. Overdue tasks surface first.
              </p>
            </div>
            <Link
              href="/admin/playbook/manage"
              className="shrink-0 text-sm font-semibold text-violet-900 hover:underline"
            >
              Edit playbook →
            </Link>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            <div className="rounded-2xl border border-red-200/80 bg-white/90 p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-red-800">
                Overdue tasks ({deskOverdueTasks.length})
              </h3>
              <ul className="mt-3 space-y-2">
                {deskOverdueTasks.length === 0 ? (
                  <li className="text-sm text-zinc-500">None. Nice work.</li>
                ) : (
                  deskOverdueTasks.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/admin/clients/${t.client.id}`}
                        className="block rounded-xl border border-red-100 bg-red-50/50 px-3 py-2 text-sm transition hover:bg-red-50"
                      >
                        <span className="font-medium text-zinc-900">
                          {t.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-red-800">
                          {t.client.companyName || t.client.contactName}
                          {t.dueAt
                            ? ` · was due ${formatCrm(t.dueAt, "MMM d")}`
                            : ""}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-amber-200/80 bg-white/90 p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                Due soon ({deskUpcomingTasks.length})
              </h3>
              <ul className="mt-3 space-y-2">
                {deskUpcomingTasks.length === 0 ? (
                  <li className="text-sm text-zinc-500">
                    No tasks due in the next 14 days.
                  </li>
                ) : (
                  deskUpcomingTasks.map((t) => (
                    <li key={t.id}>
                      <Link
                        href={`/admin/clients/${t.client.id}`}
                        className="block rounded-xl border border-amber-100 bg-amber-50/40 px-3 py-2 text-sm transition hover:bg-amber-50/80"
                      >
                        <span className="font-medium text-zinc-900">
                          {t.title}
                        </span>
                        <span className="mt-0.5 block text-xs text-amber-900">
                          {t.client.companyName || t.client.contactName}
                          {t.dueAt
                            ? ` · ${formatCrm(t.dueAt, "MMM d")}`
                            : ""}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-200/80 bg-white/90 p-4 shadow-sm">
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Client reviews ({deskReviewsDue.length})
              </h3>
              <p className="mt-1 text-xs text-zinc-500">
                Next review on or before two weeks out.
              </p>
              <ul className="mt-3 space-y-2">
                {deskReviewsDue.length === 0 ? (
                  <li className="text-sm text-zinc-500">
                    No review dates in this window.
                  </li>
                ) : (
                  deskReviewsDue.map((c) => (
                    <li key={c.id}>
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="block rounded-xl border border-emerald-100 bg-emerald-50/40 px-3 py-2 text-sm transition hover:bg-emerald-50/80"
                      >
                        <span className="font-medium text-zinc-900">
                          {c.companyName || c.contactName}
                        </span>
                        <span className="mt-0.5 block text-xs text-emerald-900">
                          Review {formatCrm(c.nextReviewAt, "MMM d, yyyy")}
                        </span>
                      </Link>
                    </li>
                  ))
                )}
              </ul>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Link
          href="/admin/contacts?status=new"
          className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition active:scale-[0.99] hover:border-amber-300/80 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            New leads
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
            {newContacts}
          </p>
          <p className="mt-2 text-sm font-medium text-amber-800">
            Needs first touch →
          </p>
        </Link>
        <Link
          href="/admin/candidates?status=new"
          className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition active:scale-[0.99] hover:border-amber-300/80 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            New talent
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
            {newCandidates}
          </p>
          <p className="mt-2 text-sm font-medium text-amber-800">
            Screen & qualify →
          </p>
        </Link>
        <Link
          href="/admin/clients"
          className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-white to-emerald-50/50 p-5 shadow-sm transition active:scale-[0.99] hover:border-emerald-300/80 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Active clients
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
            {clientTotal}
          </p>
          <p className="mt-2 text-sm font-medium text-emerald-800">
            Accounts & contracts →
          </p>
        </Link>
        <Link
          href="/admin/jobs"
          className="rounded-2xl border border-zinc-200/90 bg-gradient-to-br from-white to-violet-50/40 p-5 shadow-sm transition active:scale-[0.99] hover:border-violet-300/70 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Job orders
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
            {jobOrderTotal}
          </p>
          <p className="mt-2 text-sm font-medium text-violet-900">
            Pipeline & career posts →
          </p>
        </Link>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Open leads
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
            {contactTotal}
          </p>
          <Link
            href="/admin/contacts"
            className="mt-2 inline-block text-sm font-medium text-zinc-600 hover:text-amber-800"
          >
            Open list
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            All candidates
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
            {candidateTotal}
          </p>
          <Link
            href="/admin/candidates"
            className="mt-2 inline-block text-sm font-medium text-zinc-600 hover:text-amber-800"
          >
            Open pipeline
          </Link>
        </div>
      </section>

      <Link
        href="/admin/companies"
        className="block rounded-2xl border border-zinc-200/90 bg-gradient-to-r from-white to-amber-50/40 p-5 shadow-sm transition active:scale-[0.99] hover:border-amber-300/80 hover:shadow-md md:inline-block md:min-w-[280px]"
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Employer accounts
        </p>
        <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
          {uniqueEmployers}
        </p>
        <p className="mt-2 text-sm font-medium text-amber-800">
          Distinct companies on open leads →
        </p>
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Open lead pipeline
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CLIENT_LEAD_DESK_PIPELINE.map((s) => {
              const n = contactPipeline[s.value] ?? 0;
              return (
                <li key={s.value}>
                  <Link
                    href={`/admin/contacts?status=${encodeURIComponent(s.value)}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 ring-1 ring-zinc-200/80 transition hover:bg-zinc-100"
                  >
                    {s.label}
                    <span className="tabular-nums text-zinc-500">{n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Talent pipeline
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {TALENT_STATUSES.map((s) => {
              const n = talentPipeline[s.value] ?? 0;
              return (
                <li key={s.value}>
                  <Link
                    href={`/admin/candidates?status=${encodeURIComponent(s.value)}`}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-zinc-50 px-3 py-2 text-sm font-medium text-zinc-800 ring-1 ring-zinc-200/80 transition hover:bg-zinc-100"
                  >
                    {s.label}
                    <span className="tabular-nums text-zinc-500">{n}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      {activitiesReady && recentLoggedActivities.length > 0 ? (
        <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Recent logged activity
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            Calls, emails, and notes your team added in the CRM.
          </p>
          <ul className="mt-4 divide-y divide-zinc-100">
            {recentLoggedActivities.map((a) => (
              <li key={a.id} className="py-3 first:pt-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <Link
                    href={activityRecordHref(a)}
                    className="text-sm font-medium text-amber-900 hover:underline"
                  >
                    {formatActivityTypeLabel(a.activityType)}
                    <span className="font-normal text-zinc-500">
                      {" "}
                      · {activityEntityLabel(a.entityType)}
                    </span>
                  </Link>
                  <time
                    dateTime={a.createdAt.toISOString()}
                    className="text-xs tabular-nums text-zinc-400"
                  >
                    {formatCrm(a.createdAt, "MMM d, h:mm a")}
                  </time>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
                  {a.body}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">
              Latest open leads
            </h2>
            <Link
              href="/admin/contacts"
              className="text-xs font-semibold text-amber-800 hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
            {recentContacts.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-zinc-500">
                No open leads yet.
              </li>
            ) : (
              recentContacts.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/contacts/${c.id}`}
                    className="flex min-h-[3.5rem] flex-col gap-1 px-4 py-3 transition hover:bg-amber-50/50 active:bg-amber-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900">
                        {c.contactName}
                      </p>
                      <p className="truncate text-sm text-zinc-600">{c.email}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                      <StatusBadge
                        status={c.status}
                        label={formatStatusLabel(c.status, "client")}
                      />
                      <span className="text-xs text-zinc-500">
                        {formatCrm(c.createdAt, "MMM d")}
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">
              Latest talent
            </h2>
            <Link
              href="/admin/candidates"
              className="text-xs font-semibold text-amber-800 hover:underline"
            >
              View all
            </Link>
          </div>
          <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
            {recentCandidates.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-zinc-500">
                No candidates yet.
              </li>
            ) : (
              recentCandidates.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/admin/candidates/${c.id}`}
                    className="flex min-h-[3.5rem] flex-col gap-1 px-4 py-3 transition hover:bg-amber-50/50 active:bg-amber-50 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="min-w-0">
                      <p className="font-medium text-zinc-900">
                        {c.firstName} {c.lastName}
                      </p>
                      <p className="truncate text-sm text-zinc-600">
                        {c.positionType} · {c.desiredLocation}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                      <StatusBadge
                        status={c.status}
                        label={formatStatusLabel(c.status, "talent")}
                      />
                      <span className="text-xs text-zinc-500">
                        {formatCrm(c.createdAt, "MMM d")}
                      </span>
                    </div>
                  </Link>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
