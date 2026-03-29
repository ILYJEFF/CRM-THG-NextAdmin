"use client";

import { useTransition } from "react";
import { updateContactStatus } from "@/app/actions/crm";
import { CLIENT_LEAD_STATUSES } from "@/lib/crm/pipeline";

export function ContactStatusSelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <div className="relative">
      <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Desk status
      </label>
      <select
        disabled={pending}
        value={current}
        onChange={(e) => {
          const v = e.target.value;
          startTransition(() => updateContactStatus(id, v));
        }}
        className="min-h-12 w-full appearance-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 pr-10 text-base font-medium text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 disabled:opacity-60"
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
      <span className="pointer-events-none absolute bottom-3.5 right-3 text-zinc-400">▾</span>
    </div>
  );
}
