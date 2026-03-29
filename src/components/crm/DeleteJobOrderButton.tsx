"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteJobOrder } from "@/app/actions/crm";

export function DeleteJobOrderButton({ id }: { id: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  return (
    <div className="text-right">
      {!open ? (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="text-xs font-semibold text-red-700 underline-offset-2 hover:underline"
        >
          Remove
        </button>
      ) : (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <span className="text-xs text-zinc-600">Sure?</span>
          <button
            type="button"
            disabled={pending}
            onClick={() => setOpen(false)}
            className="rounded-lg border border-zinc-200 bg-white px-2 py-1 text-xs font-semibold text-zinc-800"
          >
            No
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const r = await deleteJobOrder(id);
                if (r.ok) {
                  setOpen(false);
                  router.refresh();
                }
              });
            }}
            className="rounded-lg bg-red-600 px-2 py-1 text-xs font-semibold text-white"
          >
            {pending ? "…" : "Yes"}
          </button>
        </div>
      )}
    </div>
  );
}
