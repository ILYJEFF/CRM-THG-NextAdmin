"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { updatePlaybookSection } from "@/app/actions/desk";

export function PlaybookEditForm({
  slug,
  initial,
}: {
  slug: string;
  initial: { eyebrow: string; title: string; body: string };
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        startTransition(async () => {
          const r = await updatePlaybookSection(slug, {
            eyebrow: String(fd.get("eyebrow") ?? ""),
            title: String(fd.get("title") ?? ""),
            body: String(fd.get("body") ?? ""),
          });
          if (r.ok) {
            router.push("/admin/playbook/manage");
            router.refresh();
          } else {
            alert(r.error);
          }
        });
      }}
    >
      <p className="text-sm text-zinc-600">
        Slug:{" "}
        <code className="rounded bg-zinc-100 px-2 py-0.5 font-mono text-xs">
          {slug}
        </code>{" "}
        (change by deleting and recreating if needed)
      </p>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Eyebrow label
        </label>
        <input
          name="eyebrow"
          defaultValue={initial.eyebrow}
          disabled={pending}
          className="min-h-12 w-full max-w-md rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Title
        </label>
        <input
          name="title"
          required
          defaultValue={initial.title}
          disabled={pending}
          className="min-h-12 w-full rounded-2xl border border-zinc-200 bg-white px-4 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400"
        />
      </div>
      <div>
        <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-zinc-500">
          Body
        </label>
        <textarea
          name="body"
          required
          rows={18}
          defaultValue={initial.body}
          disabled={pending}
          className="w-full resize-y rounded-2xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed text-zinc-900 shadow-sm outline-none focus:border-amber-400"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 items-center rounded-2xl bg-zinc-900 px-6 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
