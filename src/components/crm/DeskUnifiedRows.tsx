"use client";

import { Fragment, useState } from "react";
import { formatCrm } from "@/lib/crm/datetime";
import { formatStatusLabel } from "@/lib/crm/pipeline";
import { StatusBadge } from "@/components/crm/StatusBadge";
import { ContactUnifiedStageSelect } from "@/components/crm/ContactUnifiedStageSelect";
import { ClientInternalNotesForm } from "@/components/crm/ClientInternalNotesForm";
import { ConvertLeadButton } from "@/components/crm/ConvertLeadButton";
import { cn } from "@/lib/cn";

export type DeskLeadRow = {
  variant: "lead";
  rowKey: string;
  contactId: string;
  clientId: string | null;
  contactName: string;
  companyName: string | null;
  email: string;
  phone: string;
  city: string;
  industry: string | null;
  openPositions: string | null;
  payBand: string | null;
  message: string;
  pipelineStage: string;
  status: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  jdHref: string | null;
};

export type DeskClientRow = {
  variant: "client";
  rowKey: string;
  clientId: string;
  sourceContactId: string | null;
  contactName: string;
  companyName: string | null;
  email: string;
  phone: string;
  city: string;
  industry: string | null;
  internalNotes: string | null;
  engagementType: string | null;
  createdAt: string;
  updatedAt: string;
};

export type DeskRowPayload = DeskLeadRow | DeskClientRow;

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

