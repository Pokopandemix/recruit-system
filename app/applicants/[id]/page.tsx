"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  supabase,
  STAGES,
  FIELD_LABELS,
  type Applicant,
  type StatusHistory,
} from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";

const GROUPS = ["基本", "応募・架電", "面接", "合格後"];

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

  function upd<K extends keyof Applicant>(key: K, value: Applicant[K]) {
    setA((p) => (p ? { ...p, [key]: value } : p));
  }

  async function save() {
    if (!a) return;
    setSaved(false);
    const { id: _id, created_at, updated_at, ...payload } = a;
    const { error } = await supabase.from("applicants").update(payload).eq("id", a.id);
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
    <div className="space-y-5">
      <Link href="/" className="text-sm text-gray-500">
        ← 一覧へ戻る
      </Link>

      <div className="flex items-center justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold">{a.name_kanji || "（無題）"}</h1>
          {a.name_kana && <p className="text-xs text-gray-400">{a.name_kana}</p>}
        </div>
        <StatusBadge stage={a.stage} active={a.active} />
      </div>

      {/* ステータス */}
      <div className="space-y-3 rounded-xl border bg-white p-4 shadow-sm">
        <label className="block">
          <span className="text-xs text-gray-500">ステータス</span>
          <select
            value={a.stage}
            onChange={(e) => upd("stage", e.target.value)}
            className={field}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={a.active}
              onChange={(e) => upd("active", e.target.checked)}
            />
            進行中
          </label>
          <input
            value={a.dropout_reason ?? ""}
            onChange={(e) => upd("dropout_reason", e.target.value)}
            placeholder="脱落理由（任意）"
            className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
          />
        </div>
      </div>

      {/* 項目グループ */}
      {GROUPS.map((group) => (
        <div key={group} className="rounded-xl border bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-gray-500">{group}</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {FIELD_LABELS.filter((f) => f.group === group).map((f) => (
              <label key={f.key} className="block">
                <span className="text-xs text-gray-500">{f.label}</span>
                <input
                  value={(a[f.key] as string) ?? ""}
                  onChange={(e) => upd(f.key, e.target.value as Applicant[typeof f.key])}
                  className={field}
                />
              </label>
            ))}
          </div>
        </div>
      ))}

      {/* メモ */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-2 text-sm font-semibold text-gray-500">メモ / 内容</h2>
        <textarea
          value={a.memo ?? ""}
          onChange={(e) => upd("memo", e.target.value)}
          rows={6}
          className={field}
        />
      </div>

      <div className="sticky bottom-0 -mx-4 flex items-center gap-3 border-t bg-white/95 px-4 py-3 backdrop-blur">
        <button
          onClick={save}
          className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white"
        >
          保存
        </button>
        {saved && <span className="text-sm text-green-600">保存しました</span>}
        <button onClick={remove} className="ml-auto text-sm text-rose-600">
          削除
        </button>
      </div>

      {/* 履歴 */}
      <div className="rounded-xl border bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-semibold text-gray-500">ステータス履歴</h2>
        {a.sources && (
          <p className="mb-2 text-xs text-gray-400">取込元: {a.sources}</p>
        )}
        {history.length === 0 ? (
          <p className="text-sm text-gray-500">履歴はありません。</p>
        ) : (
          <ol className="space-y-2">
            {history.map((h) => (
              <li key={h.id} className="flex items-center gap-3 text-sm">
                <StatusBadge stage={h.stage} />
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
