import Link from "next/link";
import type { CrmDbGate } from "@/lib/crm/crm-db-gate";

export function ClientsModulePlaceholder({ gate }: { gate: CrmDbGate }) {
  if (gate.state === "db_error") {
    return (
      <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-red-200 bg-red-50/80 p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-red-950">
          Cannot load clients
        </h1>
        <p className="text-sm leading-relaxed text-red-900/90">
          The database did not respond. Fix{" "}
          <code className="rounded bg-red-100 px-1 py-0.5 text-xs">
            DATABASE_URL
          </code>{" "}
          on Vercel, then redeploy.
        </p>
        <Link
          href="/admin"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0f1419] px-5 text-sm font-semibold text-white"
        >
          Back to desk
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 rounded-2xl border border-amber-200 bg-amber-50/80 p-6 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-amber-950">
        Clients area needs the database update
      </h1>
      <p className="text-sm leading-relaxed text-amber-900/90">
        The{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
          crm_clients
        </code>{" "}
        table is not in this database yet. Run{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
          npx prisma db push
        </code>{" "}
        with your direct Postgres URL, or execute{" "}
        <code className="rounded bg-amber-100 px-1 py-0.5 text-xs">
          prisma/sql/add_clients_module.sql
        </code>{" "}
        in Supabase.
      </p>
      <Link
        href="/admin"
        className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#0f1419] px-5 text-sm font-semibold text-white"
      >
        Back to desk
      </Link>
    </div>
  );
}
