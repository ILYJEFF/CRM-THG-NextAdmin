"use client";

import { useRouter } from "next/navigation";
import {
  buildListSearchParams,
  type ListQueryBase,
} from "@/lib/crm/list-query";
import { MARKETING_WEBSITE_PIPELINE_OPTIONS } from "@/lib/crm/pipeline";

export function WebsitePipelineFilterSelect({
  listPath,
  current,
}: {
  listPath: string;
  current: ListQueryBase;
}) {
  const router = useRouter();
  const wp = current.wp ?? "";

  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor="crm-wp-filter"
        className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500"
      >
        Site stage
      </label>
      <select
        id="crm-wp-filter"
        value={wp}
        onChange={(e) => {
          const v = e.target.value;
          const href = `${listPath}${buildListSearchParams(current, {
            wp: v || null,
            page: null,
          })}`;
          router.push(href);
        }}
        className="min-h-11 min-w-[10rem] rounded-xl border border-zinc-200 bg-white px-3 text-sm font-medium text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
      >
        <option value="">Any stage</option>
        {MARKETING_WEBSITE_PIPELINE_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
