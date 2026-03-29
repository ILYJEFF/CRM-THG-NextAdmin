"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  markClientReviewComplete,
  updateClientCommercial,
} from "@/app/actions/desk";
import { toDateInputValue } from "@/lib/crm/date-input";

const ENGAGEMENT_PRESETS = [
  { value: "", label: "Select type…" },
  { value: "retained", label: "Retained search" },
  { value: "container", label: "Container / RPO-style" },
  { value: "project", label: "Project / one-off" },
  { value: "hourly", label: "Hourly consulting" },
  { value: "other", label: "Other (see notes)" },
];

export function ClientCommercialPanel({
  clientId,
  initial,
}: {
  clientId: string;
  initial: {
    engagementType: string | null;
    feeSummary: string | null;
    warrantySummary: string | null;
    commercialNotes: string | null;
    agreementRenewalAt: Date | null;
    nextReviewAt: Date | null;
    lastReviewAt: Date | null;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const customEngagement =
    initial.engagementType &&
    !ENGAGEMENT_PRESETS.some((p) => p.value === initial.engagementType);

  return (
    <div className="space-y-8">
      <form
        className="space-y-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const r = await updateClientCommercial(clientId, {
              engagementType: String(fd.get("engagementType") ?? "") || null,
              feeSummary: String(fd.get("feeSummary") ?? "") || null,
              warrantySummary: String(fd.get("warrantySummary") ?? "") || null,
              commercialNotes: String(fd.get("commercialNotes") ?? "") || null,
              agreementRenewalAt: String(fd.get("agreementRenewalAt") ?? "") || null,
              nextReviewAt: String(fd.get("nextReviewAt") ?? "") || null,
              lastReviewAt: String(fd.get("lastReviewAt") ?? "") || null,
            });
            if (r.ok) router.refresh();
          });
        }}
      >
        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Engagement type
          </label>
          <select
            name="engagementType"
            defaultValue={initial.engagementType ?? ""}
            disabled={pending}
            className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm font-medium text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
          >
            {ENGAGEMENT_PRESETS.map((o) => (
              <option key={o.value || "empty"} value={o.value}>
                {o.label}
              </option>
            ))}
            {customEngagement ? (
              <option value={initial.engagementType!}>
                {initial.engagementType} (current)
              </option>
            ) : null}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Agreement renewal
            </label>
            <input
              type="date"
              name="agreementRenewalAt"
              defaultValue={toDateInputValue(initial.agreementRenewalAt)}
              disabled={pending}
              className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Next account review
            </label>
            <input
              type="date"
              name="nextReviewAt"
              defaultValue={toDateInputValue(initial.nextReviewAt)}
              disabled={pending}
              className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Last review done
            </label>
            <input
              type="date"
              name="lastReviewAt"
              defaultValue={toDateInputValue(initial.lastReviewAt)}
              disabled={pending}
              className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
            />
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Fee structure summary
          </label>
          <textarea
            name="feeSummary"
            rows={5}
            defaultValue={initial.feeSummary ?? ""}
            disabled={pending}
            placeholder="Retainer %, milestones, pass-through expenses…"
            className="w-full resize-y rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Warranty / replacement summary
          </label>
          <textarea
            name="warrantySummary"
            rows={4}
            defaultValue={initial.warrantySummary ?? ""}
            disabled={pending}
            placeholder="Window, triggers, how replacements are queued…"
            className="w-full resize-y rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Commercial notes
          </label>
          <textarea
            name="commercialNotes"
            rows={4}
            defaultValue={initial.commercialNotes ?? ""}
            disabled={pending}
            placeholder="Billing quirks, approvers, verbal agreements to confirm in writing…"
            className="w-full resize-y rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
          />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save commercial fields"}
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const r = await markClientReviewComplete(clientId);
                if (r.ok) router.refresh();
              })
            }
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-emerald-300 bg-emerald-50 px-6 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-100 disabled:opacity-50"
          >
            Mark review done (+90 days)
          </button>
        </div>
      </form>
    </div>
  );
}
