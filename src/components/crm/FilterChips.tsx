import Link from "next/link";
import { cn } from "@/lib/cn";

type Chip = { href: string; label: string; active: boolean };

export function FilterChips({ chips }: { chips: Chip[] }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto pb-1 pt-0.5 scrollbar-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chips.map((c) => (
        <Link
          key={c.href}
          href={c.href}
          scroll={false}
          className={cn(
            "shrink-0 rounded-full px-4 py-2.5 text-sm font-semibold transition min-h-[44px] inline-flex items-center",
            c.active
              ? "bg-[#0f1419] text-white shadow-md"
              : "bg-white text-zinc-700 ring-1 ring-zinc-200 active:bg-zinc-100"
          )}
        >
          {c.label}
        </Link>
      ))}
    </div>
  );
}
