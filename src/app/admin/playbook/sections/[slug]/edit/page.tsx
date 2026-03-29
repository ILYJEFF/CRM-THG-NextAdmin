import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { PlaybookEditForm } from "@/components/crm/PlaybookEditForm";

export const dynamic = "force-dynamic";

export default async function PlaybookEditSectionPage({
  params,
}: {
  params: { slug: string };
}) {
  const slug = decodeURIComponent(params.slug);

  let section: { eyebrow: string; title: string; body: string } | null = null;
  try {
    section = await prisma.crmPlaybookSection.findUnique({
      where: { slug },
      select: { eyebrow: true, title: true, body: true },
    });
  } catch {
    section = null;
  }

  if (!section) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <nav className="text-sm">
        <Link
          href="/admin/playbook/manage"
          className="font-semibold text-amber-900 hover:underline"
        >
          ← Playbook management
        </Link>
      </nav>
      <h1 className="text-2xl font-bold tracking-tight text-zinc-900">
        Edit section
      </h1>
      <PlaybookEditForm slug={slug} initial={section} />
    </div>
  );
}
