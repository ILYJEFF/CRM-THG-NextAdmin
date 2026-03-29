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
    href: "/admin/candidates",
    label: "Talent",
    match: (p: string) => p.startsWith("/admin/candidates"),
    icon: TalentIcon,
  },
];

function DeskIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={cn("h-6 w-6", active ? "text-amber-400" : "text-zinc-500")}
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
      className={cn("h-6 w-6", active ? "text-amber-400" : "text-zinc-500")}
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

function TalentIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={cn("h-6 w-6", active ? "text-amber-400" : "text-zinc-500")}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.75}
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0-5a4 4 0 110 8 4 4 0 010-8zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
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
      <ul className="mx-auto flex max-w-lg items-stretch justify-around gap-1 px-2 pt-1">
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
                    "max-w-full truncate px-1 text-[10px] font-semibold uppercase tracking-wide",
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
