import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AgreedToMarketingPage() {
  const rows = await prisma.crmAgreedToMarketing.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white">
          Agreed to marketing
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-zinc-400">
          People who opted in on the contact form. Only name, phone, email,
          company, title, and city are stored here for THG marketing outreach.
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/50">
        <div className="overflow-x-auto">
          <table className="min-w-[900px] w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-xs font-semibold uppercase tracking-wide text-zinc-500">
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Company</th>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3 whitespace-nowrap">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No marketing opt-ins yet. They appear when someone submits
                    the contact form with the marketing checkbox checked.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="text-zinc-200 hover:bg-zinc-800/40"
                  >
                    <td className="px-4 py-3 font-medium text-white">
                      {r.contactName}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap tabular-nums text-zinc-300">
                      {r.phone}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{r.email}</td>
                    <td className="px-4 py-3 text-zinc-300">
                      {r.companyName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">
                      {r.jobTitle ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-zinc-300">{r.city}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-zinc-500">
                      {r.createdAt.toLocaleString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "numeric",
                        minute: "2-digit",
                      })}
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
