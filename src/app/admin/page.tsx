import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function AdminHomePage() {
  const [contactCount, candidateCount, recentContacts, recentCandidates] =
    await Promise.all([
      prisma.crmContact.count(),
      prisma.crmCandidate.count(),
      prisma.crmContact.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          contactName: true,
          email: true,
          city: true,
          createdAt: true,
        },
      }),
      prisma.crmCandidate.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          positionType: true,
          createdAt: true,
        },
      }),
    ]);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Overview
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Contact and resume submissions from thehammittgroup.com sync into
          this CRM (live forms plus any backfill you run from the site repo).
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/admin/contacts"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition hover:border-amber-200/80 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Contact forms
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
            {contactCount}
          </p>
          <p className="mt-3 text-sm text-amber-700/90 font-medium group-hover:underline">
            View all →
          </p>
        </Link>
        <Link
          href="/admin/candidates"
          className="group rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition hover:border-amber-200/80 hover:shadow-md"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Resume forms
          </p>
          <p className="mt-2 text-3xl font-semibold tabular-nums text-zinc-900">
            {candidateCount}
          </p>
          <p className="mt-3 text-sm text-amber-700/90 font-medium group-hover:underline">
            View all →
          </p>
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Recent contact forms
            </h2>
            <Link
              href="/admin/contacts"
              className="text-xs font-medium text-amber-800 hover:underline"
            >
              Open list
            </Link>
          </div>
          <ul className="rounded-2xl border border-zinc-200/80 bg-white divide-y divide-zinc-100 overflow-hidden shadow-sm">
            {recentContacts.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-zinc-500">
                No contacts yet. Submissions will appear after the next form
                send.
              </li>
            ) : (
              recentContacts.map((c) => (
                <li
                  key={c.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                >
                  <div>
                    <p className="font-medium text-zinc-900">{c.contactName}</p>
                    <p className="text-sm text-zinc-600">{c.email}</p>
                  </div>
                  <p className="text-xs text-zinc-500 sm:text-right">
                    {c.city} · {format(c.createdAt, "MMM d, h:mm a")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>

        <section>
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-sm font-semibold text-zinc-900">
              Recent resume submissions
            </h2>
            <Link
              href="/admin/candidates"
              className="text-xs font-medium text-amber-800 hover:underline"
            >
              Open list
            </Link>
          </div>
          <ul className="rounded-2xl border border-zinc-200/80 bg-white divide-y divide-zinc-100 overflow-hidden shadow-sm">
            {recentCandidates.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-zinc-500">
                No candidates yet. Resume submissions will show up here.
              </li>
            ) : (
              recentCandidates.map((c) => (
                <li
                  key={c.id}
                  className="px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1"
                >
                  <div>
                    <p className="font-medium text-zinc-900">
                      {c.firstName} {c.lastName}
                    </p>
                    <p className="text-sm text-zinc-600">{c.email}</p>
                  </div>
                  <p className="text-xs text-zinc-500 sm:text-right">
                    {c.positionType} · {format(c.createdAt, "MMM d, h:mm a")}
                  </p>
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}
