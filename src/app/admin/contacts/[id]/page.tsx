import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";
import { ContactStatusSelect } from "@/components/crm/ContactStatusSelect";
import { LeadDangerZone } from "@/components/crm/LeadDangerZone";
import { CrmActivitySection } from "@/components/crm/CrmActivitySection";
import { ContactNotesForm } from "@/components/crm/ContactNotesForm";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { formatStatusLabel } from "@/lib/crm/pipeline";
import { marketingAssetUrl } from "@/lib/crm/links";
import { MarketingDocumentCard } from "@/components/crm/MarketingDocumentCard";
import {
  crmContactScalarSelect,
  crmContactScalarSelectLegacy,
} from "@/lib/crm/crm-contact-select";
import { loadContactJobDescriptionUrl } from "@/lib/crm/contact-job-description-url";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";

export const dynamic = "force-dynamic";

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

  return (
    <div className="mx-auto max-w-2xl space-y-6 md:max-w-3xl">
      <nav className="text-sm">
        <Link
          href="/admin/contacts"
          className="font-medium text-amber-800 hover:underline"
        >
          ← All leads
        </Link>
      </nav>

      <div className="hidden items-start justify-between gap-4 md:flex">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 md:text-3xl">
            {contact.contactName}
          </h1>
          {contact.companyName ? (
            <p className="mt-1 text-lg text-zinc-600">{contact.companyName}</p>
          ) : null}
        </div>
        <StatusBadge
          status={contact.status}
          label={formatStatusLabel(contact.status, "client")}
          className="shrink-0 scale-110"
        />
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm md:hidden">
        <h1 className="text-xl font-semibold text-zinc-900">
          {contact.contactName}
        </h1>
        {contact.companyName ? (
          <p className="mt-1 text-zinc-600">{contact.companyName}</p>
        ) : null}
        <div className="mt-3">
          <StatusBadge
            status={contact.status}
            label={formatStatusLabel(contact.status, "client")}
          />
        </div>
      </div>

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Reach out
        </h2>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href={`mailto:${encodeURIComponent(contact.email)}`}
            className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-2xl bg-[#0f1419] px-4 text-sm font-semibold text-white active:bg-zinc-800 sm:flex-initial sm:px-6"
          >
            Email
          </a>
          <a
            href={`tel:${contact.phone.replace(/\s/g, "")}`}
            className="inline-flex min-h-12 min-w-0 flex-1 items-center justify-center rounded-2xl border-2 border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 active:bg-zinc-50 sm:flex-initial sm:px-6"
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
              {contact.email}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Phone
            </dt>
            <dd className="mt-1 font-medium text-zinc-900">{contact.phone}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
              Location
            </dt>
            <dd className="mt-1 font-medium text-zinc-900">{contact.city}</dd>
          </div>
          {contact.industry ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-zinc-400">
                Industry
              </dt>
              <dd className="mt-1 font-medium text-zinc-900">
                {contact.industry}
              </dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        {clientId ? (
          <div className="space-y-3">
            <p className="text-sm leading-relaxed text-zinc-600">
              This lead is a client. Job orders and contracts are tracked on the
              client profile.
            </p>
            <Link
              href={`/admin/clients/${clientId}`}
              className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-emerald-600 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500"
            >
              Open client profile
            </Link>
          </div>
        ) : (
          <ContactStatusSelect id={contact.id} current={contact.status} />
        )}
      </section>

      <LeadDangerZone
        contactId={contact.id}
        clientId={clientId}
        clientsModuleReady={gate.state === "ok"}
      />

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Inquiry from website
        </h2>
        <p className="mt-3 whitespace-pre-wrap text-base leading-relaxed text-zinc-800">
          {contact.message}
        </p>
        <p className="mt-4 text-xs text-zinc-400">
          Submitted {format(contact.createdAt, "MMMM d, yyyy 'at' h:mm a")}
        </p>
      </section>

      <MarketingDocumentCard
        title="Job description"
        description="Uploaded from the client contact form, if provided."
        href={jobDescriptionHref}
        fileLabel="Open job description"
      />

      <CrmActivitySection entityType="contact" entityId={contact.id} />

      <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
        <ContactNotesForm id={contact.id} initial={contact.notes} />
      </section>
    </div>
  );
}
