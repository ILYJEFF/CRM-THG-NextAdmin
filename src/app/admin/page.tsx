import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { StatusBadge } from "@/components/crm/StatusBadge";
import {
  formatStatusLabel,
  CLIENT_LEAD_STATUSES,
  TALENT_STATUSES,
} from "@/lib/crm/pipeline";
import { crmCandidateScalarSelect } from "@/lib/crm/candidate-select";
import { crmContactScalarSelect } from "@/lib/crm/crm-contact-select";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [
    contactTotal,
    candidateTotal,
    newContacts,
    newCandidates,
    contactGroups,
    candidateGroups,
    recentContacts,
    recentCandidates,
    companyNameRows,
  ] = await Promise.all([
    prisma.crmContact.count(),
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
      select: crmContactScalarSelect,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.crmCandidate.findMany({
      select: crmCandidateScalarSelect,
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.crmContact.findMany({
      where: { companyName: { not: null } },
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

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Recruiting desk
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
          Website inquiries become client leads. Resume submissions land in
          talent. Use pipeline stages to track outreach and placements.
        </p>
      </div>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          href="/admin/contacts?status=new"
          className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition active:scale-[0.99] hover:border-amber-300/80 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            New client leads
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
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            All client leads
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
        <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm sm:col-span-2 lg:col-span-1">
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
          Distinct companies on leads →
        </p>
      </Link>

      <div className="grid gap-8 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-zinc-900">
            Client lead pipeline
          </h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CLIENT_LEAD_STATUSES.map((s) => {
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

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-zinc-900">
              Latest client activity
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
                No client leads yet.
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
                        {format(c.createdAt, "MMM d")}
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
                        {format(c.createdAt, "MMM d")}
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
