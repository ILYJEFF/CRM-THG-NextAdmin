import { format } from "date-fns";
import { prisma } from "@/lib/prisma";
import { getActivitiesModuleReady } from "@/lib/crm/activities-module";
import { formatActivityTypeLabel } from "@/lib/crm/pipeline";
import { CrmActivityForm } from "@/components/crm/CrmActivityForm";

export async function CrmActivitySection({
  entityType,
  entityId,
}: {
  entityType: "contact" | "client" | "candidate";
  entityId: string;
}) {
  const ready = await getActivitiesModuleReady();
  if (!ready) {
    return (
      <section className="rounded-2xl border border-amber-200/80 bg-amber-50/40 p-5">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-amber-900/80">
          Activity log
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-amber-950/90">
          Add the activity table to unlock call notes and touch history on every
          record. Run{" "}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
            prisma/sql/add_crm_activities.sql
          </code>{" "}
          in Supabase or{" "}
          <code className="rounded bg-amber-100/80 px-1 py-0.5 text-xs">
            npx prisma db push
          </code>
          .
        </p>
      </section>
    );
  }

  const activities = await prisma.crmActivity.findMany({
    where: { entityType, entityId },
    orderBy: { createdAt: "desc" },
    take: 150,
  });

  return (
    <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Activity log
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-zinc-600">
        Every call, email, and note stays on this record so nothing lives only
        in someone&apos;s inbox.
      </p>

      <div className="mt-4">
        <CrmActivityForm entityType={entityType} entityId={entityId} />
      </div>

      <ul className="mt-6 divide-y divide-zinc-100">
        {activities.length === 0 ? (
          <li className="py-8 text-center text-sm text-zinc-500">
            No activity yet. Log the first touch above.
          </li>
        ) : (
          activities.map((a) => (
            <li key={a.id} className="py-4 first:pt-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-zinc-900">
                  {formatActivityTypeLabel(a.activityType)}
                </span>
                <time
                  dateTime={a.createdAt.toISOString()}
                  className="text-xs tabular-nums text-zinc-400"
                >
                  {format(a.createdAt, "MMM d, yyyy · h:mm a")}
                </time>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                {a.body}
              </p>
              {a.actorEmail ? (
                <p className="mt-1 text-xs text-zinc-400">{a.actorEmail}</p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </section>
  );
}
