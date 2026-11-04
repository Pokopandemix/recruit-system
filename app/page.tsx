"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, STATUSES, type Applicant } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";

export default function HomePage() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");

  // 新規追加フォーム
  const [name, setName] = useState("");
  const [source, setSource] = useState("");
  const [saving, setSaving] = useState(false);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("applicants")
      .select("*")
      .order("applied_at", { ascending: false });
    if (error) setError(error.message);
    else setApplicants((data ?? []) as Applicant[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function addApplicant(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    const { error } = await supabase
      .from("applicants")
      .insert({ name: name.trim(), source: source.trim() || null });
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    setName("");
    setSource("");
    load();
  }

  const list =
    filter === "all"
      ? applicants
      : applicants.filter((a) => a.status === filter);

  return (
    <div className="space-y-6">
      <form
        onSubmit={addApplicant}
        className="rounded-xl border bg-white p-4 shadow-sm"
      >
        <h2 className="mb-3 text-sm font-semibold text-gray-500">
          応募者を追加
        </h2>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="氏名"
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <input
            value={source}
            onChange={(e) => setSource(e.target.value)}
            placeholder="応募経路（任意）"
            className="flex-1 rounded-lg border px-3 py-2 text-sm"
          />
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
          >
            追加
          </button>
        </div>
      </form>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-3 py-1 text-xs ${
            filter === "all" ? "bg-gray-900 text-white" : "bg-white border"
          }`}
        >
          すべて
        </button>
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-3 py-1 text-xs ${
              filter === s ? "bg-gray-900 text-white" : "bg-white border"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {error && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-gray-500">読み込み中...</p>
      ) : list.length === 0 ? (
        <p className="text-sm text-gray-500">応募者がいません。</p>
      ) : (
        <ul className="space-y-2">
          {list.map((a) => (
            <li key={a.id}>
              <Link
                href={`/applicants/${a.id}`}
                className="flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm active:bg-gray-50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {a.applied_at}
                    {a.source ? ` ・ ${a.source}` : ""}
                  </p>
                </div>
                <StatusBadge status={a.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
