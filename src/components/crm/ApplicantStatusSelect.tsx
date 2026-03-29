"use client";

import { useTransition } from "react";
import { updateJobApplicationStatus } from "@/app/actions/crm";
import { JOB_APPLICATION_STATUSES } from "@/lib/crm/pipeline";

export function ApplicantStatusSelect({
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
        startTransition(() => updateJobApplicationStatus(id, e.target.value));
      }}
      className="min-h-10 w-full max-w-[9rem] rounded-xl border border-sky-200 bg-sky-50/50 px-2 py-2 text-xs font-semibold text-sky-950 shadow-sm outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-400/30 disabled:opacity-60"
      aria-label="Application status"
    >
      {!JOB_APPLICATION_STATUSES.some((s) => s.value === current) ? (
        <option value={current}>{current}</option>
      ) : null}
      {JOB_APPLICATION_STATUSES.map((s) => (
        <option key={s.value} value={s.value}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
