"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { createJobOrder } from "@/app/actions/crm";

export function CreateJobOrderForm({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const title = String(fd.get("title") ?? "");
    const roleSummary = String(fd.get("roleSummary") ?? "");
    const priority = String(fd.get("priority") ?? "normal");
    const notes = String(fd.get("notes") ?? "");
    setError(null);
    startTransition(async () => {
      const r = await createJobOrder(clientId, {
        title,
        roleSummary: roleSummary.trim() || undefined,
        priority,
        notes: notes.trim() || undefined,
      });
      if (r.ok) {
        e.currentTarget.reset();
        router.refresh();
      } else {
        setError(r.error);
      }
    });
  }

  return (
    <form
      onSubmit={onSubmit}
      className="space-y-4 rounded-2xl border border-dashed border-amber-200/80 bg-amber-50/30 p-4"
    >
      <p className="text-xs font-semibold uppercase tracking-wider text-amber-900/80">
        New job order
      </p>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">
          Role / search title <span className="text-red-600">*</span>
        </label>
        <input
          name="title"
          required
          maxLength={240}
          placeholder="e.g. Plant Manager, Dallas"
          className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
        />
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">
          Summary (optional)
        </label>
        <textarea
          name="roleSummary"
          rows={2}
          maxLength={4000}
          placeholder="Scope, comp band, must-haves…"
          className="w-full resize-y rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
        />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-medium text-zinc-600">
            Priority
          </label>
          <select
            name="priority"
            defaultValue="normal"
            className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 shadow-sm outline-none focus:border-amber-400"
          >
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
        <div className="flex items-end">
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-xl bg-[#0f1419] text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {pending ? "Adding…" : "Add job order"}
          </button>
        </div>
      </div>
      <div>
        <label className="mb-1 block text-xs font-medium text-zinc-600">
          Notes (optional)
        </label>
        <textarea
          name="notes"
          rows={2}
          maxLength={16000}
          className="w-full resize-y rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
        />
      </div>
    </form>
  );
}
