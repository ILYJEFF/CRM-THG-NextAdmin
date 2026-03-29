"use client";

import { useTransition } from "react";
import { convertContactToClient } from "@/app/actions/crm";

export function ConvertLeadButton({ contactId }: { contactId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          void convertContactToClient(contactId);
        })
      }
      className="min-h-12 w-full rounded-2xl bg-emerald-700 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.99] disabled:opacity-50 sm:w-auto"
    >
      {pending ? "Converting…" : "Convert to client"}
    </button>
  );
}
