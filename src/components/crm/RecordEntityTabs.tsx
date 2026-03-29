"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/cn";

const ActiveTabContext = createContext<string>("overview");

export type RecordTabDef = {
  id: string;
  label: string;
  /** Shown when greater than zero */
  badge?: number;
};

export function RecordEntityTabs({
  defaultTabId,
  tabs,
  children,
}: {
  defaultTabId: string;
  tabs: RecordTabDef[];
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const activeTab = useMemo(() => {
    const q = searchParams.get("tab");
    if (q && tabs.some((t) => t.id === q)) return q;
    return defaultTabId;
  }, [searchParams, tabs, defaultTabId]);

  const selectTab = useCallback(
    (id: string) => {
      const next = new URLSearchParams(searchParams.toString());
      next.set("tab", id);
      router.replace(`${pathname}?${next.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  return (
    <ActiveTabContext.Provider value={activeTab}>
      <div className="sticky top-0 z-20 -mx-4 border-b border-zinc-300/60 bg-[#f4f2ee]/90 px-4 shadow-[0_1px_0_0_rgba(0,0,0,0.04)] backdrop-blur-md sm:-mx-5 sm:px-5 md:-mx-8 md:px-8">
        <div
          role="tablist"
          aria-label="Record sections"
          className="flex gap-1 overflow-x-auto py-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {tabs.map((t) => {
            const on = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                id={`tab-trigger-${t.id}`}
                aria-selected={on}
                aria-controls={`tab-panel-${t.id}`}
                tabIndex={on ? 0 : -1}
                onClick={() => selectTab(t.id)}
                className={cn(
                  "flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition",
                  on
                    ? "bg-white text-zinc-900 shadow-md ring-1 ring-zinc-200/90"
                    : "text-zinc-600 hover:bg-white/80 hover:text-zinc-900"
                )}
              >
                {t.label}
                {t.badge !== undefined && t.badge > 0 ? (
                  <span className="rounded-md bg-amber-200/90 px-1.5 py-0.5 text-[11px] font-bold tabular-nums text-amber-950">
                    {t.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-8">{children}</div>
    </ActiveTabContext.Provider>
  );
}

/**
 * Keeps all panels mounted so form state survives tab switches. Inactive
 * panels use the native hidden attribute for accessibility.
 */
export function RecordTabPanel({
  id,
  children,
}: {
  id: string;
  children: ReactNode;
}) {
  const activeTab = useContext(ActiveTabContext);
  const selected = activeTab === id;
  return (
    <div
      role="tabpanel"
      id={`tab-panel-${id}`}
      aria-labelledby={`tab-trigger-${id}`}
      hidden={!selected}
      className={cn(!selected && "hidden")}
    >
      <div className="mx-auto max-w-4xl space-y-8 pb-16">{children}</div>
    </div>
  );
}
