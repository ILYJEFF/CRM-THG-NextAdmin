import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { CandidateStatusSelect } from "@/components/crm/CandidateStatusSelect";
import { CandidateNotesForm } from "@/components/crm/CandidateNotesForm";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { formatStatusLabel } from "@/lib/crm/pipeline";
import { marketingResumeUrl } from "@/lib/crm/links";
import { crmCandidateScalarSelect } from "@/lib/crm/candidate-select";
import { loadCandidateNotes } from "@/lib/crm/candidate-notes";

export const dynamic = "force-dynamic";

export default async function CandidateDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const c = await prisma.crmCandidate.findUnique({
    where: { id },
    select: crmCandidateScalarSelect,
  });
  if (!c) notFound();

  const notes = await loadCandidateNotes(id);

  const resumeHref = marketingResumeUrl(c.resumeUrl);

  return (
    <div className="mx-auto max-w-2xl space-y-6 md:max-w-3xl">
      <div className="hidden items-start justify-between gap-4 md:flex">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
            {c.firstName} {c.lastName}
          </h1>
          <p className="mt-1 text-lg text-zinc-600">{c.positionType}</p>
        </div>
        <StatusBadge
          status={c.status}
          label={formatStatusLabel(c.status, "talent")}
          className="shrink-0 scale-110"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm md:hidden">
        <h1 className="text-xl font-semibold text-zinc-900">
          {c.firstName} {c.lastName}
        </h1>
        <p className="mt-1 text-zinc-600">{c.positionType}</p>
        <div className="mt-3">
          <StatusBadge
            status={c.status}
            label={formatStatusLabel(c.status, "talent")}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Contact
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={`mailto:${encodeURIComponent(c.email)}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-[#0f1419] px-4 text-sm font-semibold text-white active:bg-zinc-800 sm:flex-initial sm:px-6"
          >
            Email
          </a>
          <a
            href={`tel:${c.phone.replace(/\s/g, "")}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 active:bg-zinc-50 sm:flex-initial sm:px-6"
          >
            Call
          </a>
          {resumeHref ? (
            <a
              href={resumeHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-amber-500 px-4 text-sm font-semibold text-zinc-950 active:bg-amber-600 sm:flex-initial sm:px-6"
            >
              Open resume
            </a>
          ) : null}
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Email
            </dt>
            <dd className="mt-1 break-all font-medium text-zinc-900">{c.email}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Phone
            </dt>
            <dd className="mt-1 font-medium text-zinc-900">{c.phone}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <CandidateStatusSelect id={c.id} current={c.status} />
      </section>

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Search & mobility
        </h2>
        <dl className="mt-4 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Open to
            </dt>
            <dd className="mt-1 text-base font-medium text-zinc-900">
              {c.desiredLocation}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Current base
            </dt>
            <dd className="mt-1 text-base font-medium text-zinc-900">
              {c.currentLocation}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Industry focus
            </dt>
            <dd className="mt-1 text-base font-medium text-zinc-900">
              {c.industry}
            </dd>
          </div>
        </dl>
      </section>

      {c.coverLetter ? (
        <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Cover letter
          </h2>
          <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-zinc-800">
            {c.coverLetter}
          </p>
        </section>
      ) : null}

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <CandidateNotesForm id={c.id} initial={notes} />
      </section>

      <p className="px-1 text-center text-xs text-zinc-400">
        Applied {format(c.createdAt, "MMMM d, yyyy 'at' h:mm a")}
      </p>
    </div>
  );
}
