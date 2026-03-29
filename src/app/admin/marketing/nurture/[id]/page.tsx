"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

type Campaign = {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  _count: { members: number };
};

type Member = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  notes: string | null;
  source: string | null;
  createdAt: string;
};

export default function CrmNurtureCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    const [cRes, mRes] = await Promise.all([
      fetch(`/api/crm/marketing/nurture-campaigns/${id}`),
      fetch(`/api/crm/marketing/nurture-campaigns/${id}/members`),
    ]);
    if (!cRes.ok) {
      setCampaign(null);
      setLoading(false);
      return;
    }
    setCampaign(await cRes.json());
    if (mRes.ok) setMembers(await mRes.json());
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  async function addMember(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setAdding(true);
    try {
      const r = await fetch(`/api/crm/marketing/nurture-campaigns/${id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          firstName: firstName || null,
          lastName: lastName || null,
          notes: notes || null,
          source: "manual",
        }),
      });
      const data = (await r.json()) as { error?: string };
      if (!r.ok) {
        setMsg(data.error || "Could not add");
        return;
      }
      setEmail("");
      setFirstName("");
      setLastName("");
      setNotes("");
      await load();
      setMsg("Added to list.");
    } finally {
      setAdding(false);
    }
  }

  async function removeMember(memberId: string) {
    if (!confirm("Remove this person from the campaign?")) return;
    const r = await fetch(
      `/api/crm/marketing/nurture-campaigns/${id}/members/${memberId}`,
      { method: "DELETE" }
    );
    if (r.ok) await load();
  }

  async function toggleActive() {
    if (!campaign) return;
    await fetch(`/api/crm/marketing/nurture-campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !campaign.isActive }),
    });
    await load();
  }

  async function deleteCampaign() {
    if (
      !confirm(
        "Delete this campaign and all members? This cannot be undone."
      )
    ) {
      return;
    }
    const r = await fetch(`/api/crm/marketing/nurture-campaigns/${id}`, {
      method: "DELETE",
    });
    if (r.ok) router.push("/admin/marketing/nurture");
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-sm text-zinc-600">Loading…</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-lg space-y-4 py-16 text-center">
        <p className="text-sm text-zinc-600">Campaign not found.</p>
        <Link
          href="/admin/marketing/nurture"
          className="inline-block text-sm font-medium text-amber-800 hover:text-amber-950"
        >
          Back to campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link
        href="/admin/marketing/nurture"
        className="text-sm font-medium text-amber-800 hover:text-amber-950"
      >
        ← All campaigns
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 sm:text-3xl">
            {campaign.name}
          </h1>
          {campaign.description ? (
            <p className="mt-2 text-sm text-zinc-600">{campaign.description}</p>
          ) : null}
          <p className="mt-2 text-sm text-zinc-500">
            {campaign._count.members} people in this list
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={toggleActive}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50"
          >
            {campaign.isActive ? "Pause campaign" : "Resume campaign"}
          </button>
          <button
            type="button"
            onClick={deleteCampaign}
            className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-700 shadow-sm hover:bg-red-50"
          >
            Delete campaign
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-100">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">
            Add someone
          </h2>
          <form onSubmit={addMember} className="mt-4 space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                placeholder="name@company.com"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  First name
                </label>
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-zinc-500">
                  Last name
                </label>
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-zinc-500">
                Notes
              </label>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-11 w-full rounded-xl border border-zinc-200 bg-white px-3 text-sm shadow-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25"
                placeholder="Optional"
              />
            </div>
            {msg ? (
              <p className="text-sm text-zinc-600" role="status">
                {msg}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={adding}
              className="rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60"
            >
              {adding ? "Adding…" : "Add to campaign"}
            </button>
          </form>
        </section>

        <section className="rounded-2xl border border-zinc-200/90 bg-white p-5 shadow-sm ring-1 ring-zinc-100 lg:col-span-2">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-zinc-600">
            People in this campaign
          </h2>
          <div className="mt-4">
            {members.length === 0 ? (
              <p className="text-sm text-zinc-500">No one added yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[480px] text-left text-sm">
                  <thead>
                    <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
                      <th className="pb-2 pr-4">Email</th>
                      <th className="pb-2 pr-4">Name</th>
                      <th className="pb-2 pr-4">Notes</th>
                      <th className="pb-2 pr-4">Added</th>
                      <th className="pb-2" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {members.map((m) => (
                      <tr key={m.id}>
                        <td className="py-2 pr-4 font-medium text-zinc-900">
                          {m.email}
                        </td>
                        <td className="py-2 pr-4 text-zinc-600">
                          {[m.firstName, m.lastName].filter(Boolean).join(" ") ||
                            "-"}
                        </td>
                        <td className="max-w-[200px] truncate py-2 pr-4 text-zinc-500">
                          {m.notes || "-"}
                        </td>
                        <td className="py-2 pr-4 text-zinc-500">
                          {new Date(m.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-2">
                          <button
                            type="button"
                            onClick={() => removeMember(m.id)}
                            className="text-sm font-medium text-red-600 hover:underline"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
