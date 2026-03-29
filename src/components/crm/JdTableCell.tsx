"use client";

import type { MouseEvent } from "react";
import { cn } from "@/lib/cn";

export function JdTableCell({
  href,
  label,
  linkClassName,
}: {
  href: string | null;
  label?: string;
  /** Defaults to emerald (job description). Use amber for resume links. */
  linkClassName?: string;
}) {
  function stop(e: MouseEvent) {
    e.stopPropagation();
  }

  return (
    <td className="px-4 py-3 align-top" onClick={stop}>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "text-sm font-semibold hover:underline",
            linkClassName ?? "text-emerald-800"
          )}
          onClick={stop}
        >
          {label ?? "Open"}
        </a>
      ) : (
        <span className="text-zinc-400">—</span>
      )}
    </td>
  );
}
