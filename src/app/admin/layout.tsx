import Link from "next/link";
import { AdminNav } from "./admin-nav";

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
    <div className="min-h-screen flex bg-[#faf9f7] text-zinc-900">
      <aside className="hidden sm:flex w-60 shrink-0 flex-col bg-[#0f1419] text-zinc-300 border-r border-zinc-800/80">
        <div className="p-5 border-b border-zinc-800/80">
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-zinc-500">
            THG
          </p>
          <h1 className="mt-1 text-lg font-semibold text-white tracking-tight">
            CRM
          </h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          <AdminNav />
        </nav>
        <div className="p-3 border-t border-zinc-800/80 space-y-2">
          <a
            href={marketing}
            className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-200 transition"
          >
            <span aria-hidden>↗</span>
            Marketing site
          </a>
          <form action="/auth/signout" method="POST">
            <button
              type="submit"
              className="w-full text-left rounded-xl px-3 py-2 text-sm text-zinc-500 hover:bg-red-950/40 hover:text-red-300 transition"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sm:hidden bg-[#0f1419] text-white border-b border-zinc-800">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="font-semibold">THG CRM</span>
            <form action="/auth/signout" method="POST">
              <button type="submit" className="text-sm text-zinc-400">
                Out
              </button>
            </form>
          </div>
          <nav className="flex border-t border-zinc-800/80">
            {[
              { href: "/admin", label: "Overview" },
              { href: "/admin/contacts", label: "Contact" },
              { href: "/admin/candidates", label: "Resume" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex-1 text-center py-2.5 text-xs font-medium text-zinc-400 hover:text-white hover:bg-zinc-800/50 transition"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 overflow-auto">
          <div className="max-w-5xl mx-auto px-4 py-8 sm:px-8 sm:py-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
