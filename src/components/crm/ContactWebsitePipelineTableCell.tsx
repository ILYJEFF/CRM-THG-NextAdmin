"use client";

import { useTransition } from "react";
import { updateContactMarketingPipelineStage } from "@/app/actions/crm";
import { MARKETING_WEBSITE_PIPELINE_OPTIONS } from "@/lib/crm/pipeline";

export function ContactWebsitePipelineTableCell({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const [pending, startTransition] = useTransition();
  const normalized = current || "inbox";

  return (
    <td
      className="px-4 py-3 align-top"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <label className="sr-only" htmlFor={`wp-${id}`}>
        Website pipeline
      </label>
      <select
        id={`wp-${id}`}
        disabled={pending}
        value={normalized}
        onChange={(e) => {
          const v = e.target.value;
          startTransition(() => updateContactMarketingPipelineStage(id, v));
        }}
        className="min-h-10 w-full min-w-[6.5rem] max-w-[10.5rem] rounded-xl border border-violet-200 bg-violet-50/50 px-2 py-2 text-xs font-semibold text-violet-950 shadow-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-400/30 disabled:opacity-60"
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
    </td>
  );
}
