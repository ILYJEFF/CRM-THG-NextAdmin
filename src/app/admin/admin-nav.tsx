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

function NavGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="px-3 pb-0.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-600">
        {label}
      </p>
      <div className="space-y-0.5">{children}</div>
    </div>
  );
}

export function AdminNav() {
  return (
    <div className="flex flex-col gap-5">
      <NavGroup label="Workspace">
        <NavLink href="/admin">Recruiting desk</NavLink>
      </NavGroup>
      <NavGroup label="Pipeline">
        <NavLink href="/admin/contacts">Client leads</NavLink>
        <NavLink href="/admin/candidates">Talent pipeline</NavLink>
        <NavLink href="/admin/jobs">Job orders</NavLink>
      </NavGroup>
      <NavGroup label="Accounts">
        <NavLink href="/admin/clients">Active clients</NavLink>
        <NavLink href="/admin/companies">Company accounts</NavLink>
      </NavGroup>
      <NavGroup label="Marketing">
        <NavLink href="/admin/marketing/email-templates">
          Email templates
        </NavLink>
        <NavLink href="/admin/marketing/nurture">Nurture campaigns</NavLink>
      </NavGroup>
    </div>
  );
}
