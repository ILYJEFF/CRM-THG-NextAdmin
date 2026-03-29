"use client";

import { useRouter } from "next/navigation";
import type { KeyboardEvent, MouseEvent } from "react";
import { cn } from "@/lib/cn";

/**
 * Whole row navigates to `href`. Use stopPropagation on cells with inner links.
 */
export function ClickableTableRow({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function go() {
    router.push(href);
  }

  function onKeyDown(e: KeyboardEvent<HTMLTableRowElement>) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      go();
    }
  }

  function onClick(e: MouseEvent<HTMLTableRowElement>) {
    if (e.defaultPrevented) return;
    go();
  }

  return (
    <tr
      className={cn(
        "cursor-pointer transition hover:bg-amber-50/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-amber-400/80",
        className
      )}
      role="link"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      {children}
    </tr>
  );
}
