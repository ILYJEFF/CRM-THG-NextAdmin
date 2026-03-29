import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PlaybookReadPage() {
  let sections: Awaited<ReturnType<typeof prisma.crmPlaybookSection.findMany>>;
  let loadError: string | null = null;

  try {
    sections = await prisma.crmPlaybookSection.findMany({
      orderBy: { sortOrder: "asc" },
    });
  } catch {
    sections = [];
    loadError =
      "Playbook tables are not in this database yet. Run `npx prisma migrate deploy` or `npx prisma db push`, then `npm run seed:playbook`.";
  }

  return (
    <div className="space-y-8 md:space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            Desk playbook
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-600">
            Living reference for fees, warranty language, recruiter standards,
            and account care. Content is stored in Postgres and edited from{" "}
            <Link
              href="/admin/playbook/manage"
              className="font-semibold text-amber-900 hover:underline"
            >
              Playbook management
            </Link>
            .
          </p>
        </div>
        <Link
          href="/admin/playbook/manage"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-2xl bg-zinc-900 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
        >
          Manage sections
        </Link>
      </div>

      {loadError ? (
        <div
          className="rounded-2xl border border-amber-300/80 bg-amber-50 px-5 py-4 text-sm text-amber-950"
          role="alert"
        >
          {loadError}
        </div>
      ) : null}

      {!loadError && sections.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-14 text-center shadow-sm">
          <p className="text-sm font-medium text-zinc-800">No sections yet.</p>
          <p className="mt-2 text-sm text-zinc-600">
            Import defaults or add your first section from management.
          </p>
          <Link
            href="/admin/playbook/manage"
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-amber-600 px-5 text-sm font-semibold text-white hover:bg-amber-500"
          >
            Open playbook management
          </Link>
        </div>
      ) : null}

      {!loadError && sections.length > 0 ? (
        <nav
          className="flex flex-wrap gap-2 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm"
          aria-label="On this page"
        >
          {sections.map((s) => (
            <a
              key={s.id}
              href={`#${s.slug}`}
              className="inline-flex min-h-9 items-center rounded-full bg-zinc-50 px-3.5 text-xs font-semibold text-zinc-800 ring-1 ring-zinc-200/80 transition hover:bg-amber-50 hover:ring-amber-200"
            >
              {s.title}
            </a>
          ))}
        </nav>
      ) : null}

      <div className="grid gap-6 md:gap-8">
        {sections.map((s) => (
          <section
            key={s.id}
            id={s.slug}
            className="scroll-mt-28 rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-100 md:p-8"
          >
            {s.eyebrow ? (
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-800/90">
                {s.eyebrow}
              </p>
            ) : null}
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-zinc-900 md:text-2xl">
              {s.title}
            </h2>
            <div className="mt-5 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
              {s.body}
            </div>
            <p className="mt-6 text-xs text-zinc-400">
              Updated {s.updatedAt.toLocaleDateString()}
            </p>
          </section>
        ))}
      </div>

      <div className="rounded-2xl border border-zinc-200/90 bg-gradient-to-r from-zinc-50 to-amber-50/30 p-5 text-sm text-zinc-700">
        <strong className="text-zinc-900">Reminder:</strong> this playbook is
        internal guidance. Client-facing promises must match signed agreements.
      </div>
    </div>
  );
}
