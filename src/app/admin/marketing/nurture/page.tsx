"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Row = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  updatedAt: string;
  _count: { members: number };
};

export default function CrmNurtureCampaignsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/crm/marketing/nurture-campaigns");
        if (r.ok) setRows(await r.json());
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-600">Loading campaigns…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            Nurture campaigns
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Build targeted audiences for marketing sends. This is separate from
            internal alert emails to your team. Add people manually; lists can
            grow without limit.
          </p>
        </div>
        <Link
          href="/admin/marketing/nurture/new"
          className="inline-flex items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          New campaign
        </Link>
      </div>

      <div className="space-y-3">
        {rows.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/80 py-14 text-center text-sm text-zinc-500 shadow-sm">
            No campaigns yet. Create one to start a targeted list.
          </div>
        ) : (
          rows.map((c) => (
            <Link
              key={c.id}
              href={`/admin/marketing/nurture/${c.id}`}
              className="block rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-100 transition hover:border-amber-200/80 hover:shadow-md"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold text-zinc-900">
                      {c.name}
                    </h2>
                    {!c.isActive ? (
                      <span className="rounded-lg bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                        Paused
                      </span>
                    ) : null}
                  </div>
                  {c.description ? (
                    <p className="mt-1 line-clamp-2 text-sm text-zinc-500">
                      {c.description}
                    </p>
                  ) : null}
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-2xl font-bold tabular-nums text-amber-700">
                    {c._count.members}
                  </p>
                  <p className="text-xs font-medium text-zinc-500">people</p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
