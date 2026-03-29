"use client";

import { useEffect, useState, useTransition } from "react";
import {
  clearContactMessage,
  updateContactMessage,
} from "@/app/actions/crm";

export function ContactSubmissionMessagePanel({
  id,
  initial,
  submittedAtLabel,
}: {
  id: string;
  initial: string;
  submittedAtLabel: string;
}) {
  const [text, setText] = useState(initial);
  const [confirmClear, setConfirmClear] = useState(false);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    setText(initial);
    setConfirmClear(false);
  }, [id, initial]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-zinc-600">
          Edit the stored inquiry text, save changes, or clear it. Clearing does
          not delete the lead.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() =>
              startTransition(() => {
                void updateContactMessage(id, text);
              })
            }
            className="inline-flex min-h-10 items-center justify-center rounded-xl bg-zinc-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save message"}
          </button>
          {!confirmClear ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => setConfirmClear(true)}
              className="inline-flex min-h-10 items-center justify-center rounded-xl border-2 border-red-200 bg-red-50/80 px-4 text-sm font-semibold text-red-900 transition hover:bg-red-100 disabled:opacity-50"
            >
              Clear response
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-red-200 bg-red-50/60 px-3 py-2">
              <span className="text-xs font-medium text-red-900">
                Erase all message text?
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  startTransition(() => {
                    void clearContactMessage(id).then(() => {
                      setText("");
                      setConfirmClear(false);
                    });
                  })
                }
                className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Yes, clear
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmClear(false)}
                className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800"
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={8}
        className="w-full resize-y rounded-2xl border border-zinc-200 bg-white p-4 text-base leading-relaxed text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30"
        placeholder="No message text"
      />
      <p className="border-t border-amber-200/60 pt-4 text-xs text-zinc-500">
        Submitted {submittedAtLabel}
      </p>
    </div>
  );
}
