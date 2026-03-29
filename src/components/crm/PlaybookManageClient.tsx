"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  deletePlaybookSection,
  movePlaybookSection,
  seedPlaybookDefaults,
} from "@/app/actions/desk";

type Row = {
  id: string;
  slug: string;
  title: string;
  eyebrow: string;
  sortOrder: number;
};

export function PlaybookManageClient({ sections }: { sections: Row[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              const r = await seedPlaybookDefaults();
              if (r.ok) router.refresh();
              else alert(r.error);
            })
          }
          className="inline-flex min-h-11 items-center rounded-2xl bg-emerald-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
        >
          Import default sections
        </button>
        <Link
          href="/admin/playbook/sections/new"
          className="inline-flex min-h-11 items-center rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800"
        >
          New section
        </Link>
        <Link
          href="/admin/playbook"
          className="inline-flex min-h-11 items-center rounded-2xl border border-zinc-300 bg-white px-5 text-sm font-semibold text-zinc-800 hover:bg-zinc-50"
        >
          Read playbook
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
        <table className="w-full min-w-[520px] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/90">
              <th className="px-4 py-3 font-semibold text-zinc-700">Order</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">Slug</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">Title</th>
              <th className="px-4 py-3 font-semibold text-zinc-700">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {sections.length === 0 ? (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-zinc-500"
                >
                  No sections. Import defaults or create one.
                </td>
              </tr>
            ) : (
              sections.map((s, idx) => (
                <tr key={s.id} className="hover:bg-amber-50/30">
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <button
                        type="button"
                        disabled={pending || idx === 0}
                        onClick={() =>
                          startTransition(async () => {
                            await movePlaybookSection(s.id, "up");
                            router.refresh();
                          })
                        }
                        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 disabled:opacity-30"
                        aria-label="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        disabled={pending || idx === sections.length - 1}
                        onClick={() =>
                          startTransition(async () => {
                            await movePlaybookSection(s.id, "down");
                            router.refresh();
                          })
                        }
                        className="rounded-lg border border-zinc-200 px-2 py-1 text-xs font-semibold text-zinc-700 disabled:opacity-30"
                        aria-label="Move down"
                      >
                        ↓
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-zinc-600">
                    {s.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-medium text-zinc-900">{s.title}</span>
                    {s.eyebrow ? (
                      <span className="mt-0.5 block text-xs text-zinc-500">
                        {s.eyebrow}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/playbook/sections/${encodeURIComponent(s.slug)}/edit`}
                        className="text-xs font-semibold text-amber-900 hover:underline"
                      >
                        Edit
                      </Link>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => {
                          if (
                            !confirm(
                              `Delete “${s.title}”? This cannot be undone.`
                            )
                          )
                            return;
                          startTransition(async () => {
                            await deletePlaybookSection(s.id);
                            router.refresh();
                          });
                        }}
                        className="text-xs font-semibold text-red-700 hover:underline disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
