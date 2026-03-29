"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState, useTransition } from "react";
import { addClientContractLink, deleteClientContract } from "@/app/actions/crm";
import { formatCrm } from "@/lib/crm/datetime";

type ContractRow = {
  id: string;
  label: string | null;
  fileUrl: string;
  fileName: string;
  createdAt: string;
};

export function ClientContractsPanel({
  clientId,
  contracts,
  uploadEnabled,
}: {
  clientId: string;
  contracts: ContractRow[];
  uploadEnabled: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [linkError, setLinkError] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  function onLinkSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const fileUrl = String(fd.get("fileUrl") ?? "");
    const fileName = String(fd.get("fileName") ?? "");
    const label = String(fd.get("label") ?? "");
    setLinkError(null);
    startTransition(async () => {
      const r = await addClientContractLink(clientId, {
        fileUrl,
        fileName,
        label: label.trim() || undefined,
      });
      if (r.ok) {
        e.currentTarget.reset();
        router.refresh();
      } else {
        setLinkError(r.error);
      }
    });
  }

  async function onUploadSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploadError(null);
    const fd = new FormData(e.currentTarget);
    const file = fd.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setUploadError("Choose a file first.");
      return;
    }
    startTransition(async () => {
      const up = new FormData();
      up.append("file", file);
      const label = fd.get("label");
      if (typeof label === "string" && label.trim()) {
        up.append("label", label.trim());
      }
      const res = await fetch(`/api/crm/clients/${clientId}/contracts`, {
        method: "POST",
        body: up,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setUploadError(
          typeof data.error === "string" ? data.error : "Upload failed"
        );
        return;
      }
      e.currentTarget.reset();
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-2">
        {uploadEnabled ? (
          <form
            onSubmit={onUploadSubmit}
            className="space-y-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Upload file
            </p>
            <p className="text-xs text-zinc-500">
              PDF or Word, up to 12MB. Stored in your S3 bucket.
            </p>
            {uploadError ? (
              <p className="text-sm text-red-700">{uploadError}</p>
            ) : null}
            <input
              name="label"
              placeholder="Label (e.g. MSA 2026)"
              className="min-h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
            />
            <input
              name="file"
              type="file"
              accept=".pdf,.doc,.docx,application/pdf"
              className="w-full text-sm text-zinc-700 file:mr-3 file:rounded-lg file:border-0 file:bg-amber-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-amber-950"
            />
            <button
              type="submit"
              disabled={pending}
              className="min-h-11 w-full rounded-xl bg-[#0f1419] text-sm font-semibold text-white disabled:opacity-50"
            >
              {pending ? "Uploading…" : "Upload contract"}
            </button>
          </form>
        ) : (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50/80 p-4 text-sm text-zinc-600">
            <p className="font-semibold text-zinc-800">File upload</p>
            <p className="mt-2 leading-relaxed">
              Add AWS S3 environment variables to this CRM deployment to enable
              uploads, or paste a hosted document link using the form beside
              this panel.
            </p>
          </div>
        )}

        <form
          onSubmit={onLinkSubmit}
          className="space-y-3 rounded-2xl border border-zinc-200/90 bg-white p-4 shadow-sm"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Link only
          </p>
          <p className="text-xs text-zinc-500">
            Dropbox, Google Drive share link, or signed URL.
          </p>
          {linkError ? (
            <p className="text-sm text-red-700">{linkError}</p>
          ) : null}
          <input
            name="label"
            placeholder="Label (optional)"
            className="min-h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
          />
          <input
            name="fileUrl"
            required
            type="url"
            placeholder="https://…"
            className="min-h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
          />
          <input
            name="fileName"
            required
            placeholder="Display name"
            className="min-h-10 w-full rounded-xl border border-zinc-200 px-3 text-sm"
          />
          <button
            type="submit"
            disabled={pending}
            className="min-h-11 w-full rounded-xl border-2 border-zinc-300 bg-white text-sm font-semibold text-zinc-900 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save link"}
          </button>
        </form>
      </div>

      <ul className="divide-y divide-zinc-100 overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm">
        {contracts.length === 0 ? (
          <li className="px-4 py-10 text-center text-sm text-zinc-500">
            No contracts yet.
          </li>
        ) : (
          contracts.map((c) => (
            <li
              key={c.id}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="min-w-0">
                <p className="font-semibold text-zinc-900">
                  {c.label || c.fileName}
                </p>
                <p className="truncate text-xs text-zinc-500">{c.fileName}</p>
                <p className="mt-1 text-xs text-zinc-400">
                  Added {formatCrm(c.createdAt, "MMM d, yyyy")}
                </p>
                <a
                  href={c.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex text-sm font-semibold text-amber-800 hover:underline"
                >
                  Open document
                </a>
              </div>
              <DeleteContractButton id={c.id} />
            </li>
          ))
        )}
      </ul>
    </div>
  );
}

function DeleteContractButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        startTransition(async () => {
          await deleteClientContract(id);
          router.refresh();
        });
      }}
      className="shrink-0 text-xs font-semibold text-red-700 hover:underline"
    >
      {pending ? "…" : "Remove"}
    </button>
  );
}
