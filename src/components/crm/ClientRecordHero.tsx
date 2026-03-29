import Link from "next/link";

type ClientHeroProps = {
  contactName: string;
  companyName: string | null;
  email: string;
  phone: string;
  city: string;
  industry: string | null;
  clientSinceLabel: string;
  sourceLeadId: string | null;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ClientRecordHero({
  contactName,
  companyName,
  email,
  phone,
  city,
  industry,
  clientSinceLabel,
  sourceLeadId,
}: ClientHeroProps) {
  const tel = phone.replace(/\s/g, "");

  return (
    <header className="relative overflow-hidden rounded-3xl border border-emerald-200/60 bg-gradient-to-br from-white via-emerald-50/30 to-white p-6 shadow-md ring-1 ring-emerald-100/80 sm:p-8">
      <div
        className="pointer-events-none absolute -left-20 top-0 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl"
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-4 sm:gap-5">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-700 via-emerald-600 to-emerald-800 text-lg font-bold tracking-tight text-white shadow-lg sm:h-[4.5rem] sm:w-[4.5rem] sm:text-xl"
            aria-hidden
          >
            {initials(contactName)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
                {contactName}
              </h1>
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wide text-emerald-900 ring-1 ring-emerald-200/80">
                Active client
              </span>
            </div>
            {companyName ? (
              <p className="mt-1 text-lg font-medium text-zinc-600">
                {companyName}
              </p>
            ) : (
              <p className="mt-1 text-sm text-zinc-500">No company name</p>
            )}
            <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600">
              <div className="min-w-0">
                <dt className="sr-only">Email</dt>
                <dd className="truncate font-medium text-zinc-800">{email}</dd>
              </div>
              <div>
                <dt className="sr-only">Phone</dt>
                <dd className="font-medium text-zinc-800">{phone}</dd>
              </div>
              <div>
                <dt className="sr-only">Location</dt>
                <dd className="font-medium text-zinc-800">{city}</dd>
              </div>
              {industry ? (
                <div>
                  <dt className="sr-only">Industry</dt>
                  <dd className="font-medium text-zinc-800">{industry}</dd>
                </div>
              ) : null}
            </dl>
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
              <span>Client since {clientSinceLabel}</span>
              {sourceLeadId ? (
                <>
                  <span className="text-zinc-300" aria-hidden>
                    ·
                  </span>
                  <Link
                    href={`/admin/contacts/${sourceLeadId}`}
                    className="font-medium text-amber-800 hover:text-amber-950 hover:underline"
                  >
                    View original lead
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col xl:flex-row">
          <a
            href={`mailto:${encodeURIComponent(email)}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-800"
          >
            <svg
              className="h-4 w-4 opacity-90"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            Email
          </a>
          <a
            href={`tel:${tel}`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-zinc-300 bg-white px-6 text-sm font-semibold text-zinc-900 shadow-sm transition hover:border-emerald-400/50 hover:bg-emerald-50/40"
          >
            <svg
              className="h-4 w-4 text-zinc-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
              />
            </svg>
            Call
          </a>
        </div>
      </div>
    </header>
  );
}
