import Link from "next/link";
import { PlaybookNewForm } from "@/components/crm/PlaybookNewForm";

export default function PlaybookNewSectionPage() {
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
        New playbook section
      </h1>
      <PlaybookNewForm />
    </div>
  );
}
