"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { addCrmActivity } from "@/app/actions/crm";
import { CRM_ACTIVITY_TYPES } from "@/lib/crm/pipeline";

export function CrmActivityForm({
  entityType,
  entityId,
}: {
  entityType: "contact" | "client" | "candidate";
  entityId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [activityType, setActivityType] = useState("note");
  const [body, setBody] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  return (
    <form
      className="rounded-xl border border-zinc-200 bg-zinc-50/50 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        setMsg(null);
        startTransition(async () => {
          const r = await addCrmActivity(entityType, entityId, {
            activityType,
            body,
          });
          if (r.ok) {
            setBody("");
            router.refresh();
          } else {
            setMsg(r.error);
          }
        });
      }}
    >
      <div className="flex flex-col gap-3">
        <label className="block max-w-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            Type
          </span>
          <select
            value={activityType}
            onChange={(e) => setActivityType(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-2 py-2 text-sm"
          >
            {CRM_ACTIVITY_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-400">
            What happened
          </span>
          <textarea
            required
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={3}
            placeholder="Outcomes, next steps, or context for your team…"
            className="mt-1 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 shadow-sm focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200/60"
          />
        </label>
      </div>
      {msg ? (
        <p className="mt-2 text-sm text-red-800" role="alert">
          {msg}
        </p>
      ) : null}
      <div className="mt-3 flex justify-end">
        <button
          type="submit"
          disabled={pending || !body.trim()}
          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#0f1419] px-5 text-sm font-semibold text-white disabled:opacity-40"
        >
          {pending ? "Saving…" : "Log activity"}
        </button>
      </div>
    </form>
  );
}
