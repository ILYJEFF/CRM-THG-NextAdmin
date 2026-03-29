import Link from "next/link";
import type { ReactNode } from "react";

export const dynamic = "force-dynamic";

function Section({
  id,
  title,
  eyebrow,
  children,
}: {
  id: string;
  title: string;
  eyebrow: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-100 md:p-7"
    >
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800/90">
        {eyebrow}
      </p>
      <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
        {title}
      </h2>
      <div className="mt-4 space-y-3 text-sm leading-relaxed text-zinc-700">
        {children}
      </div>
    </section>
  );
}

const toc = [
  { href: "#overview", label: "Overview" },
  { href: "#fees", label: "Fee & engagement" },
  { href: "#warranty", label: "Warranty & replacement" },
  { href: "#recruiter", label: "Recruiter standards" },
  { href: "#accounts", label: "Account maintenance" },
  { href: "#data", label: "Data & confidentiality" },
];

export default function PlaybookPage() {
  return (
    <div className="space-y-8 md:space-y-10">
      <div className="relative overflow-hidden rounded-3xl border border-amber-200/60 bg-gradient-to-br from-amber-50 via-white to-violet-50/30 p-6 shadow-md ring-1 ring-amber-100/80 md:p-9">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-amber-300/20 blur-3xl"
          aria-hidden
        />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-900/70">
            Internal desk reference
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            Commercial &amp; operations playbook
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Working language for how we talk about fees, guarantees, recruiter
            conduct, and ongoing account care. Replace placeholders with your
            executed agreements and legal-approved wording.
          </p>
          <p className="mt-4 rounded-xl border border-amber-200/80 bg-amber-50/80 px-4 py-3 text-xs font-medium text-amber-950">
            This page is not a binding contract. Always align with signed client
            agreements and counsel before quoting terms externally.
          </p>
        </div>
      </div>

      <nav
        aria-label="On this page"
        className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm"
      >
        {toc.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="inline-flex min-h-9 items-center rounded-full bg-zinc-50 px-3.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200/80 transition hover:bg-amber-50 hover:ring-amber-200"
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className="grid gap-6 md:gap-8">
        <Section id="overview" eyebrow="Start here" title="How to use this playbook">
          <p>
            Use these sections for internal training, proposal copy, and CRM
            notes. When a client asks about fees or guarantees, pull from the
            latest signed SOW or MSA, not from memory.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Link fee tiers to the active client record and stored contracts.</li>
            <li>Log every material conversation in Activity on the lead or client.</li>
            <li>Escalate exceptions (credits, warranty triggers) to leadership in writing.</li>
          </ul>
        </Section>

        <Section
          id="fees"
          eyebrow="Commercial"
          title="Fee agreement &amp; engagement structure"
        >
          <p>
            <strong className="text-zinc-900">Placeholder structure:</strong>{" "}
            Describe search type (retained, engaged, container), fee percentage
            or flat, invoicing milestones, and expense policy.
          </p>
          <p>
            <strong className="text-zinc-900">Talking points:</strong> Value of
            dedicated sourcing, market mapping, interview coordination, and
            offer support. Clarify what is included vs billable pass-through.
          </p>
          <p>
            <strong className="text-zinc-900">CRM habit:</strong> On each client,
            note fee basis and renewal date in internal notes when the deal
            closes so Job Orders inherit the right commercial context.
          </p>
        </Section>

        <Section
          id="warranty"
          eyebrow="Risk"
          title="Warranty, replacement, and offboarding"
        >
          <p>
            <strong className="text-zinc-900">Placeholder terms:</strong>{" "}
            Define warranty window (e.g. 30 / 60 / 90 days), what counts as
            voluntary vs performance separation, and how replacement searches
            are prioritized.
          </p>
          <p>
            <strong className="text-zinc-900">Triggers to document:</strong>{" "}
            Start date, last day, reason category, and client notice in Activity
            so finance and delivery stay aligned.
          </p>
          <p>
            <strong className="text-zinc-900">No public promise:</strong> Only
            repeat warranty language that appears in the client&apos;s signed
            agreement.
          </p>
        </Section>

        <Section
          id="recruiter"
          eyebrow="Delivery"
          title="Recruiter working agreement &amp; conduct"
        >
          <p>
            <strong className="text-zinc-900">Standards:</strong> Timely
            follow-up, accurate role briefs, respectful candidate experience, and
            transparent status updates to hiring managers.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Confirm search priorities and must-haves in writing after kickoff.</li>
            <li>SLA for submittal feedback loops (internal target, e.g. 48 business hours).</li>
            <li>Document slate decisions and declines to protect the firm and candidates.</li>
          </ul>
          <p>
            <strong className="text-zinc-900">Independence:</strong> Side
            agreements or fee changes require manager approval and a paper trail
            on the client record.
          </p>
        </Section>

        <Section
          id="accounts"
          eyebrow="Operations"
          title="Account maintenance checklist"
        >
          <p>
            <strong className="text-zinc-900">Quarterly:</strong> Confirm open
            Job Orders, hiring plan changes, and contract end dates. Update
            internal notes with primary stakeholders.
          </p>
          <p>
            <strong className="text-zinc-900">Ongoing:</strong> File executed
            amendments under Contracts on the client. Archive filled roles and
            mark Job Orders closed when searches end.
          </p>
          <p>
            <strong className="text-zinc-900">Renewals:</strong> Start outreach 60
            days before anniversaries; log prep tasks as Activities so the desk
            sees momentum.
          </p>
        </Section>

        <Section
          id="data"
          eyebrow="Trust"
          title="Data handling &amp; confidentiality"
        >
          <p>
            Candidate and client data in this CRM is confidential. Do not export
            lists to personal devices. Use official exports and approved tools
            only.
          </p>
          <p>
            Redact or minimize PII in internal screenshots. When sharing
            externally, use marketing-approved templates and strip unnecessary
            fields.
          </p>
        </Section>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 px-5 py-4">
        <p className="text-sm text-zinc-600">
          Back to live pipeline and clients.
        </p>
        <Link
          href="/admin"
          className="inline-flex min-h-10 items-center rounded-full bg-zinc-900 px-5 text-sm font-semibold text-white transition hover:bg-zinc-800"
        >
          Recruiting desk
        </Link>
      </div>
    </div>
  );
}
