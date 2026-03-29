"use client";

import { Fragment, useState } from "react";
import { formatCrm } from "@/lib/crm/datetime";
import { formatStatusLabel } from "@/lib/crm/pipeline";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { CandidateStatusSelect } from "@/components/crm/CandidateStatusSelect";
import { CandidateNotesForm } from "@/components/crm/CandidateNotesForm";
import { marketingResumeUrl } from "@/lib/crm/links";
import { cn } from "@/lib/cn";

export type ResumeRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentLocation: string;
  desiredLocation: string;
  industry: string;
  positionType: string;
  resumeUrl: string | null;
  coverLetter: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
};

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      className={cn(
        "h-5 w-5 text-zinc-500 transition-transform",
        open && "rotate-180"
      )}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

export function ResumeSubmissionsTable({ rows }: { rows: ResumeRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
            No submissions match.
          </li>
        ) : (
          rows.map((c) => {
            const open = openId === c.id;
            const resumeHref = marketingResumeUrl(c.resumeUrl);
            return (
              <li
                key={c.id}
                className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-950/[0.03]"
              >
                <button
                  type="button"
                  onClick={() => setOpenId((x) => (x === c.id ? null : c.id))}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <Chevron open={open} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {c.positionType}
                    </p>
                    <StatusBadge
                      status={c.status}
                      label={formatStatusLabel(c.status, "talent")}
                      className="mt-2"
                    />
                  </div>
                </button>
                {open ? (
                  <div className="space-y-4 border-t border-zinc-200/80 bg-zinc-50/80 px-4 py-4">
                    <p className="text-sm text-zinc-600">{c.email}</p>
                    <p className="text-xs text-zinc-500">
                      {c.currentLocation} → {c.desiredLocation}
                    </p>
                    {resumeHref ? (
                      <a
                        href={resumeHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-semibold text-amber-800"
                      >
                        Open resume
                      </a>
                    ) : null}
                    {c.coverLetter ? (
                      <p className="whitespace-pre-wrap text-sm text-zinc-700">
                        {c.coverLetter}
                      </p>
                    ) : null}
                    <CandidateStatusSelect id={c.id} current={c.status} />
                    <CandidateNotesForm id={c.id} initial={c.notes} />
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg shadow-zinc-900/[0.06] ring-1 ring-zinc-950/[0.04] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/90">
                <th className="w-10 px-2 py-3" aria-hidden />
                <th className="px-3 py-3 font-semibold text-zinc-700">
                  Received
                </th>
                <th className="px-3 py-3 font-semibold text-zinc-700">
                  Person
                </th>
                <th className="px-3 py-3 font-semibold text-zinc-700">Role</th>
                <th className="px-3 py-3 font-semibold text-zinc-700">
                  Locations
                </th>
                <th className="px-3 py-3 font-semibold text-zinc-700">
                  Resume
                </th>
                <th className="px-3 py-3 font-semibold text-zinc-700">Stage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No submissions match.
                  </td>
                </tr>
              ) : (
                rows.map((c) => {
                  const open = openId === c.id;
                  const resumeHref = marketingResumeUrl(c.resumeUrl);
                  return (
                    <Fragment key={c.id}>
                      <tr className={cn(open && "bg-amber-50/20")}>
                        <td className="px-2 py-3 align-top">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenId((x) => (x === c.id ? null : c.id))
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-100"
                            aria-expanded={open}
                          >
                            <Chevron open={open} />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-zinc-600">
                          {formatCrm(c.createdAt, "MMM d, yyyy")}
                        </td>
                        <td className="px-3 py-3">
                          <span className="font-medium text-zinc-900">
                            {c.firstName} {c.lastName}
                          </span>
                          <span className="mt-0.5 block break-all text-xs text-zinc-500">
                            {c.email}
                          </span>
                        </td>
                        <td className="px-3 py-3 text-zinc-700">
                          {c.positionType}
                        </td>
                        <td className="max-w-[140px] px-3 py-3 text-xs text-zinc-600">
                          Open to {c.desiredLocation}
                          <br />
                          Based {c.currentLocation}
                        </td>
                        <td className="px-3 py-3 align-top">
                          {resumeHref ? (
                            <a
                              href={resumeHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-semibold text-amber-800 hover:underline"
                            >
                              Open file
                            </a>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <StatusBadge
                            status={c.status}
                            label={formatStatusLabel(c.status, "talent")}
                          />
                        </td>
                      </tr>
                      {open ? (
                        <tr>
                          <td colSpan={7} className="border-t border-zinc-200 bg-zinc-50/90 p-0">
                            <div className="grid gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
                              <div className="sm:col-span-2 lg:col-span-3">
                                <CandidateStatusSelect
                                  id={c.id}
                                  current={c.status}
                                />
                              </div>
                              {c.coverLetter ? (
                                <div className="sm:col-span-2 lg:col-span-3">
                                  <p className="text-[10px] font-semibold uppercase text-zinc-500">
                                    Cover letter
                                  </p>
                                  <p className="mt-1 max-h-36 overflow-y-auto whitespace-pre-wrap rounded-xl border border-zinc-200 bg-white p-3 text-sm">
                                    {c.coverLetter}
                                  </p>
                                </div>
                              ) : null}
                              <div className="sm:col-span-2 lg:col-span-3">
                                <CandidateNotesForm
                                  id={c.id}
                                  initial={c.notes}
                                />
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
