import type { ReactNode } from "react";

export function RecordSectionCard({
  title,
  description,
  children,
  variant = "default",
}: {
  title: string;
  description?: string;
  children: ReactNode;
  variant?: "default" | "muted" | "emphasis";
}) {
  const shell =
    variant === "emphasis"
      ? "border-amber-200/80 bg-gradient-to-b from-amber-50/50 to-white ring-amber-100/60"
      : variant === "muted"
        ? "border-zinc-200/70 bg-zinc-50/40 ring-zinc-100/80"
        : "border-zinc-200/90 bg-white ring-zinc-100";

  return (
    <section
      className={`rounded-2xl border p-5 shadow-sm ring-1 sm:p-6 ${shell}`}
    >
      <div className="border-b border-zinc-200/60 pb-4">
        <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
        {description ? (
          <p className="mt-1.5 text-sm leading-relaxed text-zinc-600">
            {description}
          </p>
        ) : null}
      </div>
      <div className="pt-5">{children}</div>
    </section>
  );
}
