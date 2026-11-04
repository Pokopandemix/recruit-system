"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  supabase,
  STATUSES,
  type Applicant,
  type StatusHistory,
} from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";

export default function ApplicantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [a, setA] = useState<Applicant | null>(null);
  const [history, setHistory] = useState<StatusHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function load() {
    setLoading(true);
    const [{ data: app, error: e1 }, { data: hist }] = await Promise.all([
      supabase.from("applicants").select("*").eq("id", id).single(),
      supabase
        .from("status_history")
        .select("*")
        .eq("applicant_id", id)
        .order("changed_at", { ascending: false }),
    ]);
    if (e1) setError(e1.message);
    else setA(app as Applicant);
    setHistory((hist ?? []) as StatusHistory[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  function update<K extends keyof Applicant>(key: K, value: Applicant[K]) {
    setA((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function save() {
    if (!a) return;
    setSaved(false);
    const { error } = await supabase
      .from("applicants")
      .update({
        name: a.name,
        email: a.email,
        phone: a.phone,
        source: a.source,
        status: a.status,
        joined_at: a.joined_at || null,
        memo: a.memo,
      })
      .eq("id", a.id);
    if (error) {
      setError(error.message);
      return;
    }
    setSaved(true);
    load();
  }

  async function remove() {
    if (!a || !confirm("この応募者を削除しますか？")) return;
    await supabase.from("applicants").delete().eq("id", a.id);
    router.push("/");
  }

  if (loading) return <p className="text-sm text-gray-500">読み込み中...</p>;
  if (!a)
    return (
      <div className="space-y-4">
        <p className="text-sm text-rose-700">{error ?? "見つかりません"}</p>
        <Link href="/" className="text-sm underline">
          一覧へ戻る
        </Link>
      </div>
    );

  const field =
    "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

  return (
    <div className="space-y-6">
      <Link href="/" className="text-sm text-gray-500">
        ← 一覧へ戻る
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">{a.name || "（無題）"}</h1>
        <StatusBadge status={a.status} />
      </div>

      <div className="space-y-4 rounded-xl border bg-white p-4 shadow-sm">
        <label className="block">
          <span className="text-xs text-gray-500">ステータス</span>
          <select
            value={a.status}
            onChange={(e) => update("status", e.target.value as Applicant["status"])}
            className={field}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs text-gray-500">氏名</span>
          <input
            value={a.name}
            onChange={(e) => update("name", e.target.value)}
            className={field}
          />
        </label>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs text-gray-500">メール</span>
            <input
              value={a.email ?? ""}
              onChange={(e) => update("email", e.target.value)}
              className={field}
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">電話</span>
            <input
              value={a.phone ?? ""}
              onChange={(e) => update("phone", e.target.value)}
              className={field}
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">応募経路</span>
            <input
              value={a.source ?? ""}
              onChange={(e) => update("source", e.target.value)}
              className={field}
            />
          </label>
          <label className="block">
            <span className="text-xs text-gray-500">入社日</span>
            <input
              type="date"
              value={a.joined_at ?? ""}
              onChange={(e) => update("joined_at", e.target.value)}
              className={field}
            />
          </label>
        </div>

        <label className="block">
          <span className="text-xs text-gray-500">メモ</span>
          <textarea
            value={a.memo ?? ""}
            onChange={(e) => update("memo", e.target.value)}
            rows={5}
            className={field}
          />
        </label>

        <div className="flex items-center gap-3">
          <button
            onClick={save}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white"
          >
            保存
          </button>
          {saved && <span className="text-sm text-green-600">保存しました</span>}
          <button
            onClick={remove}
            className="ml-auto text-sm text-rose-600"
          >
            削除
          </button>
        </div>
      </div>

      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-500">
          ステータス履歴
        </h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">履歴はありません。</p>
        ) : (
          <ol className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-3 text-sm">
                <StatusBadge status={h.status} />
                <span className="text-gray-500">
                  {new Date(h.changed_at).toLocaleString("ja-JP")}
                </span>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}
