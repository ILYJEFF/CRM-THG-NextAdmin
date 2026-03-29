import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

export default async function ContactsPage() {
  const contacts = await prisma.crmContact.findMany({
    orderBy: { createdAt: "desc" },
    take: 1000,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-semibold text-zinc-900 tracking-tight">
          Contact form submissions
        </h1>
        <p className="mt-1 text-sm text-zinc-600">
          thehammittgroup.com contact form: {contacts.length} shown (newest
          first, up to 1000).
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
                  City
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-700 min-w-[200px]">
                  Message
                </th>
                <th className="px-4 py-3 font-semibold text-zinc-700 whitespace-nowrap">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {contacts.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-12 text-center text-zinc-500"
                  >
                    No rows in{" "}
                    <code className="text-xs bg-zinc-100 px-1 rounded">
                      crm_contacts
                    </code>
                    . Run{" "}
                    <code className="text-xs bg-zinc-100 px-1 rounded">
                      prisma db push
                    </code>{" "}
                    and submit a test form on the marketing site.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
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
                      {c.contactName}
                      {c.companyName ? (
                        <span className="block text-xs font-normal text-zinc-500 mt-0.5">
                          {c.companyName}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-zinc-700 align-top break-all max-w-[180px]">
                      {c.email}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 align-top">
                      {c.city}
                    </td>
                    <td className="px-4 py-3 text-zinc-600 align-top max-w-md">
                      <p className="line-clamp-3 whitespace-pre-wrap">
                        {c.message}
                      </p>
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
