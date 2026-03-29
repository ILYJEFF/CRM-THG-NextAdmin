"use client";

import { ContactStatusSelect } from "@/components/crm/ContactStatusSelect";

export function ContactHeroPipelineStrip({
  contactId,
  clientId,
  currentStatus,
}: {
  contactId: string;
  clientId: string | null;
  currentStatus: string;
}) {
  return (
    <div className="mt-6 w-full rounded-2xl border-2 border-amber-400/45 bg-gradient-to-br from-amber-50/95 via-white to-amber-50/40 p-4 shadow-inner ring-1 ring-amber-200/50 sm:p-5">
      {!clientId ? (
        <ContactStatusSelect id={contactId} current={currentStatus} />
      ) : (
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-900/80">
            Pipeline
          </p>
          <p className="text-sm leading-relaxed text-zinc-700">
            <span className="font-semibold text-zinc-900">Converted to client.</span>{" "}
            Job orders and contracts live in the client workspace. You can still
            adjust stage on the Pipeline tab if needed.
          </p>
        </div>
      )}
    </div>
  );
}
