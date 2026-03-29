import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const candidates = await prisma.crmCandidate.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Candidates
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          Resume submissions from the marketing site ({candidates.length}{" "}
          shown).
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/80">
                <th className="px-4 py-3 font-semibold text-zinc-700 whitespace-nowrap">
                  When
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-700 whitespace-nowrap">
                  Name
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-700 whitespace-nowrap">
                  Email
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-700 whitespace-nowrap">
                  Locations
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-700 whitespace-nowrap">
                  Role
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-700 whitespace-nowrap">
                  Resume
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-700 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {candidates.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No rows in{" "}
                    <code className="text-xs bg-zinc-100 px-1 rounded">
                      crm_candidates
                    </code>
                    . Run{" "}
                    <code className="text-xs bg-zinc-100 px-1 rounded">
                      prisma db push
                    </code>{" "}
                    and submit a test application.
                  </td>
                </tr>
              ) : (
                candidates.map((c) => (
                  <tr
                    key={c.id}
                    className="hover:bg-amber-50/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-zinc-600 whitespace-nowrap align-top">
                      {format(c.createdAt, "MMM d, yyyy")}
                      <br />
                      <span className="text-xs text-zinc-400">
                        {format(c.createdAt, "h:mm a")}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-zinc-900 align-top">
                      {c.firstName} {c.lastName}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 align-top break-all max-w-[160px]">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 align-top text-xs max-w-[140px]">
                      <span className="text-zinc-500">From</span>{" "}
                      {c.currentLocation}
                      <br />
                      <span className="text-zinc-500">To</span>{" "}
                      {c.desiredLocation}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 align-top">
                      <span className="font-medium text-zinc-800">
                        {c.positionType}
                      </span>
                      <span className="block text-xs text-zinc-500 mt-0.5">
                        {c.industry}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {c.resumeUrl ? (
                        <a
                          href={
                            c.resumeUrl.startsWith("http") ||
                            c.resumeUrl.startsWith("data:")
                              ? c.resumeUrl
                              : `${(process.env.NEXT_PUBLIC_MARKETING_URL || "https://www.thehammittgroup.com").replace(/\/$/, "")}${c.resumeUrl.startsWith("/") ? "" : "/"}${c.resumeUrl}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-800 font-medium hover:underline text-xs"
                        >
                          Open
                        </a>
                      ) : (
                        <span className="text-zinc-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <span className="inline-flex rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
