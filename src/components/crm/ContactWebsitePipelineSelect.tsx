"use client";

import { useTransition } from "react";
import { updateContactMarketingPipelineStage } from "@/app/actions/crm";
import { MARKETING_WEBSITE_PIPELINE_OPTIONS } from "@/lib/crm/pipeline";

export function ContactWebsitePipelineSelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const [pending, startTransition] = useTransition();
  const normalized = current || "inbox";

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-violet-800/90">
        Website pipeline
      </label>
      <select
        disabled={pending}
        value={normalized}
        onChange={(e) => {
          const v = e.target.value;
          startTransition(() => updateContactMarketingPipelineStage(id, v));
        }}
        className="min-h-12 w-full appearance-none rounded-2xl border border-violet-200 bg-violet-50/40 px-4 py-3 pr-10 text-base font-medium text-violet-950 shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 disabled:opacity-60"
      >
        {!MARKETING_WEBSITE_PIPELINE_OPTIONS.some(
          (o) => o.value === normalized
        ) ? (
          <option value={normalized}>{normalized} (legacy)</option>
        ) : null}
        {MARKETING_WEBSITE_PIPELINE_OPTIONS.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute bottom-3.5 right-3 text-violet-400">
        ▾
      </span>
    </div>
  );
}
