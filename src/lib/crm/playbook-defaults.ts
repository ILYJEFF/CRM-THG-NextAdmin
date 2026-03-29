/**
 * Default playbook sections for `npx tsx scripts/seed-playbook.ts`.
 * Replace in the CRM UI after migration; this is only the first import.
 */
export type PlaybookSeedRow = {
  slug: string;
  eyebrow: string;
  title: string;
  sortOrder: number;
  body: string;
};

export const PLAYBOOK_DEFAULT_SECTIONS: PlaybookSeedRow[] = [
  {
    slug: "overview",
    eyebrow: "Start here",
    title: "How to use this playbook",
    sortOrder: 0,
    body: `Use these sections for internal training, proposal copy, and CRM notes. When a client asks about fees or guarantees, pull from the latest signed SOW or MSA, not from memory.

• Link fee tiers to the active client record and stored contracts.
• Log every material conversation in Activity on the lead or client.
• Escalate exceptions (credits, warranty triggers) to leadership in writing.

This page is stored in your database. Edit sections under Playbook management.`,
  },
  {
    slug: "fees",
    eyebrow: "Commercial",
    title: "Fee agreement and engagement structure",
    sortOrder: 1,
    body: `PLACEHOLDER STRUCTURE
Describe search type: retained, engaged, container, or project. State fee percentage or flat fee, invoice milestones (retainer, start, completion), and expense policy (pass-through vs included).

TALKING POINTS
Value of dedicated sourcing, market mapping, interview coordination, and offer support. Clarify what is included versus billable pass-through.

CRM HABIT
On each client workspace, use the Commercial tab: engagement type, fee summary, and renewal dates. Job orders inherit context from those fields.

LEGAL
Only repeat language that appears in the client's signed agreement.`,
  },
  {
    slug: "warranty",
    eyebrow: "Risk",
    title: "Warranty, replacement, and offboarding",
    sortOrder: 2,
    body: `PLACEHOLDER TERMS
Define warranty window (for example 30, 60, or 90 days). Define voluntary quit versus performance separation. Define how replacement searches are prioritized in the queue.

DOCUMENTATION TRIGGERS
Candidate start date, last day, reason category, and client notice. Log each in Activity so finance and delivery stay aligned.

NO PUBLIC PROMISE
Never guarantee terms that are not in the signed contract.`,
  },
  {
    slug: "recruiter",
    eyebrow: "Delivery",
    title: "Recruiter working standards",
    sortOrder: 3,
    body: `STANDARDS
Timely follow-up, accurate role briefs, respectful candidate experience, transparent status updates to hiring managers.

OPERATING CADENCE
• Confirm search priorities and must-haves in writing after kickoff.
• Internal target for feedback on submittals (for example 48 business hours).
• Document slate decisions and declines to protect the firm and candidates.

COMMERCIAL DISCIPLINE
Side agreements or fee changes require manager approval and a paper trail on the client record.`,
  },
  {
    slug: "accounts",
    eyebrow: "Operations",
    title: "Account maintenance checklist",
    sortOrder: 4,
    body: `QUARTERLY
Confirm open job orders, hiring plan changes, and contract end dates. Update internal notes with primary stakeholders.

ONGOING
File executed amendments under Contracts on the client. Archive filled roles and mark job orders closed when searches end.

RENEWALS
Start outreach 60 days before anniversaries. Use Account tasks on the client to assign owners and due dates.

FIRST REVIEW
New converted clients get a suggested next review date automatically; adjust it on the Commercial tab.`,
  },
  {
    slug: "data",
    eyebrow: "Trust",
    title: "Data handling and confidentiality",
    sortOrder: 5,
    body: `Candidate and client data in this CRM is confidential. Do not export lists to personal devices. Use official CSV exports and approved tools only.

When sharing externally, use marketing-approved templates and strip unnecessary fields.

Redact PII in screenshots used for training.`,
  },
];
