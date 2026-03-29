"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

const tabs = [
  {
    href: "/admin",
    label: "Desk",
    match: (p: string) => p === "/admin",
    icon: DeskIcon,
  },
  {
    href: "/admin/contacts",
    label: "Leads",
    match: (p: string) => p.startsWith("/admin/contacts"),
    icon: LeadsIcon,
  },
  {
    href: "/admin/clients",
    label: "Clients",
    match: (p: string) => p.startsWith("/admin/clients"),
    icon: ClientsIcon,
  },
  {
    href: "/admin/jobs",
    label: "Jobs",
    match: (p: string) => p.startsWith("/admin/jobs"),
    icon: JobsPipelineIcon,
  },
  {
    href: "/admin/candidates",
    label: "Resumes",
    match: (p: string) => p.startsWith("/admin/candidates"),
    icon: TalentIcon,
  },
];

function DeskIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={cn("h-5 w-5", active ? "text-amber-400" : "text-zinc-500")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
      />
    </svg>
  );
}

function LeadsIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={cn("h-5 w-5", active ? "text-amber-400" : "text-zinc-500")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function ClientsIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={cn("h-5 w-5", active ? "text-amber-400" : "text-zinc-500")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 21h19.5m-18-18v18m15-18v18m-9-8.25h.008v.008H12.75V12.75zm0 3.75h.008v.008H12.75V16.5zm0-7.5h.008v.008H12.75V9zm5.25 5.25h.008v.008H18V12.75zm0 3.75h.008v.008H18V16.5zm0-7.5h.008v.008H18V9zm-12 5.25h.008v.008H6V12.75zm0 3.75h.008v.008H6V16.5zm0-7.5h.008v.008H6V9z"
      />
    </svg>
  );
}

function JobsPipelineIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={cn("h-5 w-5", active ? "text-amber-400" : "text-zinc-500")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function TalentIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={cn("h-5 w-5", active ? "text-amber-400" : "text-zinc-500")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

export function MobileTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/90 bg-[#0c0f14]/95 backdrop-blur-md sm:hidden pb-[env(safe-area-inset-bottom,0px)]"
      aria-label="Primary"
    >
      <ul className="mx-auto flex max-w-2xl items-stretch justify-between gap-0.5 px-0.5 pt-1">
        {tabs.map((tab) => {
          const active = tab.match(pathname);
          return (
            <li key={tab.href} className="min-w-0 flex-1">
              <Link
                href={tab.href}
                className={cn(
                  "flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 rounded-xl py-1.5 transition active:scale-[0.98]",
                  active
                    ? "text-white"
                    : "text-zinc-500 active:bg-zinc-800/50"
                )}
              >
                <tab.icon active={active} />
                <span
                  className={cn(
                    "max-w-full truncate px-0.5 text-[9px] font-semibold uppercase tracking-wide",
                    active ? "text-amber-400" : "text-zinc-500"
                  )}
                >
                  {tab.label}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
