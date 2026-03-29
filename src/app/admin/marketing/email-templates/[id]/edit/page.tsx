"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

interface EmailTemplate {
  id: string;
  slug: string;
  name: string;
  subject: string;
  htmlBody: string;
  description: string | null;
  variables: string | null;
  category: string;
  isActive: boolean;
}

export default function CrmEditEmailTemplatePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const [template, setTemplate] = useState<EmailTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [subject, setSubject] = useState("");
  const [htmlBody, setHtmlBody] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const fetchTemplate = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/crm/marketing/email-templates/${params.id}`
      );
      if (response.ok) {
        const data = (await response.json()) as EmailTemplate;
        setTemplate(data);
        setSubject(data.subject);
        setHtmlBody(data.htmlBody);
      } else {
        router.push("/admin/marketing/email-templates");
      }
    } catch (e) {
      console.error(e);
      router.push("/admin/marketing/email-templates");
    } finally {
      setLoading(false);
    }
  }, [params.id, router]);

  useEffect(() => {
    fetchTemplate();
  }, [fetchTemplate]);

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/crm/marketing/email-templates/${params.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ subject, htmlBody }),
        }
      );
      if (response.ok) {
        setMessage({ type: "success", text: "Template saved." });
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({ type: "error", text: "Failed to save template" });
      }
    } catch {
      setMessage({ type: "error", text: "Something went wrong while saving" });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail.trim()) {
      setMessage({ type: "error", text: "Enter an email address" });
      return;
    }
    setTesting(true);
    setMessage(null);
    try {
      const response = await fetch(
        `/api/crm/marketing/email-templates/${params.id}/test`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: testEmail }),
        }
      );
      if (response.ok) {
        setMessage({
          type: "success",
          text: `Test email sent to ${testEmail.trim()}`,
        });
        setTimeout(() => setMessage(null), 3000);
      } else {
        const data = (await response.json()) as { error?: string };
        setMessage({
          type: "error",
          text: data.error || "Failed to send test email",
        });
      }
    } catch {
      setMessage({ type: "error", text: "Failed to send test email" });
    } finally {
      setTesting(false);
    }
  };

  const variables = template?.variables ? JSON.parse(template.variables) : [];

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3">
        <div
          className="h-9 w-9 animate-spin rounded-full border-2 border-zinc-200 border-t-amber-500"
          aria-hidden
        />
        <p className="text-sm text-zinc-600">Loading template…</p>
      </div>
    );
  }

  if (!template) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/marketing/email-templates"
            className="text-sm font-medium text-amber-800 hover:text-amber-950"
          >
            ← Back to templates
          </Link>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {template.name}
          </h1>
          {template.description ? (
            <p className="mt-1 text-sm text-zinc-600">{template.description}</p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
          >
            {showPreview ? "Hide preview" : "Show preview"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      {message ? (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm",
            message.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-900"
              : "border-red-200 bg-red-50 text-red-900"
          )}
        >
          {message.text}
        </div>
      ) : null}

      <div
        className={cn(
          "grid gap-6",
          showPreview ? "lg:grid-cols-3" : "lg:grid-cols-1"
        )}
      >
        <div className={showPreview ? "lg:col-span-2" : "lg:col-span-1"}>
          <section className="rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ring-zinc-100">
            <div className="border-b border-zinc-100 bg-zinc-50/80 px-5 py-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">
                Editor
              </h2>
            </div>
            <div className="space-y-5 p-5">
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                  Email subject
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                  HTML body
                </label>
                <textarea
                  value={htmlBody}
                  onChange={(e) => setHtmlBody(e.target.value)}
                  rows={20}
                  className="w-full resize-y rounded-xl border border-zinc-200 bg-white p-3 font-mono text-sm text-zinc-900 shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                />
              </div>
              <div className="border-t border-zinc-100 pt-5">
                <label className="mb-1.5 block text-xs font-medium text-zinc-600">
                  Send test email
                </label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="min-h-11 w-full flex-1 rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                  />
                  <button
                    type="button"
                    onClick={handleSendTest}
                    disabled={testing}
                    className="rounded-xl border border-zinc-200 bg-white px-4 py-2.5 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 disabled:opacity-60"
                  >
                    {testing ? "Sending…" : "Send test"}
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>

        {showPreview ? (
          <div className="space-y-4 lg:col-span-1">
            <section className="rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ring-zinc-100">
              <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Variables
                </h2>
              </div>
              <div className="max-h-48 space-y-2 overflow-y-auto p-4">
                {variables.length > 0 ? (
                  variables.map((variable: string) => (
                    <div
                      key={variable}
                      className="flex items-center justify-between gap-2 rounded-lg bg-zinc-50 px-2 py-1.5"
                    >
                      <code className="text-xs text-violet-700">{`{{${variable}}}`}</code>
                      <button
                        type="button"
                        onClick={() =>
                          navigator.clipboard.writeText(`{{${variable}}}`)
                        }
                        className="text-xs font-medium text-zinc-500 hover:text-zinc-800"
                      >
                        Copy
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-zinc-500">No variables</p>
                )}
              </div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-zinc-200/90 bg-white shadow-sm ring-1 ring-zinc-100">
              <div className="border-b border-zinc-100 bg-zinc-50/80 px-4 py-3">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-600">
                  Preview
                </h2>
              </div>
              <div className="h-[min(520px,70vh)]">
                <iframe
                  srcDoc={htmlBody}
                  className="h-full w-full border-0"
                  title="Email preview"
                />
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </div>
  );
}
