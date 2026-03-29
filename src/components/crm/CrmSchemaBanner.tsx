import type { CrmDbGate } from "@/lib/crm/crm-db-gate";

export function CrmSchemaBanner({ gate }: { gate: CrmDbGate }) {
  if (gate.state === "ok") return null;

  if (gate.state === "db_error") {
    return (
      <div
        className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-950 shadow-sm"
        role="alert"
      >
        <p className="font-semibold">Database connection failed</p>
        <p className="mt-1 leading-relaxed text-red-900/90">
          Prisma could not query Postgres. On Vercel, confirm{" "}
          <code className="rounded bg-red-100/80 px-1 py-0.5 text-xs">
            DATABASE_URL
          </code>{" "}
          matches Supabase (transaction pooler, port 6543) and the password is
          current. Redeploy after fixing env vars.
        </p>
      </div>
    );
  }

  return (
    <div
      className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 shadow-sm"
      role="status"
    >
      <p className="font-semibold">Clients module not on this database yet</p>
      <p className="mt-1 leading-relaxed text-amber-900/90">
        Apply the schema so{" "}
        <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
          crm_clients
        </code>
        , job orders, contracts, and{" "}
        <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
          crm_contacts.clientId
        </code>{" "}
        exist. From a machine with the direct DB URL (port 5432):{" "}
        <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
          npx prisma db push
        </code>
        . Or run{" "}
        <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
          prisma/sql/add_clients_module.sql
        </code>{" "}
        in the Supabase SQL editor, then redeploy.
      </p>
    </div>
  );
}
