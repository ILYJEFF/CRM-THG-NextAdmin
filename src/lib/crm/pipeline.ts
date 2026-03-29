/** Client inquiry pipeline (employers / hiring leads from the site) */
export const CLIENT_LEAD_STATUSES = [
  { value: "new", label: "New" },
  { value: "contacted", label: "Contacted" },
  { value: "qualified", label: "Qualified" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
  { value: "archived", label: "Archived" },
] as const;

/** Talent pipeline (candidates from resume submissions) */
export const TALENT_STATUSES = [
  { value: "new", label: "New" },
  { value: "screening", label: "Screening" },
  { value: "submitted", label: "Submitted to client" },
  { value: "interview", label: "Interview" },
  { value: "offer", label: "Offer" },
  { value: "placed", label: "Placed" },
  { value: "archived", label: "Archived" },
] as const;

export type ClientLeadStatus = (typeof CLIENT_LEAD_STATUSES)[number]["value"];
export type TalentStatus = (typeof TALENT_STATUSES)[number]["value"];

export function normalizeClientStatus(status: string): string {
  const t = (status.trim() || "new").slice(0, 64);
  return t;
}

export function normalizeTalentStatus(status: string): string {
  const t = (status.trim() || "new").slice(0, 64);
  return t;
}

export function statusBadgeClass(status: string): string {
  const s = status.toLowerCase();
  if (s === "new") return "bg-sky-100 text-sky-900 ring-sky-200/80";
  if (s === "placed" || s === "won" || s === "converted")
    return "bg-emerald-100 text-emerald-900 ring-emerald-200/80";
  if (s === "lost" || s === "archived" || s === "deleted")
    return "bg-zinc-200 text-zinc-700 ring-zinc-300/80";
  if (s === "interview" || s === "proposal")
    return "bg-violet-100 text-violet-900 ring-violet-200/80";
  if (s === "screening" || s === "contacted" || s === "qualified")
    return "bg-amber-100 text-amber-950 ring-amber-200/80";
  if (s === "submitted" || s === "offer")
    return "bg-orange-100 text-orange-950 ring-orange-200/80";
  return "bg-zinc-100 text-zinc-800 ring-zinc-200/80";
}

export function formatStatusLabel(
  status: string,
  kind: "client" | "talent"
): string {
  if (kind === "client") {
    if (status === "converted") return "Converted";
    if (status === "deleted") return "Deleted";
  }
  const list = kind === "client" ? CLIENT_LEAD_STATUSES : TALENT_STATUSES;
  const found = list.find((x) => x.value === status);
  return found?.label ?? status;
}
