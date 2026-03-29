"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

export function SearchForm({
  placeholder,
  paramName = "q",
}: {
  placeholder: string;
  paramName?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get(paramName) ?? "");

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    const next = new URLSearchParams(params.toString());
    const v = value.trim();
    if (v) next.set(paramName, v);
    else next.delete(paramName);
    const q = next.toString();
    router.push(q ? `${pathname}?${q}` : pathname);
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full min-w-0 flex-col gap-2 sm:flex-row sm:items-stretch sm:gap-2"
    >
      <label className="sr-only" htmlFor="crm-search">
        Search
      </label>
      <input
        id="crm-search"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="min-h-12 w-full min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 text-base text-zinc-900 shadow-sm outline-none ring-0 placeholder:text-zinc-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/30 sm:rounded-2xl"
      />
      <button
        type="submit"
        className="min-h-12 w-full shrink-0 rounded-xl bg-[#0f1419] px-5 text-sm font-semibold text-white active:bg-zinc-800 sm:w-auto sm:rounded-2xl"
      >
        Go
      </button>
    </form>
  );
}
