import { AdminNav } from "./admin-nav";
import { MobileHeader } from "@/components/crm/MobileHeader";
import { MobileTabBar } from "@/components/crm/MobileTabBar";

const marketingDefault = "https://www.thehammittgroup.com";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const marketing = (
    process.env.NEXT_PUBLIC_MARKETING_URL || marketingDefault
  ).replace(/\/$/, "");

  return (
    <div className="min-h-dvh flex bg-[#f4f2ee] text-zinc-900">
      <aside className="hidden min-h-dvh w-64 shrink-0 flex-col border-r border-zinc-800/80 bg-[#0f1419] text-zinc-300 md:flex">
        <div className="border-b border-zinc-800/80 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            The Hammitt Group
          </p>
          <h1 className="mt-1 text-lg font-semibold tracking-tight text-white">
            Recruiting CRM
          </h1>
          <p className="mt-2 text-xs leading-relaxed text-zinc-500">
            Client leads and talent from your website forms.
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
          className="flex-1 overflow-y-auto pb-[calc(5.25rem+env(safe-area-inset-bottom,0px))] md:pb-8"
          id="crm-main"
        >
          <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-5 sm:py-6 md:px-8 md:py-8">
            {children}
          </div>
        </main>
        <MobileTabBar />
      </div>
    </div>
  );
}
