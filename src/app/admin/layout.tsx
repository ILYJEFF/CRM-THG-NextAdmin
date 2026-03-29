import { AdminNav } from "./admin-nav";
import { MobileHeader } from "@/components/crm/MobileHeader";
import { MobileTabBar } from "@/components/crm/MobileTabBar";
import { CrmSchemaBanner } from "@/components/crm/CrmSchemaBanner";
import { getCrmDbGate } from "@/lib/crm/crm-db-gate";
import { CRM_TIME_ZONE_LABEL } from "@/lib/crm/datetime";

const marketingDefault = "https://www.thehammittgroup.com";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const gate = await getCrmDbGate();

  const marketing = (
    process.env.NEXT_PUBLIC_MARKETING_URL || marketingDefault
  ).replace(/\/$/, "");

  return (
    <div className="min-h-dvh flex bg-gradient-to-br from-[#ebe8e2] via-[#f4f2ee] to-[#e8e4dc] text-zinc-900">
      <aside className="hidden min-h-dvh w-64 shrink-0 flex-col border-r border-zinc-800/90 bg-gradient-to-b from-[#1a1f28] via-[#0f1419] to-[#0a0c10] text-zinc-300 md:flex">
        <div className="border-b border-zinc-800/80 bg-zinc-950/20 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-amber-500/80">
            The Hammitt Group
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-white">
            Recruiting CRM
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Leads and clients on the desk. Applications and resumes on their own
            lists.
          </p>
          <p className="mt-2 text-[10px] font-medium uppercase tracking-wider text-zinc-600">
            Times · {CRM_TIME_ZONE_LABEL} (Chicago)
          </p>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          <AdminNav />
        </nav>
        <div className="space-y-2 border-t border-zinc-800/80 p-3">
          <a
            href={marketing}
            className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-zinc-500 transition hover:bg-zinc-800/50 hover:text-zinc-200"
          >
            <span aria-hidden>↗</span>
            Public website
          </a>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full rounded-xl px-3 py-2.5 text-left text-sm text-zinc-500 transition hover:bg-red-950/40 hover:text-red-300"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex min-h-dvh min-w-0 flex-1 flex-col">
        <MobileHeader />
        <main
          className="flex-1 overflow-y-auto pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:pb-0"
          id="crm-main"
        >
          <div className="flex w-full flex-col md:min-h-[calc(100dvh-0px)]">
            <div className="px-3 pb-2 pt-3 sm:px-4 md:border-b md:border-zinc-200/70 md:bg-white/80 md:px-6 md:pb-3 md:pt-4 lg:px-8">
              <CrmSchemaBanner gate={gate} />
            </div>
            <div className="mx-3 mb-6 min-h-[calc(100dvh-7rem)] flex-1 rounded-2xl border border-zinc-200/70 bg-white/[0.98] shadow-sm ring-1 ring-zinc-950/[0.03] sm:mx-4 md:mx-0 md:mb-0 md:min-h-0 md:rounded-none md:border-0 md:shadow-none md:ring-0">
              <div className="p-4 pb-8 sm:p-5 md:min-h-[calc(100dvh-3.5rem)] md:p-6 md:pb-12 lg:px-8 lg:py-6 lg:pb-12 xl:px-10 xl:py-7 xl:pb-14">
                {children}
              </div>
            </div>
          </div>
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
}
