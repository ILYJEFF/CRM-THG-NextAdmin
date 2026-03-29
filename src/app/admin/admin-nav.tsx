"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition",
        active
          ? "bg-zinc-800/90 text-white shadow-sm"
          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
      )}
    >
      {children}
    </Link>
  );
}

export function AdminNav() {
  return (
    <div className="flex flex-col gap-1">
      <NavLink href="/admin">Desk</NavLink>
      <NavLink href="/admin/applicants">Applications</NavLink>
      <NavLink href="/admin/candidates">Resume submissions</NavLink>
    </div>
  );
}
