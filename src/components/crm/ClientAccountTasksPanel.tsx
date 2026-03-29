"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  createAccountTask,
  deleteAccountTask,
  toggleAccountTaskComplete,
} from "@/app/actions/desk";
import { formatCrm } from "@/lib/crm/datetime";

export type AccountTaskRow = {
  id: string;
  title: string;
  description: string | null;
  dueAt: Date | null;
  completedAt: Date | null;
};

export function ClientAccountTasksPanel({
  clientId,
  tasks,
}: {
  clientId: string;
  tasks: AccountTaskRow[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const open = tasks.filter((t) => !t.completedAt);
  const done = tasks.filter((t) => t.completedAt);

  return (
    <div className="space-y-6">
      <form
        className="rounded-2xl border border-zinc-200/90 bg-zinc-50/50 p-4 sm:p-5"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          const form = e.currentTarget;
          startTransition(async () => {
            const r = await createAccountTask(clientId, {
              title: String(fd.get("title") ?? ""),
              description: String(fd.get("description") ?? "") || null,
              dueAt: String(fd.get("dueAt") ?? "") || null,
            });
            if (r.ok) {
              form.reset();
              router.refresh();
            }
          });
        }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
          New maintenance task
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            name="title"
            required
            placeholder="Task title"
            disabled={pending}
            className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 sm:col-span-2"
          />
          <input
            type="date"
            name="dueAt"
            disabled={pending}
            className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400"
          />
          <textarea
            name="description"
            rows={2}
            placeholder="Optional detail"
            disabled={pending}
            className="w-full resize-y rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 sm:col-span-2"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="mt-3 inline-flex min-h-10 items-center rounded-xl bg-amber-600 px-4 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50"
        >
          Add task
        </button>
      </form>

      <div>
        <h3 className="text-sm font-semibold text-zinc-900">Open ({open.length})</h3>
        <ul className="mt-3 space-y-2">
          {open.length === 0 ? (
            <li className="rounded-xl border border-dashed border-zinc-300 px-4 py-8 text-center text-sm text-zinc-500">
              No open tasks. Add renewals, QBR prep, or contract follow-ups above.
            </li>
          ) : (
            open.map((t) => (
              <li
                key={t.id}
                className="flex flex-col gap-2 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-zinc-900">{t.title}</p>
                  {t.description ? (
                    <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600">
                      {t.description}
                    </p>
                  ) : null}
                  {t.dueAt ? (
                    <p className="mt-2 text-xs font-medium text-amber-800">
                      Due {formatCrm(t.dueAt, "MMM d, yyyy")}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await toggleAccountTaskComplete(t.id);
                        router.refresh();
                      })
                    }
                    className="rounded-xl bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
                  >
                    Done
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await deleteAccountTask(t.id);
                        router.refresh();
                      })
                    }
                    className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-900 hover:bg-red-100 disabled:opacity-50"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {done.length > 0 ? (
        <div>
          <h3 className="text-sm font-semibold text-zinc-500">
            Completed ({done.length})
          </h3>
          <ul className="mt-2 space-y-1">
            {done.map((t) => (
              <li
                key={t.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-100 bg-zinc-50/80 px-3 py-2 text-sm text-zinc-600"
              >
                <span className="line-through">{t.title}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">
                    {t.completedAt
                      ? formatCrm(t.completedAt, "MMM d, yyyy")
                      : ""}
                  </span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() =>
                      startTransition(async () => {
                        await toggleAccountTaskComplete(t.id);
                        router.refresh();
                      })
                    }
                    className="text-xs font-semibold text-amber-800 hover:underline disabled:opacity-50"
                  >
                    Reopen
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