function LeadDetail({
  row,
  showConvert,
}: {
  row: DeskLeadRow;
  showConvert: boolean;
}) {
  return (
    <div className="space-y-4 border-t border-zinc-200/80 bg-gradient-to-b from-zinc-50/90 to-white px-4 py-5 sm:px-5">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Phone
          </dt>
          <dd className="mt-0.5 font-medium text-zinc-900">{row.phone}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Industry
          </dt>
          <dd className="mt-0.5 text-zinc-800">{row.industry ?? "—"}</dd>
        </div>
        {row.openPositions ? (
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Open positions
            </dt>
            <dd className="mt-0.5 text-zinc-800">{row.openPositions}</dd>
          </div>
        ) : null}
        {row.payBand ? (
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Pay band
            </dt>
            <dd className="mt-0.5 text-zinc-800">{row.payBand}</dd>
          </div>
        ) : null}
        <div className="sm:col-span-2">
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Message
          </dt>
          <dd className="mt-1 max-h-40 overflow-y-auto whitespace-pre-wrap rounded-xl border border-zinc-200/80 bg-white p-3 text-zinc-800">
            {row.message || "—"}
          </dd>
        </div>
        {row.notes ? (
          <div className="sm:col-span-2">
            <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Desk notes
            </dt>
            <dd className="mt-1 whitespace-pre-wrap text-zinc-700">{row.notes}</dd>
          </div>
        ) : null}
      </dl>
      {row.jdHref ? (
        <p>
          <a
            href={row.jdHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-emerald-800 hover:underline"
          >
            Open job description file
          </a>
        </p>
      ) : null}
      {row.clientId ? (
        <p className="rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-sm font-medium text-emerald-950">
          Linked to client account. Use the Clients or All filter to manage
          notes.
        </p>
      ) : null}
      <ContactUnifiedStageSelect id={row.contactId} current={row.status} />
      {showConvert && !row.clientId ? (
        <ConvertLeadButton contactId={row.contactId} />
      ) : null}
    </div>
  );
}

function ClientDetail({ row }: { row: DeskClientRow }) {
  return (
    <div className="space-y-4 border-t border-zinc-200/80 bg-gradient-to-b from-amber-50/40 to-white px-4 py-5 sm:px-5">
      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Phone
          </dt>
          <dd className="mt-0.5 font-medium text-zinc-900">{row.phone}</dd>
        </div>
        <div>
          <dt className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
            Engagement
          </dt>
          <dd className="mt-0.5 text-zinc-800">{row.engagementType ?? "—"}</dd>
        </div>
        {row.sourceContactId ? (
          <div className="sm:col-span-2">
            <p className="text-xs text-zinc-600">
              Converted from lead{" "}
              <span className="font-mono text-[11px] text-zinc-500">
                {row.sourceContactId}
              </span>
            </p>
          </div>
        ) : null}
      </dl>
      <ClientInternalNotesForm
        clientId={row.clientId}
        initial={row.internalNotes}
      />
    </div>
  );
}

export function DeskUnifiedRows({
  rows,
  viewMode,
  canConvertLead,
}: {
  rows: DeskRowPayload[];
  viewMode: "leads" | "clients" | "all";
  canConvertLead: boolean;
}) {
  const [openKey, setOpenKey] = useState<string | null>(null);

  function toggle(key: string) {
    setOpenKey((k) => (k === key ? null : key));
  }

  return (
    <>
      <ul className="space-y-3 md:hidden">
        {rows.length === 0 ? (
          <li className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 px-4 py-12 text-center text-sm text-zinc-500">
            Nothing in this view. Try another tab or clear filters.
          </li>
        ) : (
          rows.map((row) => {
            const open = openKey === row.rowKey;
            const showConvert =
              canConvertLead &&
              row.variant === "lead" &&
              (viewMode === "leads" || viewMode === "all");
            return (
              <li
                key={row.rowKey}
                className="overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-md shadow-zinc-900/5 ring-1 ring-zinc-950/[0.03]"
              >
                <button
                  type="button"
                  onClick={() => toggle(row.rowKey)}
                  className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-zinc-50/80 active:bg-zinc-100/80"
                >
                  <span className="mt-0.5 shrink-0">
                    <Chevron open={open} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-zinc-900">
                        {row.variant === "lead"
                          ? row.contactName
                          : row.contactName}
                      </span>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                          row.variant === "lead"
                            ? "bg-violet-100 text-violet-900 ring-1 ring-violet-200/80"
                            : "bg-amber-100 text-amber-950 ring-1 ring-amber-200/80"
                        )}
                      >
                        {row.variant === "lead" ? "Lead" : "Client"}
                      </span>
                    </div>
                    {row.variant === "lead" && row.companyName ? (
                      <p className="mt-0.5 text-sm text-zinc-600">
                        {row.companyName}
                      </p>
                    ) : null}
                    {row.variant === "client" && row.companyName ? (
                      <p className="mt-0.5 text-sm text-zinc-600">
                        {row.companyName}
                      </p>
                    ) : null}
                    <p className="mt-2 truncate text-sm text-zinc-600">
                      {row.email}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500">
                      {row.city} ·{" "}
                      {formatCrm(row.createdAt, "MMM d, yyyy")}
                    </p>
                    {row.variant === "lead" ? (
                      <div className="mt-2">
                        <StatusBadge
                          status={row.status}
                          label={formatStatusLabel(row.status, "client")}
                        />
                      </div>
                    ) : null}
                  </div>
                </button>
                {open && row.variant === "lead" ? (
                  <LeadDetail row={row} showConvert={showConvert} />
                ) : null}
                {open && row.variant === "client" ? (
                  <ClientDetail row={row} />
                ) : null}
              </li>
            );
          })
        )}
      </ul>

      <div className="hidden overflow-hidden rounded-xl border border-zinc-200/80 bg-white shadow-sm ring-1 ring-zinc-950/[0.03] md:block">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-gradient-to-r from-amber-50/70 to-white">
                <th className="w-9 px-1.5 py-2" aria-hidden />
                <th className="whitespace-nowrap px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Received
                </th>
                <th className="min-w-[120px] px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Name
                </th>
                <th className="whitespace-nowrap px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Type
                </th>
                <th className="min-w-[140px] px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Email
                </th>
                <th className="whitespace-nowrap px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Market
                </th>
                <th className="min-w-[100px] px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  Stage
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
                    Nothing in this view. Try another tab or clear filters.
                  </td>
                </tr>
              ) : (
                rows.map((row) => {
                  const open = openKey === row.rowKey;
                  const showConvert =
                    canConvertLead &&
                    row.variant === "lead" &&
                    (viewMode === "leads" || viewMode === "all");
                  return (
                    <Fragment key={row.rowKey}>
                      <tr
                        className={cn(
                          "transition",
                          open ? "bg-amber-50/30" : "hover:bg-zinc-50/80"
                        )}
                      >
                        <td className="px-1.5 py-1.5 align-top">
                          <button
                            type="button"
                            onClick={() => toggle(row.rowKey)}
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-600 hover:bg-zinc-200/40"
                            aria-expanded={open}
                            aria-label={open ? "Collapse row" : "Expand row"}
                          >
                            <Chevron open={open} />
                          </button>
                        </td>
                        <td className="whitespace-nowrap px-2.5 py-2 align-top text-zinc-600">
                          {formatCrm(row.createdAt, "MMM d, yyyy")}
                          <span className="block text-[11px] text-zinc-400">
                            {formatCrm(row.createdAt, "h:mm a")}
                          </span>
                        </td>
                        <td className="px-2.5 py-2 align-top">
                          <span className="font-medium text-zinc-900">
                            {row.variant === "lead"
                              ? row.contactName
                              : row.contactName}
                          </span>
                          {row.companyName ? (
                            <span className="mt-0.5 block text-xs text-zinc-500">
                              {row.companyName}
                            </span>
                          ) : null}
                        </td>
                        <td className="px-2.5 py-2 align-top">
                          <span
                            className={cn(
                              "inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
                              row.variant === "lead"
                                ? "bg-violet-50 text-violet-900 ring-violet-200/80"
                                : "bg-amber-50 text-amber-950 ring-amber-200/80"
                            )}
                          >
                            {row.variant === "lead" ? "Lead" : "Client"}
                          </span>
                        </td>
                        <td className="max-w-[min(220px,32vw)] break-all px-2.5 py-2 align-top text-[13px] text-zinc-700">
                          {row.email}
                        </td>
                        <td className="px-2.5 py-2 align-top text-zinc-600">
                          {row.city}
                        </td>
                        <td className="px-2.5 py-2 align-top">
                          {row.variant === "lead" ? (
                            <StatusBadge
                              status={row.status}
                              label={formatStatusLabel(row.status, "client")}
                            />
                          ) : (
                            <span className="text-xs text-zinc-500">
                              Account
                            </span>
                          )}
                        </td>
                      </tr>
                      {open && row.variant === "lead" ? (
                        <tr className="bg-zinc-50/50">
                          <td colSpan={7} className="p-0">
                            <LeadDetail row={row} showConvert={showConvert} />
                          </td>
                        </tr>
                      ) : null}
                      {open && row.variant === "client" ? (
                        <tr className="bg-zinc-50/50">
                          <td colSpan={7} className="p-0">
                            <ClientDetail row={row} />
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
