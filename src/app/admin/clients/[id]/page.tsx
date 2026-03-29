import Link from "next/link";
import { Suspense } from "react";
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
import { getActivitiesModuleReady } from "@/lib/crm/activities-module";
import { ClientRecordHero } from "@/components/crm/ClientRecordHero";
import {
  RecordEntityTabs,
  RecordTabPanel,
} from "@/components/crm/RecordEntityTabs";
import { RecordSectionCard } from "@/components/crm/RecordSectionCard";

export const dynamic = "force-dynamic";

function TabsFallback() {
  return (
    <div
      className="-mx-4 h-14 animate-pulse rounded-none bg-zinc-200/50 sm:-mx-5 md:-mx-8"
      aria-hidden
    />
  );
}

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

  const activitiesReady = await getActivitiesModuleReady();
  const activityCount = activitiesReady
    ? await prisma.crmActivity.count({
        where: { entityType: "client", entityId: id },
      })
    : 0;

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

  const jobsCount = client.jobOrders.length;
  const contractsCount = client.contracts.length;

  const tabDefs = [
    { id: "overview", label: "Overview" },
    {
      id: "jobs",
      label: "Job orders",
      ...(jobsCount > 0 ? { badge: jobsCount } : {}),
    },
    {
      id: "contracts",
      label: "Contracts",
      ...(contractsCount > 0 ? { badge: contractsCount } : {}),
    },
    {
      id: "activity",
      label: "Activity",
      ...(activityCount > 0 ? { badge: activityCount } : {}),
    },
    { id: "notes", label: "Notes" },
  ];

  const clientSinceLabel = formatCrm(client.createdAt, "MMMM d, yyyy");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/admin/clients"
          className="font-semibold text-amber-900 hover:text-amber-950 hover:underline"
        >
          ← All clients
        </Link>
        <span className="text-zinc-300">·</span>
        <span className="text-zinc-500">Client workspace</span>
      </nav>

      <ClientRecordHero
        contactName={client.contactName}
        companyName={client.companyName}
        email={client.email}
        phone={client.phone}
        city={client.city}
        industry={client.industry}
        clientSinceLabel={clientSinceLabel}
        sourceLeadId={sourceLead?.id ?? null}
      />

      <Suspense fallback={<TabsFallback />}>
        <RecordEntityTabs defaultTabId="overview" tabs={tabDefs}>
          <RecordTabPanel id="overview">
            <RecordSectionCard
              title="Account details"
              description="Primary contact and location. Use Email or Call in the header for fastest outreach."
            >
              <dl className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Email
                  </dt>
                  <dd className="mt-1 break-all text-sm font-medium text-zinc-900">
                    <a
                      href={`mailto:${encodeURIComponent(client.email)}`}
                      className="text-amber-900 hover:underline"
                    >
                      {client.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-900">
                    <a
                      href={`tel:${client.phone.replace(/\s/g, "")}`}
                      className="hover:text-amber-900 hover:underline"
                    >
                      {client.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-900">
                    {client.city}
                  </dd>
                </div>
                {client.industry ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Industry
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-zinc-900">
                      {client.industry}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </RecordSectionCard>

            <RecordSectionCard
              title="How to use this workspace"
              description="Job orders are each open role or search. Contracts hold MSAs and SOWs. Log every meaningful touch under Activity so the team stays aligned."
              variant="muted"
            >
              <ul className="list-inside list-disc space-y-2 text-sm text-zinc-700">
                <li>Add a job order when you open a new search for this client.</li>
                <li>
                  Publish career posts from a job order when you are ready to go
                  public on the website.
                </li>
                <li>Store signed documents under Contracts for quick retrieval.</li>
              </ul>
            </RecordSectionCard>
          </RecordTabPanel>

          <RecordTabPanel id="jobs">
            <RecordSectionCard
              title="Open job orders"
              description="One card per role or search. Update stage and priority as the work moves."
            >
              <CreateJobOrderForm clientId={client.id} />
            </RecordSectionCard>

            <div className="space-y-4">
              {jobsCount === 0 ? (
                <p className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/60 px-4 py-12 text-center text-sm text-zinc-600">
                  No job orders yet. Add the first role above to start tracking
                  this account&apos;s searches in one place.
                </p>
              ) : (
                client.jobOrders.map((j) => (
                  <article
                    key={j.id}
                    id={`job-${j.id}`}
                    className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-100 sm:p-6"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-zinc-900">
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
                        careerPublishedAt:
                          j.careerPublishedAt?.toISOString() ?? null,
                        careerLastError: j.careerLastError,
                      }}
                    />
                  </article>
                ))
              )}
            </div>
          </RecordTabPanel>

          <RecordTabPanel id="contracts">
            <RecordSectionCard
              title="Contracts and documents"
              description="MSAs, SOWs, and amendments. Upload when S3 is configured, or paste a secure link."
            >
              <ClientContractsPanel
                clientId={client.id}
                contracts={contractRows}
                uploadEnabled={uploadEnabled}
              />
            </RecordSectionCard>
          </RecordTabPanel>

          <RecordTabPanel id="activity">
            <RecordSectionCard
              title="Activity log"
              description="Every touch with this account in one place. Future you will thank present you."
            >
              <CrmActivitySection
                embedded
                entityType="client"
                entityId={client.id}
              />
            </RecordSectionCard>
          </RecordTabPanel>

          <RecordTabPanel id="notes">
            <RecordSectionCard
              title="Account notes"
              description="Relationship context, billing quirks, and who actually signs. This saves the next recruiter a dozen Slack messages."
            >
              <ClientInternalNotesForm
                clientId={client.id}
                initial={client.internalNotes}
                hideLabel
              />
            </RecordSectionCard>
          </RecordTabPanel>
        </RecordEntityTabs>
      </Suspense>
    </div>
  );
}
