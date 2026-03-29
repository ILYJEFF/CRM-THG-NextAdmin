"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  saveJobOrderCareerDraft,
  syncJobOrderCareerPosting,
} from "@/app/actions/crm";
import { formatCrm } from "@/lib/crm/datetime";

const EMPLOYMENT = [
  { value: "FULL_TIME", label: "Full time" },
  { value: "PART_TIME", label: "Part time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "TEMPORARY", label: "Temporary" },
  { value: "INTERN", label: "Intern" },
] as const;

const SALARY_PERIOD = [
  { value: "", label: "Not shown" },
  { value: "YEARLY", label: "Yearly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "HOURLY", label: "Hourly" },
] as const;

export function JobOrderCareerPanel({
  jobOrderId,
  initial,
  marketingBaseUrl,
}: {
  jobOrderId: string;
  marketingBaseUrl: string;
  initial: {
    publicDescription: string | null;
    publicLocation: string | null;
    publicEmploymentType: string | null;
    publicCompanyName: string | null;
    responsibilities: string | null;
    requirements: string | null;
    salaryMin: number | null;
    salaryMax: number | null;
    salaryPeriod: string | null;
    careerSlug: string | null;
    careerPublishedAt: string | null;
    careerLastError: string | null;
  };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const [publicDescription, setPublicDescription] = useState(
    initial.publicDescription ?? ""
  );
  const [publicLocation, setPublicLocation] = useState(
    initial.publicLocation ?? ""
  );
  const [publicEmploymentType, setPublicEmploymentType] = useState(
    initial.publicEmploymentType || "FULL_TIME"
  );
  const [publicCompanyName, setPublicCompanyName] = useState(
    initial.publicCompanyName ?? ""
  );
  const [responsibilities, setResponsibilities] = useState(
    initial.responsibilities ?? ""
  );
  const [requirements, setRequirements] = useState(initial.requirements ?? "");
  const [salaryMin, setSalaryMin] = useState(
    initial.salaryMin != null ? String(initial.salaryMin) : ""
  );
  const [salaryMax, setSalaryMax] = useState(
    initial.salaryMax != null ? String(initial.salaryMax) : ""
  );
  const [salaryPeriod, setSalaryPeriod] = useState(
    initial.salaryPeriod ?? ""
  );

  const openingUrl =
    initial.careerSlug && marketingBaseUrl
      ? `${marketingBaseUrl.replace(/\/$/, "")}/openings/${initial.careerSlug}`
      : null;

  function numOrNull(s: string): number | null {
    const t = s.trim();
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) && n > 0 ? n : null;
  }

  function buildDraftPayload() {
    return {
      publicDescription,
      publicLocation,
      publicEmploymentType,
      publicCompanyName,
      responsibilities,
      requirements,
      salaryMin: numOrNull(salaryMin),
      salaryMax: numOrNull(salaryMax),
      salaryPeriod: salaryPeriod || null,
    };
  }

  return (
    <div className="mt-4 space-y-4 border-t border-zinc-100 pt-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Career site posting
        </h4>
        {openingUrl ? (
          <a
            href={openingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-emerald-800 hover:underline"
          >
            View on website ↗
          </a>
        ) : null}
      </div>
      <p className="text-xs leading-relaxed text-zinc-600">
        Draft the public listing here, save, then publish to{" "}
        {marketingBaseUrl.replace(/^https?:\/\//, "")}. Uses the same secret as
        lead ingest on both Vercel projects.
      </p>
      {initial.careerLastError ? (
        <p
          className="rounded-xl bg-red-50 px-3 py-2 text-xs text-red-900"
          role="alert"
        >
          Last sync error: {initial.careerLastError}
        </p>
      ) : null}
      {initial.careerPublishedAt ? (
        <p className="text-xs text-emerald-800">
          Live on site · last published{" "}
          {formatCrm(initial.careerPublishedAt, "MMM d, yyyy · h:mm a")}
        </p>
      ) : initial.careerSlug ? (
        <p className="text-xs text-amber-800">Saved as draft on marketing DB</p>
      ) : null}

      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Public description
        </span>
        <textarea
          value={publicDescription}
          onChange={(e) => setPublicDescription(e.target.value)}
          rows={5}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200/60"
          placeholder="What candidates see on the openings page…"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block sm:col-span-2">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Location shown on posting
          </span>
          <input
            value={publicLocation}
            onChange={(e) => setPublicLocation(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            placeholder="e.g. Dallas, TX or Remote"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Employment type
          </span>
          <select
            value={publicEmploymentType}
            onChange={(e) => setPublicEmploymentType(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
          >
            {EMPLOYMENT.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Company name on posting
          </span>
          <input
            value={publicCompanyName}
            onChange={(e) => setPublicCompanyName(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
            placeholder="Defaults from client record"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Responsibilities (optional)
        </span>
        <textarea
          value={responsibilities}
          onChange={(e) => setResponsibilities(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
        />
      </label>
      <label className="block">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
          Requirements (optional)
        </span>
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Salary min (USD)
          </span>
          <input
            type="number"
            value={salaryMin}
            onChange={(e) => setSalaryMin(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Salary max (USD)
          </span>
          <input
            type="number"
            value={salaryMax}
            onChange={(e) => setSalaryMax(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 px-3 py-2 text-sm"
          />
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Pay period
          </span>
          <select
            value={salaryPeriod}
            onChange={(e) => setSalaryPeriod(e.target.value)}
            className="mt-1 w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm"
          >
            {SALARY_PERIOD.map((o) => (
              <option key={o.value || "none"} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {msg ? (
        <p className="text-xs text-red-800" role="alert">
          {msg}
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setMsg(null);
            startTransition(async () => {
              const r = await saveJobOrderCareerDraft(
                jobOrderId,
                buildDraftPayload()
              );
              if (!r.ok) setMsg(r.error);
              else router.refresh();
            });
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 text-sm font-semibold text-zinc-900 hover:bg-zinc-50"
        >
          {pending ? "Saving…" : "Save posting draft"}
        </button>
        <button
          type="button"
          disabled={pending}
          onClick={() => {
            setMsg(null);
            startTransition(async () => {
              const save = await saveJobOrderCareerDraft(
                jobOrderId,
                buildDraftPayload()
              );
              if (!save.ok) {
                setMsg(save.error);
                return;
              }
              const pub = await syncJobOrderCareerPosting(jobOrderId, true);
              if (!pub.ok) setMsg(pub.error);
              else router.refresh();
            });
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
        >
          Save & publish live
        </button>
        <button
          type="button"
          disabled={pending || !initial.careerSlug}
          onClick={() => {
            setMsg(null);
            startTransition(async () => {
              const r = await syncJobOrderCareerPosting(jobOrderId, false);
              if (!r.ok) setMsg(r.error);
              else router.refresh();
            });
          }}
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm font-semibold text-amber-950 hover:bg-amber-100 disabled:opacity-40"
        >
          Unpublish (draft)
        </button>
      </div>
    </div>
  );
}
