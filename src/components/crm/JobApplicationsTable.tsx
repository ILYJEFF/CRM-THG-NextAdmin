"use client";

import { Fragment, useState } from "react";
import { formatCrm } from "@/lib/crm/datetime";
import { formatJobApplicationStatusLabel } from "@/lib/crm/pipeline";
import { ApplicantStatusSelect } from "@/components/crm/ApplicantStatusSelect";
import { cn } from "@/lib/cn";

export type JobAppRow = {
  id: string;
  jobPostingId: string;
  jobTitle: string | null;
  jobCompanyName: string | null;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  currentLocation: string | null;
  resumeUrl: string;
  status: string;
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

export function JobApplicationsTable({ rows }: { rows: JobAppRow[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
            No applications yet.
          </li>
        ) : (
          rows.map((r) => {
            const open = openId === r.id;
            return (
              <li
                key={r.id}
                className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-md ring-1 ring-zinc-950/[0.03]"
              >
                <button
                  type="button"
                  onClick={() => setOpenId((x) => (x === r.id ? null : r.id))}
                  className="flex w-full items-start gap-3 p-4 text-left"
                >
                  <Chevron open={open} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-zinc-900">
                      {r.firstName} {r.lastName}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600">
                      {r.jobTitle ?? "Role"}
                    </p>
                    <p className="mt-2 text-xs text-zinc-500">
                      {formatJobApplicationStatusLabel(r.status)}
                    </p>
                  </div>
                </button>
                {open ? (
                  <div className="space-y-4 border-t border-zinc-200/80 bg-sky-50/40 px-4 py-4">
                    <p className="break-all text-sm text-zinc-700">{r.email}</p>
                    <p className="text-sm text-zinc-600">{r.phone}</p>
                    {r.currentLocation ? (
                      <p className="text-xs text-zinc-500">{r.currentLocation}</p>
                    ) : null}
                    <a
                      href={r.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-sm font-semibold text-sky-800"
                    >
                      Open resume file
                    </a>
                    <ApplicantStatusSelect id={r.id} current={r.status} />
                  </div>
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      <div className="hidden overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg shadow-zinc-900/[0.06] ring-1 ring-zinc-950/[0.04] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-gradient-to-r from-sky-50/80 to-white">
                <th className="w-10 px-2 py-3.5" aria-hidden />
                <th className="px-3 py-3.5 font-semibold text-zinc-700">
                  Applied
                </th>
                <th className="px-3 py-3.5 font-semibold text-zinc-700">
                  Applicant
                </th>
                <th className="px-3 py-3.5 font-semibold text-zinc-700">Role</th>
                <th className="px-3 py-3.5 font-semibold text-zinc-700">
                  Contact
                </th>
                <th className="px-3 py-3.5 font-semibold text-zinc-700">
                  Resume
                </th>
                <th className="px-3 py-3.5 font-semibold text-zinc-700">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No applications yet. They sync when someone applies on the
                    site.
                  </td>
                </tr>
              ) : (
                rows.map((r) => {
                  const open = openId === r.id;
                  return (
                    <Fragment key={r.id}>
                      <tr className={cn(open && "bg-sky-50/30")}>
                        <td className="px-2 py-3 align-top">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenId((x) => (x === r.id ? null : r.id))
                            }
                            className="flex h-11 w-11 items-center justify-center rounded-xl hover:bg-zinc-100"
                            aria-expanded={open}
                          >
                            <Chevron open={open} />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-3 py-3 text-zinc-600">
                          {formatCrm(r.createdAt, "MMM d, yyyy")}
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span className="font-medium text-zinc-900">
                            {r.firstName} {r.lastName}
                          </span>
                          {r.currentLocation ? (
                            <span className="mt-0.5 block text-xs text-zinc-500">
                              {r.currentLocation}
                            </span>
                          ) : null}
                        </td>
                        <td className="max-w-[220px] px-3 py-3 align-top text-zinc-700">
                          <span className="font-medium text-zinc-900">
                            {r.jobTitle ?? "Role"}
                          </span>
                          {r.jobCompanyName ? (
                            <span className="mt-0.5 block text-xs text-zinc-500">
                              {r.jobCompanyName}
                            </span>
                          ) : null}
                        </td>
                        <td className="max-w-[200px] break-all px-3 py-3 align-top text-zinc-700">
                          <div className="text-sm">{r.email}</div>
                          <div className="mt-1 text-xs text-zinc-500">
                            {r.phone}
                          </div>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <a
                            href={r.resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm font-semibold text-sky-800 hover:underline"
                          >
                            Open file
                          </a>
                        </td>
                        <td className="px-3 py-3 align-top">
                          <span className="text-xs font-medium text-zinc-600">
                            {formatJobApplicationStatusLabel(r.status)}
                          </span>
                        </td>
                      </tr>
                      {open ? (
                        <tr>
                          <td colSpan={7} className="border-t border-zinc-200 bg-sky-50/50 p-0">
                            <div className="p-4 sm:max-w-md">
                              <ApplicantStatusSelect
                                id={r.id}
                                current={r.status}
                              />
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
