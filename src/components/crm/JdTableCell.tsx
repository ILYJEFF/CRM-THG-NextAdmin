"use client";

import type { MouseEvent } from "react";

export function JdTableCell({
  href,
  label,
}: {
  href: string | null;
  label?: string;
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
          className="text-sm font-semibold text-emerald-800 hover:underline"
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
