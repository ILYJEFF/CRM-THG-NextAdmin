import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PlaybookManageClient } from "@/components/crm/PlaybookManageClient";

export const dynamic = "force-dynamic";

export default async function PlaybookManagePage() {
  let sections: { id: string; slug: string; title: string; eyebrow: string; sortOrder: number }[] =
    [];
  let error: string | null = null;

  try {
    sections = await prisma.crmPlaybookSection.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, slug: true, title: true, eyebrow: true, sortOrder: true },
    });
  } catch {
    error =
      "Could not load playbook. Apply the desk migration (`prisma migrate deploy` or `db push`) then refresh.";
  }

  return (
    <div className="space-y-6">
      <nav className="flex flex-wrap items-center gap-2 text-sm">
        <Link
          href="/admin/playbook"
          className="font-semibold text-amber-900 hover:underline"
        >
          ← Read playbook
        </Link>
        <span className="text-zinc-300">·</span>
        <span className="text-zinc-500">Management</span>
      </nav>

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
          Playbook management
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-600">
          Sections render on the read view in order. Slug becomes the anchor link
          (lowercase, hyphens only).
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : (
        <PlaybookManageClient sections={sections} />
      )}
    </div>
  );
}
