"use client";

import { FormEvent, useTransition } from "react";
import { updateCandidateNotes } from "@/app/actions/crm";

export function CandidateNotesForm({
  id,
  initial,
}: {
  id: string;
  initial: string | null;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const notes = String(fd.get("notes") ?? "");
    startTransition(() => updateCandidateNotes(id, notes));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Recruiter notes
      </label>
      <textarea
        name="notes"
        rows={5}
        defaultValue={initial ?? ""}
        placeholder="Screening notes, client fit, interview feedback…"
        className="w-full resize-y rounded-2xl border border-zinc-200 bg-white p-4 text-base text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
      />
      <button
        type="submit"
        disabled={pending}
        className="min-h-12 w-full rounded-2xl bg-[#0f1419] text-sm font-semibold text-white active:bg-zinc-800 disabled:opacity-50 sm:w-auto sm:px-8"
      >
        {pending ? "Saving…" : "Save notes"}
      </button>
    </form>
  );
}
