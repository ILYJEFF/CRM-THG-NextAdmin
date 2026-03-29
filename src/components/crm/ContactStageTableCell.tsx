"use client";

import { useTransition } from "react";
import { updateContactStatus } from "@/app/actions/crm";
import { CLIENT_LEAD_STATUSES } from "@/lib/crm/pipeline";

export function ContactStageTableCell({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <td
      className="px-4 py-3 align-top"
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <label className="sr-only" htmlFor={`stage-${id}`}>
        Pipeline stage
      </label>
      <select
        id={`stage-${id}`}
        disabled={pending}
        value={current}
        onChange={(e) => {
          const v = e.target.value;
          startTransition(() => updateContactStatus(id, v));
        }}
        className="min-h-10 w-full min-w-[6.5rem] max-w-[10.5rem] rounded-xl border border-zinc-200 bg-white px-2 py-2 text-xs font-semibold text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 disabled:opacity-60"
      >
        {!CLIENT_LEAD_STATUSES.some((s) => s.value === current) ? (
          <option value={current}>{current} (legacy)</option>
        ) : null}
        {CLIENT_LEAD_STATUSES.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </td>
  );
}
