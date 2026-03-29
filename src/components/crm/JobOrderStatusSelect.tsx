"use client";

import { useTransition } from "react";
import { updateJobOrderStatus } from "@/app/actions/crm";
import { JOB_ORDER_STATUSES } from "@/lib/crm/pipeline";

export function JobOrderStatusSelect({
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
        startTransition(() => updateJobOrderStatus(id, v));
      }}
      className="min-h-10 w-full min-w-[8.5rem] appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-8 text-sm font-medium text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 disabled:opacity-60"
      aria-label="Job order status"
    >
      {!JOB_ORDER_STATUSES.some((s) => s.value === current) ? (
        <option value={current}>{current}</option>
      ) : null}
      {JOB_ORDER_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
