"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  assignCandidateToJobOrder,
  removeSubmission,
  updateSubmissionStage,
} from "@/app/actions/crm";
import { SUBMISSION_STAGES } from "@/lib/crm/pipeline";

type Row = {
  id: string;
  stage: string;
  jobOrder: {
    id: string;
    clientId: string;
    title: string;
    client: { companyName: string | null; contactName: string };
  };
};

export function CandidateJobAssignments({
  candidateId,
  submissions,
  jobOptions,
}: {
  candidateId: string;
  submissions: Row[];
  jobOptions: { id: string; label: string }[];
}) {
  const [pending, startTransition] = useTransition();
  const [jobOrderId, setJobOrderId] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Job order assignments
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Track which client searches this candidate is in and how far they have
        moved.
      </p>

      {msg ? (
        <p className="mt-3 text-sm text-red-800" role="alert">
          {msg}
        </p>
      ) : null}

      {jobOptions.length > 0 ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-end">
          <label className="min-w-0 flex-1">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
              Add to job order
            </span>
            <select
              value={jobOrderId}
              onChange={(e) => setJobOrderId(e.target.value)}
              className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select…</option>
              {jobOptions.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={pending || !jobOrderId}
            onClick={() => {
              setMsg(null);
              startTransition(async () => {
                const r = await assignCandidateToJobOrder(
                  candidateId,
                  jobOrderId
                );
                if (r.ok) {
                  setJobOrderId("");
                } else {
                  setMsg(r.error);
                }
              });
            }}
            className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#0f1419] px-4 text-sm font-semibold text-white disabled:opacity-40"
          >
            Assign
          </button>
        </div>
      ) : (
        <p className="mt-3 text-sm text-zinc-500">
          No open job orders to assign. Add job orders on a client profile first.
        </p>
      )}

      <ul className="mt-5 divide-y divide-zinc-100 rounded-xl border border-zinc-100">
        {submissions.length === 0 ? (
          <li className="px-3 py-8 text-center text-sm text-zinc-500">
            Not assigned to any job orders yet.
          </li>
        ) : (
          submissions.map((s) => (
            <li
              key={s.id}
              className="flex flex-col gap-3 px-3 py-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-medium text-zinc-900">{s.jobOrder.title}</p>
                <p className="text-sm text-zinc-600">
                  {s.jobOrder.client.companyName || s.jobOrder.client.contactName}
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                  <Link
                    href={`/admin/clients/${s.jobOrder.clientId}`}
                    className="text-emerald-800 hover:underline"
                  >
                    Client profile
                  </Link>
                  <Link
                    href={`/admin/jobs#job-${s.jobOrder.id}`}
                    className="text-amber-800 hover:underline"
                  >
                    Job pipeline
                  </Link>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={s.stage}
                  disabled={pending}
                  onChange={(e) => {
                    const v = e.target.value;
                    startTransition(async () => {
                      setMsg(null);
                      const r = await updateSubmissionStage(s.id, v);
                      if (!r.ok) setMsg(r.error);
                    });
                  }}
                  className="rounded-lg border border-zinc-200 bg-white px-2 py-1.5 text-sm"
                  aria-label="Submission stage"
                >
                  {SUBMISSION_STAGES.map((st) => (
                    <option key={st.value} value={st.value}>
                      {st.label}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => {
                    startTransition(async () => {
                      setMsg(null);
                      const r = await removeSubmission(s.id);
                      if (!r.ok) setMsg(r.error);
                    });
                  }}
                  className="text-xs font-semibold text-red-700 hover:underline"
                >
                  Remove
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
