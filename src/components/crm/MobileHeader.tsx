"use client";

import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

function titleForPath(path: string): string {
  if (path === "/admin") return "Desk";
  if (path === "/admin/applicants") return "Applications";
  if (path === "/admin/candidates") return "Resume submissions";
  return "THG CRM";
}

export function MobileHeader() {
  const pathname = usePathname();
  const title = titleForPath(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex min-h-[3.25rem] items-center gap-3 border-b border-zinc-800/80 bg-[#0f1419]/95 px-3 py-2 backdrop-blur-md sm:hidden pt-[max(0.5rem,env(safe-area-inset-top))]"
      )}
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-xs font-bold text-amber-400">
        THG
      </div>
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold tracking-tight text-white">
          {title}
        </h1>
        <p className="truncate text-[11px] text-zinc-500">
          The Hammitt Group
        </p>
      </div>
      <form action="/auth/signout" method="POST">
        <button
          type="submit"
          className="min-h-11 min-w-11 rounded-xl px-2 text-xs font-medium text-zinc-400 active:bg-zinc-800"
        >
          Log out
        </button>
      </form>
    </header>
  );
}
