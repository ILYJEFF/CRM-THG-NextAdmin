"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

function titleForPath(path: string): { title: string; back?: string } {
  if (path === "/admin") return { title: "Recruiting desk" };
  if (path === "/admin/contacts") return { title: "Leads" };
  if (path === "/admin/clients") return { title: "Active clients" };
  if (path === "/admin/jobs") return { title: "Job orders" };
  if (path === "/admin/candidates") return { title: "Talent pipeline" };
  if (path === "/admin/companies") return { title: "Company accounts" };
  if (path === "/admin/playbook") return { title: "Desk playbook", back: "/admin" };
  if (path === "/admin/playbook/manage")
    return { title: "Playbook CMS", back: "/admin/playbook" };
  if (path === "/admin/playbook/sections/new")
    return { title: "New section", back: "/admin/playbook/manage" };
  if (/^\/admin\/playbook\/sections\/.+\/edit$/.test(path))
    return { title: "Edit section", back: "/admin/playbook/manage" };
  if (path.startsWith("/admin/clients/"))
    return { title: "Client", back: "/admin/clients" };
  if (path.startsWith("/admin/contacts/"))
    return { title: "Lead", back: "/admin/contacts" };
  if (path.startsWith("/admin/candidates/"))
    return { title: "Candidate", back: "/admin/candidates" };
  return { title: "THG CRM" };
}

export function MobileHeader() {
  const pathname = usePathname();
  const { title, back } = titleForPath(pathname);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 flex min-h-[3.25rem] items-center gap-3 border-b border-zinc-800/80 bg-[#0f1419]/95 px-3 py-2 backdrop-blur-md sm:hidden pt-[max(0.5rem,env(safe-area-inset-top))]"
      )}
    >
      {back ? (
        <Link
          href={back}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-zinc-300 active:bg-zinc-800"
          aria-label="Back"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
      ) : (
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-xs font-bold text-amber-400">
          THG
        </div>
      )}
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
