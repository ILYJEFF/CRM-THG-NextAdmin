"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (signErr) {
        setError(signErr.message);
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="text-center mb-10">
        <p className="text-xs font-medium uppercase tracking-[0.28em] text-zinc-500 mb-2">
          The Hammitt Group
        </p>
        <h1 className="text-2xl font-semibold text-white tracking-tight">
          CRM sign in
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Use your Supabase account for this workspace.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm p-8 shadow-2xl shadow-black/40"
      >
        {error && (
          <div
            className="mb-4 rounded-lg bg-red-950/50 border border-red-900/60 px-3 py-2 text-sm text-red-200"
            role="alert"
          >
            {error}
          </div>
        )}
        <label className="block">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Email
          </span>
          <input
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none ring-0 transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            placeholder="you@company.com"
          />
        </label>
        <label className="block mt-5">
          <span className="text-xs font-medium uppercase tracking-wider text-zinc-500">
            Password
          </span>
          <input
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-zinc-700 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none ring-0 transition focus:border-amber-500/60 focus:ring-2 focus:ring-amber-500/20"
            placeholder="Enter password"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-8 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-amber-900/20 transition hover:from-amber-400 hover:to-amber-500 disabled:opacity-50 disabled:pointer-events-none"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
  );
}
