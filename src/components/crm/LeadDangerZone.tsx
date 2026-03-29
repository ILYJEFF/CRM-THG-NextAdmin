"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  convertContactToClient,
  deleteContactLead,
} from "@/app/actions/crm";

export function LeadDangerZone({
  contactId,
  clientId,
  clientsModuleReady = true,
}: {
  contactId: string;
  clientId: string | null;
  /** When false, convert/delete are hidden until DB has clients module. */
  clientsModuleReady?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasClient = Boolean(clientId);

  if (!clientsModuleReady) {
    return (
      <section className="rounded-2xl border border-zinc-200/90 bg-zinc-50/80 p-5 shadow-sm ring-1 ring-zinc-100">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Actions
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">
          Convert and delete require the clients database update (see the yellow
          alert). After you run{" "}
          <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
            prisma db push
          </code>{" "}
          or{" "}
          <code className="rounded bg-zinc-200/80 px-1 py-0.5 text-xs">
            add_clients_module.sql
          </code>
          , refresh this page.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-100">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Actions
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Convert a won lead into an active client to track job orders and store
        contracts in one place.
      </p>

      {message ? (
        <p
          className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-800"
          role="alert"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        {hasClient && clientId ? (
          <button
            type="button"
            onClick={() => router.push(`/admin/clients/${clientId}`)}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 sm:flex-initial"
          >
            Open client profile
          </button>
        ) : (
          <button
            type="button"
            disabled={pending || hasClient}
            onClick={() => {
              setMessage(null);
              startTransition(async () => {
                const r = await convertContactToClient(contactId);
                if (r.ok) {
                  router.push(`/admin/clients/${r.clientId}`);
                  router.refresh();
                } else {
                  setMessage(r.error);
                }
              });
            }}
            className="inline-flex min-h-12 flex-1 items-center justify-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50 sm:flex-initial"
          >
            {pending ? "Converting…" : "Convert to client"}
          </button>
        )}

        {!hasClient ? (
          <div className="flex flex-1 flex-col gap-2 sm:max-w-xs">
            {!confirmDelete ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => setConfirmDelete(true)}
                className="inline-flex min-h-12 items-center justify-center rounded-2xl border-2 border-red-200 bg-red-50/80 px-5 text-sm font-semibold text-red-900 transition hover:bg-red-100"
              >
                Delete lead
              </button>
            ) : (
              <div className="flex flex-col gap-2 rounded-2xl border border-red-200 bg-red-50/50 p-3">
                <p className="text-xs font-medium text-red-900">
                  Permanently delete this lead? This cannot be undone.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => setConfirmDelete(false)}
                    className="min-h-10 flex-1 rounded-xl border border-zinc-200 bg-white text-sm font-semibold text-zinc-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => {
                      setMessage(null);
                      startTransition(async () => {
                        const r = await deleteContactLead(contactId);
                        if (r.ok) {
                          router.push("/admin/contacts");
                          router.refresh();
                        } else {
                          setMessage(r.error);
                          setConfirmDelete(false);
                        }
                      });
                    }}
                    className="min-h-10 flex-1 rounded-xl bg-red-600 text-sm font-semibold text-white"
                  >
                    {pending ? "…" : "Delete"}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </section>
  );
}
