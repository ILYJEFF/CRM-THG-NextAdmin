import Link from "next/link";
import { cn } from "@/lib/cn";

type Chip = { href: string; label: string; active: boolean };

export function FilterChips({ chips }: { chips: Chip[] }) {
  return (
    <div
      className="-mx-1 flex snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-2 pt-1 [scrollbar-width:thin] sm:flex-wrap sm:overflow-visible sm:pb-1 [&::-webkit-scrollbar]:h-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-zinc-300/80"
      style={{ WebkitOverflowScrolling: "touch" }}
    >
      {chips.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          scroll={false}
          className={cn(
            "snap-start shrink-0 rounded-full px-3.5 py-2.5 text-sm font-semibold transition min-h-[44px] inline-flex items-center sm:px-4",
            c.active
              ? "bg-[#0f1419] text-white shadow-sm ring-1 ring-zinc-900/20"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200/90 active:scale-[0.98] active:bg-zinc-50"
          )}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
