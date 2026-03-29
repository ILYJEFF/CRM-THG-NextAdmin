"use client";

import { useTransition } from "react";
import { updateJobOrderPriority } from "@/app/actions/crm";
import { JOB_ORDER_PRIORITIES } from "@/lib/crm/pipeline";

export function JobOrderPrioritySelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <select
      disabled={pending}
      value={current}
      onChange={(e) => {
        const v = e.target.value;
        startTransition(() => updateJobOrderPriority(id, v));
      }}
      className="min-h-10 w-full min-w-[7rem] appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-8 text-sm font-medium text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 disabled:opacity-60"
      aria-label="Priority"
    >
      {!JOB_ORDER_PRIORITIES.some((s) => s.value === current) ? (
        <option value={current}>{current}</option>
      ) : null}
      {JOB_ORDER_PRIORITIES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
