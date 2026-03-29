"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createClientManual } from "@/app/actions/crm";
import { cn } from "@/lib/cn";

const empty = {
  contactName: "",
  email: "",
  phone: "",
  city: "",
  companyName: "",
  industry: "",
  engagementType: "",
  internalNotes: "",
};

export function AddClientPanel() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(empty);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(
    null
  );
  const [pending, startTransition] = useTransition();

  function reset() {
    setForm(empty);
    setMessage(null);
  }

  function submit() {
    setMessage(null);
    startTransition(() => {
      void (async () => {
        const r = await createClientManual({
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          city: form.city,
          companyName: form.companyName || undefined,
          industry: form.industry || undefined,
          engagementType: form.engagementType || undefined,
          internalNotes: form.internalNotes || undefined,
        });
        if (r.ok) {
          setForm(empty);
          setOpen(false);
          setMessage({
            type: "ok",
            text: "Client saved. Open Clients or All to see them in the list.",
          });
          router.refresh();
        } else {
          setMessage({ type: "err", text: r.error });
        }
      })();
    });
  }

  return (
    <div className="rounded-xl border border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white/80 p-3 shadow-sm ring-1 ring-amber-900/[0.04] md:p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Client accounts</p>
          <p className="mt-0.5 text-xs text-zinc-600">
            Add a company here without converting a lead. Same list as converted clients.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setOpen((o) => !o);
            setMessage(null);
          }}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl px-4 text-sm font-semibold transition",
            open
              ? "bg-zinc-200 text-zinc-900 ring-1 ring-zinc-300 hover:bg-zinc-100"
              : "bg-amber-600 text-white shadow-sm hover:bg-amber-700"
          )}
        >
          {open ? "Close form" : "Add client"}
        </button>
      </div>

      {message ? (
        <p
          className={cn(
            "mt-3 rounded-lg px-3 py-2 text-sm",
            message.type === "ok"
              ? "bg-emerald-50 text-emerald-900 ring-1 ring-emerald-200/80"
              : "bg-red-50 text-red-900 ring-1 ring-red-200/80"
          )}
          role="status"
        >
          {message.text}
        </p>
      ) : null}

      {open ? (
        <div className="mt-4 space-y-4 border-t border-amber-200/60 pt-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Contact name <span className="text-red-600">*</span>
              </span>
              <input
                required
                value={form.contactName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, contactName: e.target.value }))
                }
                className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                autoComplete="name"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Email <span className="text-red-600">*</span>
              </span>
              <input
                required
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                autoComplete="email"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Phone <span className="text-red-600">*</span>
              </span>
              <input
                required
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                autoComplete="tel"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                City <span className="text-red-600">*</span>
              </span>
              <input
                required
                value={form.city}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
                className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                autoComplete="address-level2"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Company
              </span>
              <input
                value={form.companyName}
                onChange={(e) =>
                  setForm((f) => ({ ...f, companyName: e.target.value }))
                }
                className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                autoComplete="organization"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Industry
              </span>
              <input
                value={form.industry}
                onChange={(e) =>
                  setForm((f) => ({ ...f, industry: e.target.value }))
                }
                className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Engagement
              </span>
              <input
                value={form.engagementType}
                onChange={(e) =>
                  setForm((f) => ({ ...f, engagementType: e.target.value }))
                }
                placeholder="e.g. retained, project"
                className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-zinc-500">
                Internal notes
              </span>
              <textarea
                rows={3}
                value={form.internalNotes}
                onChange={(e) =>
                  setForm((f) => ({ ...f, internalNotes: e.target.value }))
                }
                className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
              />
            </label>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={pending}
              onClick={() => {
                reset();
                setOpen(false);
              }}
              className="min-h-11 rounded-xl bg-zinc-100 px-4 text-sm font-semibold text-zinc-800 ring-1 ring-zinc-200 transition hover:bg-zinc-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={pending}
              onClick={submit}
              className="min-h-11 rounded-xl bg-[#0f1419] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800 disabled:opacity-50"
            >
              {pending ? "Saving…" : "Save client"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
