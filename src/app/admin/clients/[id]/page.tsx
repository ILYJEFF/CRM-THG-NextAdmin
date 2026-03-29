import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCrm } from "@/lib/crm/datetime";
import { ClientInternalNotesForm } from "@/components/crm/ClientInternalNotesForm";
import { ClientContractsPanel } from "@/components/crm/ClientContractsPanel";
import { CreateJobOrderForm } from "@/components/crm/CreateJobOrderForm";
import { DeleteJobOrderButton } from "@/components/crm/DeleteJobOrderButton";
import { JobOrderPrioritySelect } from "@/components/crm/JobOrderPrioritySelect";
import { JobOrderStatusSelect } from "@/components/crm/JobOrderStatusSelect";
import { isCrmS3Configured } from "@/lib/crm/s3-contracts";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { ClientsModulePlaceholder } from "@/components/crm/ClientsModulePlaceholder";
import { JobOrderCareerPanel } from "@/components/crm/JobOrderCareerPanel";
import { CrmActivitySection } from "@/components/crm/CrmActivitySection";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const gate = await getCrmDbGate();
  if (gate.state !== "ok") {
    return <ClientsModulePlaceholder gate={gate} />;
  }

  const { id } = params;

  const client = await prisma.crmClient.findUnique({
    where: { id },
    include: {
      jobOrders: { orderBy: { createdAt: "desc" } },
      contracts: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!client) notFound();

  const sourceLead = await prisma.crmContact.findFirst({
    where: { clientId: id },
    select: { id: true },
  });

  const uploadEnabled = isCrmS3Configured();
  const marketingBase = (
    process.env.NEXT_PUBLIC_MARKETING_URL || "https://www.thehammittgroup.com"
  ).replace(/\/$/, "");

  const contractRows = client.contracts.map((c) => ({
    id: c.id,
    label: c.label,
    fileUrl: c.fileUrl,
    fileName: c.fileName,
    createdAt: c.createdAt.toISOString(),
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6 md:max-w-4xl">
      <nav className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/admin/clients"
          className="font-medium text-amber-800 hover:underline"
        >
          ← Clients
        </Link>
        {sourceLead ? (
          <>
            <span className="text-zinc-300">·</span>
            <Link
              href={`/admin/contacts/${sourceLead.id}`}
              className="font-medium text-zinc-600 hover:text-amber-800 hover:underline"
            >
              Original lead
            </Link>
          </>
        ) : null}
      </nav>

      <div className="hidden items-start justify-between gap-4 md:flex">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
            {client.contactName}
          </h1>
          {client.companyName ? (
            <p className="mt-1 text-lg text-zinc-600">{client.companyName}</p>
          ) : null}
        </div>
        <div className="rounded-full bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-wider text-emerald-900 ring-1 ring-emerald-200/80">
          Active client
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm md:hidden">
        <h1 className="text-xl font-semibold text-zinc-900">
          {client.contactName}
        </h1>
        {client.companyName ? (
          <p className="mt-1 text-zinc-600">{client.companyName}</p>
        ) : null}
      </div>

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Contact
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={`mailto:${encodeURIComponent(client.email)}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-[#0f1419] px-4 text-sm font-semibold text-white active:bg-zinc-800 sm:flex-initial sm:px-6"
          >
            Email
          </a>
          <a
            href={`tel:${client.phone.replace(/\s/g, "")}`}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 active:bg-zinc-50 sm:flex-initial sm:px-6"
          >
            Call
          </a>
        </div>
        <dl className="mt-5 space-y-3 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Email
            </dt>
            <dd className="mt-1 break-all font-medium text-zinc-900">
              {client.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Phone
            </dt>
            <dd className="mt-1 font-medium text-zinc-900">{client.phone}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Location
            </dt>
            <dd className="mt-1 font-medium text-zinc-900">{client.city}</dd>
          </div>
          {client.industry ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Industry
              </dt>
              <dd className="mt-1 font-medium text-zinc-900">
                {client.industry}
              </dd>
            </div>
          ) : null}
        </dl>
        <p className="mt-4 text-xs text-zinc-400">
          Client since {formatCrm(client.createdAt, "MMMM d, yyyy")}
        </p>
      </section>

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <ClientInternalNotesForm
          clientId={client.id}
          initial={client.internalNotes}
        />
      </section>

      <CrmActivitySection entityType="client" entityId={client.id} />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-zinc-900">Job orders</h2>
            <p className="mt-1 text-sm text-zinc-600">
              Every active search or role you are working for this client.
            </p>
          </div>
        </div>

        <CreateJobOrderForm clientId={client.id} />

        <div className="space-y-4">
          {client.jobOrders.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 px-4 py-10 text-center text-sm text-zinc-500">
              No job orders yet. Add the first role above.
            </p>
          ) : (
            client.jobOrders.map((j) => (
              <article
                key={j.id}
                id={`job-${j.id}`}
                className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-semibold text-zinc-900">
                      {j.title}
                    </h3>
                    {j.roleSummary ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                        {j.roleSummary}
                      </p>
                    ) : null}
                    {j.notes ? (
                      <p className="mt-3 whitespace-pre-wrap rounded-xl bg-zinc-50 p-3 text-sm text-zinc-600">
                        {j.notes}
                      </p>
                    ) : null}
                    <p className="mt-3 text-xs text-zinc-400">
                      Opened {formatCrm(j.createdAt, "MMM d, yyyy")}
                    </p>
                  </div>
                  <DeleteJobOrderButton id={j.id} />
                </div>
                <div className="mt-4 grid gap-3 border-t border-zinc-100 pt-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Stage
                    </p>
                    <JobOrderStatusSelect id={j.id} current={j.status} />
                  </div>
                  <div>
                    <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
                      Priority
                    </p>
                    <JobOrderPrioritySelect id={j.id} current={j.priority} />
                  </div>
                </div>
                <JobOrderCareerPanel
                  jobOrderId={j.id}
                  marketingBaseUrl={marketingBase}
                  initial={{
                    publicDescription: j.publicDescription,
                    publicLocation: j.publicLocation,
                    publicEmploymentType: j.publicEmploymentType,
                    publicCompanyName: j.publicCompanyName,
                    responsibilities: j.responsibilities,
                    requirements: j.requirements,
                    salaryMin: j.salaryMin,
                    salaryMax: j.salaryMax,
                    salaryPeriod: j.salaryPeriod,
                    careerSlug: j.careerSlug,
                    careerPublishedAt: j.careerPublishedAt?.toISOString() ?? null,
                    careerLastError: j.careerLastError,
                  }}
                />
              </article>
            ))
          )}
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900">Contracts</h2>
          <p className="mt-1 text-sm text-zinc-600">
            MSAs, SOWs, and amendments. Upload to S3 or paste a secure link.
          </p>
        </div>
        <ClientContractsPanel
          clientId={client.id}
          contracts={contractRows}
          uploadEnabled={uploadEnabled}
        />
      </section>
    </div>
  );
}
