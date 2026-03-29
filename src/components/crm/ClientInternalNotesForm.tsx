"use client";

import { FormEvent, useTransition } from "react";
import { updateClientInternalNotes } from "@/app/actions/crm";

export function ClientInternalNotesForm({
  clientId,
  initial,
  hideLabel,
}: {
  clientId: string;
  initial: string | null;
  hideLabel?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const notes = String(fd.get("notes") ?? "");
    startTransition(() => updateClientInternalNotes(clientId, notes));
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {hideLabel ? null : (
        <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Account notes
        </label>
      )}
      <textarea
        name="notes"
        rows={6}
        defaultValue={initial ?? ""}
        placeholder="Relationship context, billing notes, key contacts…"
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
