"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, STAGES } from "@/lib/supabase";

export default function NewApplicantPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [f, setF] = useState({
    name_kanji: "",
    name_kana: "",
    phone: "",
    source: "",
    job: "",
    location: "",
    staff: "",
    stage: "応募" as string,
    memo: "",
  });

  function upd(k: keyof typeof f, v: string) {
    setF((p) => ({ ...p, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!f.name_kanji.trim()) {
      setError("氏名は必須です");
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("applicants")
      .insert({ ...f, active: true })
      .select("id")
      .single();
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    router.push(`/applicants/${data!.id}`);
  }

  const field =
    "w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

  return (
    <form onSubmit={submit} className="space-y-4">
      <Link href="/" className="text-sm text-gray-500">
        ← 一覧へ戻る
      </Link>
      <h1 className="text-lg font-bold">応募者を追加</h1>

      {error && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      )}

      <div className="grid grid-cols-1 gap-3 rounded-xl border bg-white p-4 shadow-sm sm:grid-cols-2">
        <label className="block">
          <span className="text-xs text-gray-500">氏名（漢字）*</span>
          <input value={f.name_kanji} onChange={(e) => upd("name_kanji", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">氏名（カナ）</span>
          <input value={f.name_kana} onChange={(e) => upd("name_kana", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">電話番号</span>
          <input value={f.phone} onChange={(e) => upd("phone", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">媒体</span>
          <input value={f.source} onChange={(e) => upd("source", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">業種/職</span>
          <input value={f.job} onChange={(e) => upd("job", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">エリア</span>
          <input value={f.location} onChange={(e) => upd("location", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">担当者</span>
          <input value={f.staff} onChange={(e) => upd("staff", e.target.value)} className={field} />
        </label>
        <label className="block">
          <span className="text-xs text-gray-500">ステータス</span>
          <select value={f.stage} onChange={(e) => upd("stage", e.target.value)} className={field}>
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="block rounded-xl border bg-white p-4 shadow-sm">
        <span className="text-xs text-gray-500">メモ</span>
        <textarea value={f.memo} onChange={(e) => upd("memo", e.target.value)} rows={4} className={field} />
      </label>

      <button
        type="submit"
        disabled={saving}
        className="rounded-lg bg-gray-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50"
      >
        {saving ? "保存中..." : "追加"}
      </button>
    </form>
  );
}
