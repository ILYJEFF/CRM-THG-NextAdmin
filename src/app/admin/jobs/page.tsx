import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCrm } from "@/lib/crm/datetime";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { ClientsModulePlaceholder } from "@/components/crm/ClientsModulePlaceholder";
import {
  JOB_ORDER_STATUSES,
  formatJobOrderStatusLabel,
  jobOrderStatusBadgeClass,
} from "@/lib/crm/pipeline";
import { cn } from "@/lib/cn";

export const dynamic = "force-dynamic";

export default async function JobsPipelinePage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const gate = await getCrmDbGate();
  if (gate.state !== "ok") {
    return <ClientsModulePlaceholder gate={gate} />;
  }

  const statusFilter =
    typeof searchParams.status === "string" ? searchParams.status : undefined;
  const where =
    statusFilter && statusFilter !== "all"
      ? { status: statusFilter }
      : undefined;

  const jobs = await prisma.crmJobOrder.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: 250,
    include: {
      client: {
        select: {
          id: true,
          companyName: true,
          contactName: true,
          city: true,
        },
      },
      _count: { select: { submissions: true } },
    },
  });

  const marketingBase = (
    process.env.NEXT_PUBLIC_MARKETING_URL || "https://www.thehammittgroup.com"
  ).replace(/\/$/, "");

  return (
    <div className="space-y-8">
      <div className="hidden md:block">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
          Job orders pipeline
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
          Every active client search in one place. Publish roles to the career
          site from each client profile, then track candidates assigned here.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href="/admin/jobs"
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition",
            !statusFilter || statusFilter === "all"
              ? "bg-zinc-900 text-white ring-zinc-900"
              : "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50"
          )}
        >
          All
        </Link>
        {JOB_ORDER_STATUSES.map((s) => (
          <Link
            key={s.value}
            href={`/admin/jobs?status=${encodeURIComponent(s.value)}`}
            className={cn(
              "rounded-full px-3 py-1.5 text-sm font-medium ring-1 transition",
              statusFilter === s.value
                ? "bg-zinc-900 text-white ring-zinc-900"
                : "bg-white text-zinc-700 ring-zinc-200 hover:bg-zinc-50"
            )}
          >
            {s.label}
          </Link>
        ))}
      </div>

      {jobs.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-12 text-center text-sm text-zinc-500">
          No job orders match this filter. Open an{" "}
          <Link href="/admin/clients" className="font-semibold text-amber-800">
            active client
          </Link>{" "}
          to create the first role.
        </p>
      ) : (
        <ul className="space-y-3">
          {jobs.map((j) => {
            const clientLabel =
              j.client.companyName || j.client.contactName;
            const live =
              j.careerPublishedAt && j.careerSlug
                ? `${marketingBase}/openings/${j.careerSlug}`
                : null;
            return (
              <li key={j.id} id={`job-${j.id}`}>
                <article className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm transition hover:border-amber-200/80 hover:shadow-md">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <h2 className="text-lg font-semibold text-zinc-900">
                        {j.title}
                      </h2>
                      <p className="mt-1 text-sm text-zinc-600">
                        <Link
                          href={`/admin/clients/${j.client.id}`}
                          className="font-medium text-emerald-800 hover:underline"
                        >
                          {clientLabel}
                        </Link>
                        <span className="text-zinc-400"> · </span>
                        {j.client.city}
                      </p>
                      {j.roleSummary ? (
                        <p className="mt-2 line-clamp-2 text-sm text-zinc-700">
                          {j.roleSummary}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
                          jobOrderStatusBadgeClass(j.status)
                        )}
                      >
                        {formatJobOrderStatusLabel(j.status)}
                      </span>
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-medium text-zinc-700">
                        {j.priority}
                      </span>
                      {j._count.submissions > 0 ? (
                        <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-900 ring-1 ring-violet-200/80">
                          {j._count.submissions} candidate
                          {j._count.submissions === 1 ? "" : "s"}
                        </span>
                      ) : null}
                      {live ? (
                        <a
                          href={live}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-900 ring-1 ring-emerald-200/80"
                        >
                          Live posting ↗
                        </a>
                      ) : j.careerSlug ? (
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-900 ring-1 ring-amber-200/80">
                          Draft on site
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3 border-t border-zinc-100 pt-4 text-sm">
                    <Link
                      href={`/admin/clients/${j.client.id}#job-${j.id}`}
                      className="font-semibold text-amber-800 hover:underline"
                    >
                      Manage role & career posting →
                    </Link>
                  </div>
                  <p className="mt-2 text-xs text-zinc-400">
                    Updated {formatCrm(j.updatedAt, "MMM d, yyyy")}
                  </p>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
