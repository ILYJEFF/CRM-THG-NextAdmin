import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCrm } from "@/lib/crm/datetime";
import { ContactStatusSelect } from "@/components/crm/ContactStatusSelect";
import { ContactWebsitePipelineSelect } from "@/components/crm/ContactWebsitePipelineSelect";
import { LeadDangerZone } from "@/components/crm/LeadDangerZone";
import { CrmActivitySection } from "@/components/crm/CrmActivitySection";
import { ContactNotesForm } from "@/components/crm/ContactNotesForm";
import {
  formatMarketingPipelineStageLabel,
  formatStatusLabel,
} from "@/lib/crm/pipeline";
import { marketingAssetUrl } from "@/lib/crm/links";
import {
  crmContactScalarSelect,
  crmContactScalarSelectLegacy,
} from "@/lib/crm/crm-contact-select";
import { loadContactJobDescriptionUrl } from "@/lib/crm/contact-job-description-url";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { getActivitiesModuleReady } from "@/lib/crm/activities-module";
import { ContactRecordHero } from "@/components/crm/ContactRecordHero";
import { ContactSubmissionMessagePanel } from "@/components/crm/ContactSubmissionMessagePanel";
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

export default async function ContactDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const gate = await getCrmDbGate();
  const { id } = params;

  if (gate.state === "db_error") {
    return (
      <div className="mx-auto max-w-2xl space-y-4 md:max-w-3xl">
        <p className="text-sm text-zinc-600">
          This lead cannot load until the database connection works.
        </p>
      </div>
    );
  }

  const contactSelect =
    gate.state === "ok" ? crmContactScalarSelect : crmContactScalarSelectLegacy;

  const contact = await prisma.crmContact.findUnique({
    where: { id },
    select: contactSelect,
  });
  if (!contact) notFound();

  const clientId: string | null =
    gate.state === "ok" && "clientId" in contact
      ? (contact.clientId as string | null)
      : null;

  const jd = await loadContactJobDescriptionUrl(id);
  const jobDescriptionHref = marketingAssetUrl(jd);

  const activitiesReady = await getActivitiesModuleReady();
  const activityCount = activitiesReady
    ? await prisma.crmActivity.count({
        where: { entityType: "contact", entityId: id },
      })
    : 0;

  const statusLabel = formatStatusLabel(contact.status, "client");
  const createdAtLabel = formatCrm(
    contact.createdAt,
    "MMMM d, yyyy 'at' h:mm a"
  );

  const tabDefs = [
    { id: "overview", label: "Overview" },
    { id: "inquiry", label: "Inquiry" },
    {
      id: "files",
      label: "Files",
      ...(jobDescriptionHref ? { badge: 1 } : {}),
    },
    { id: "pipeline", label: "Stages" },
    {
      id: "activity",
      label: "Activity",
      ...(activityCount > 0 ? { badge: activityCount } : {}),
    },
    { id: "notes", label: "Notes" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/admin/contacts"
          className="font-semibold text-amber-900 hover:text-amber-950 hover:underline"
        >
          ← All leads
        </Link>
        <span className="text-zinc-300">·</span>
        <span className="text-zinc-500">Lead record</span>
      </nav>

      <ContactRecordHero
        contactName={contact.contactName}
        companyName={contact.companyName}
        email={contact.email}
        phone={contact.phone}
        city={contact.city}
        status={contact.status}
        statusLabel={statusLabel}
        clientId={clientId}
        createdAtLabel={createdAtLabel}
      />

      <Suspense fallback={<TabsFallback />}>
        <RecordEntityTabs defaultTabId="overview" tabs={tabDefs}>
          <RecordTabPanel id="overview">
            <RecordSectionCard
              title="Contact details"
              description="Everything we know from the form and your updates. Use this when prepping a call or email."
            >
              <dl className="grid gap-6 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Email
                  </dt>
                  <dd className="mt-1 break-all text-sm font-medium text-zinc-900">
                    <a
                      href={`mailto:${encodeURIComponent(contact.email)}`}
                      className="text-amber-900 hover:underline"
                    >
                      {contact.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Phone
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-900">
                    <a
                      href={`tel:${contact.phone.replace(/\s/g, "")}`}
                      className="hover:text-amber-900 hover:underline"
                    >
                      {contact.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Location
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-zinc-900">
                    {contact.city}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                    Website pipeline
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-violet-950">
                    {formatMarketingPipelineStageLabel(contact.pipelineStage)}
                  </dd>
                  <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                    Stage from the marketing admin spreadsheet. Desk status above
                    is separate until you convert this lead.
                  </p>
                </div>
                {contact.industry ? (
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Industry
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-zinc-900">
                      {contact.industry}
                    </dd>
                  </div>
                ) : null}
                {contact.openPositions ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Open positions / needs
                    </dt>
                    <dd className="mt-1 whitespace-pre-wrap text-sm leading-relaxed text-zinc-800">
                      {contact.openPositions}
                    </dd>
                  </div>
                ) : null}
                {contact.payBand ? (
                  <div className="sm:col-span-2">
                    <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                      Pay band
                    </dt>
                    <dd className="mt-1 text-sm font-medium text-zinc-900">
                      {contact.payBand}
                    </dd>
                  </div>
                ) : null}
              </dl>
            </RecordSectionCard>
          </RecordTabPanel>

          <RecordTabPanel id="inquiry">
            <RecordSectionCard
              title="What they sent"
              description="Original message from the website. This is the voice of the prospect; keep it in mind when you follow up."
              variant="emphasis"
            >
              <ContactSubmissionMessagePanel
                id={contact.id}
                initial={contact.message}
                submittedAtLabel={createdAtLabel}
              />
            </RecordSectionCard>
          </RecordTabPanel>

          <RecordTabPanel id="files">
            <RecordSectionCard
              title="Attachments"
              description="Files submitted with this lead. Open in a new tab to review before a call."
            >
              {jobDescriptionHref ? (
                <a
                  href={jobDescriptionHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 px-6 text-sm font-semibold text-zinc-950 shadow-sm ring-1 ring-amber-600/25 transition hover:from-amber-400 hover:to-amber-500 sm:w-auto"
                >
                  Open job description
                </a>
              ) : (
                <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/80 px-4 py-8 text-center text-sm text-zinc-500">
                  No job description file was uploaded with this submission.
                </p>
              )}
            </RecordSectionCard>
          </RecordTabPanel>

          <RecordTabPanel id="pipeline">
            <RecordSectionCard
              title="Desk status"
              description="Your recruiting desk state for this lead. When the deal is real, convert to a client to unlock job orders and contracts."
            >
              {clientId ? (
                <div className="space-y-4">
                  <p className="text-sm leading-relaxed text-zinc-600">
                    This lead is tied to an active client. Job orders, career
                    posts, and contracts live on the client workspace.
                  </p>
                  <Link
                    href={`/admin/clients/${clientId}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
                  >
                    Go to client workspace
                  </Link>
                </div>
              ) : (
                <ContactStatusSelect id={contact.id} current={contact.status} />
              )}
            </RecordSectionCard>
            <div className="mt-5">
              <RecordSectionCard
                title="Website pipeline"
                description="Matches the marketing site admin spreadsheet. Change it here when you are working from the desk."
                variant="emphasis"
              >
                <ContactWebsitePipelineSelect
                  id={contact.id}
                  current={contact.pipelineStage}
                />
              </RecordSectionCard>
            </div>
            <LeadDangerZone
              contactId={contact.id}
              clientId={clientId}
              clientsModuleReady={gate.state === "ok"}
            />
          </RecordTabPanel>

          <RecordTabPanel id="activity">
            <RecordSectionCard
              title="Activity log"
              description="Log calls, emails, and meetings so the next person on this lead sees the full story."
            >
              <CrmActivitySection
                embedded
                entityType="contact"
                entityId={contact.id}
              />
            </RecordSectionCard>
          </RecordTabPanel>

          <RecordTabPanel id="notes">
            <RecordSectionCard
              title="Internal notes"
              description="Private to your team. Summarize calls, next steps, and context the next person should not have to hunt for."
            >
              <ContactNotesForm
                id={contact.id}
                initial={contact.notes}
                hideLabel
              />
            </RecordSectionCard>
          </RecordTabPanel>
        </RecordEntityTabs>
      </Suspense>
    </div>
  );
}
