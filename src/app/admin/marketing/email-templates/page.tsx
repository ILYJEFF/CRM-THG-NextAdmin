"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

interface EmailTemplateRow {
  id: string;
  slug: string;
  name: string;
  subject: string;
  description: string | null;
  category: string;
  isActive: boolean;
  updatedAt: string;
}

const categoryColors: Record<string, string> = {
  auth: "bg-violet-100 text-violet-800 ring-violet-200",
  notifications: "bg-sky-100 text-sky-800 ring-sky-200",
  marketing: "bg-emerald-100 text-emerald-800 ring-emerald-200",
  submitter: "bg-amber-100 text-amber-950 ring-amber-200",
};

const categoryLabels: Record<string, string> = {
  auth: "Authentication",
  notifications: "Notifications",
  marketing: "Marketing",
  submitter: "Form thank-you (to submitter)",
};

export default function CrmEmailTemplatesPage() {
  const [templates, setTemplates] = useState<EmailTemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const fetchTemplates = useCallback(async () => {
    try {
      const response = await fetch("/api/crm/marketing/email-templates");
      if (response.ok) {
        const data = (await response.json()) as EmailTemplateRow[];
        setTemplates(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const toggleActive = async (id: string, currentStatus: boolean) => {
    try {
      const response = await fetch(
        `/api/crm/marketing/email-templates/${id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );
      if (response.ok) fetchTemplates();
    } catch (e) {
      console.error(e);
    }
  };

  const filteredTemplates = templates.filter((t) =>
    filter === "all" ? true : t.category === filter
  );

  const categories = [
    "all",
    ...Array.from(new Set(templates.map((t) => t.category))),
  ];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-200 border-t-amber-500"
          aria-hidden
        />
        <p className="text-sm text-zinc-600">Loading templates…</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
          Email templates
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-zinc-600">
          Edit marketing and submitter-facing copy. Internal team alerts when
          someone submits a form are still sent separately and are not edited
          here.
        </p>
        <div className="rounded-2xl border border-amber-200/90 bg-amber-50/80 px-4 py-3 text-sm text-amber-950 shadow-sm ring-1 ring-amber-100">
          <strong className="font-semibold">Form thank-you:</strong> templates
          in &quot;Form thank-you (to submitter)&quot; go to the person who
          filled out your contact or talent form. Toggle off to stop sending
          the public email without affecting internal notifications.
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            onClick={() => setFilter(category)}
            className={cn(
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              filter === category
                ? "bg-zinc-900 text-white shadow-md shadow-zinc-900/15"
                : "border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
            )}
          >
            {category === "all"
              ? "All templates"
              : categoryLabels[category] || category}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredTemplates.map((template) => (
          <article
            key={template.id}
            className={cn(
              "rounded-2xl border bg-white p-5 shadow-sm ring-1 ring-zinc-100 transition hover:shadow-md",
              template.isActive
                ? "border-zinc-200/90"
                : "border-zinc-200/60 opacity-80"
            )}
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-semibold text-zinc-900">
                    {template.name}
                  </h2>
                  <span
                    className={cn(
                      "inline-flex rounded-lg px-2 py-0.5 text-xs font-medium ring-1",
                      categoryColors[template.category] ||
                        "bg-zinc-100 text-zinc-700 ring-zinc-200"
                    )}
                  >
                    {categoryLabels[template.category] || template.category}
                  </span>
                  {!template.isActive ? (
                    <span className="rounded-lg bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-red-100">
                      Disabled
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-zinc-600">
                  <span className="font-medium text-zinc-700">Subject:</span>{" "}
                  {template.subject}
                </p>
                {template.description ? (
                  <p className="text-sm text-zinc-500">{template.description}</p>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleActive(template.id, template.isActive)}
                  className={cn(
                    "rounded-xl px-3 py-2 text-sm font-medium transition",
                    template.isActive
                      ? "text-red-700 hover:bg-red-50"
                      : "text-emerald-700 hover:bg-emerald-50"
                  )}
                >
                  {template.isActive ? "Disable" : "Enable"}
                </button>
                <Link
                  href={`/admin/marketing/email-templates/${template.id}/edit`}
                  className="inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm transition hover:border-amber-300 hover:bg-amber-50/50"
                >
                  Edit
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredTemplates.length === 0 ? (
        <p className="py-12 text-center text-sm text-zinc-500">
          No templates found.
        </p>
      ) : null}
    </div>
  );
}
