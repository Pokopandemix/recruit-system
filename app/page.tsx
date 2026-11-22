"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { supabase, STAGES, type Applicant } from "@/lib/supabase";
import StatusBadge from "@/components/StatusBadge";

const PAGE_SIZE = 50;

export default function HomePage() {
  const [list, setList] = useState<Applicant[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [q, setQ] = useState("");
  const [stage, setStage] = useState("all");
  const [onlyActive, setOnlyActive] = useState(true);
  const [page, setPage] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("applicants")
      .select("*", { count: "exact" })
      .order("updated_at", { ascending: false })
      .range(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE - 1);

    if (q.trim()) {
      const term = `%${q.trim()}%`;
      query = query.or(
        `name_kanji.ilike.${term},name_kana.ilike.${term},phone.ilike.${term}`
      );
    }
    if (stage !== "all") query = query.eq("stage", stage);
    if (onlyActive) query = query.eq("active", true);

    const { data, error, count } = await query;
    if (error) setError(error.message);
    else {
      setList((data ?? []) as Applicant[]);
      setTotal(count ?? 0);
      setError(null);
    }
    setLoading(false);
  }, [q, stage, onlyActive, page]);

  useEffect(() => {
    load();
  }, [load]);

  // フィルタ変更時はページを先頭へ
  useEffect(() => {
    setPage(0);
  }, [q, stage, onlyActive]);

  const maxPage = Math.max(0, Math.ceil(total / PAGE_SIZE) - 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">応募者一覧</h1>
        <Link
          href="/applicants/new"
          className="rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white"
        >
          ＋追加
        </Link>
      </div>

      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="氏名・カナ・電話で検索"
        className="w-full rounded-lg border px-3 py-2 text-sm"
      />

      <div className="flex items-center gap-2">
        <select
          value={stage}
          onChange={(e) => setStage(e.target.value)}
          className="flex-1 rounded-lg border px-2 py-2 text-sm"
        >
          <option value="all">全ステータス</option>
          {STAGES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-1.5 whitespace-nowrap text-sm">
          <input
            type="checkbox"
            checked={onlyActive}
            onChange={(e) => setOnlyActive(e.target.checked)}
          />
          進行中のみ
        </label>
      </div>

      <p className="text-xs text-gray-500">
        {loading ? "読み込み中..." : `${total.toLocaleString()} 件`}
      </p>

      {error && (
        <p className="rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>
      )}

      <ul className="space-y-2">
        {list.map((a) => (
          <li key={a.id}>
            <Link
              href={`/applicants/${a.id}`}
              className="flex items-center justify-between rounded-xl border bg-white p-3 shadow-sm active:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {a.name_kanji}
                  {a.name_kana ? (
                    <span className="ml-1 text-xs font-normal text-gray-400">
                      {a.name_kana}
                    </span>
                  ) : null}
                </p>
                <p className="mt-0.5 truncate text-xs text-gray-500">
                  {[a.source, a.location, a.staff && `担当:${a.staff}`, a.setup_date && `設置:${a.setup_date}`]
                    .filter(Boolean)
                    .join(" ・ ")}
                </p>
              </div>
              <StatusBadge stage={a.stage} active={a.active} />
            </Link>
          </li>
        ))}
      </ul>

      {!loading && list.length === 0 && (
        <p className="text-sm text-gray-500">該当なし。</p>
      )}

      {maxPage > 0 && (
        <div className="flex items-center justify-center gap-4 py-2 text-sm">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
          >
            前へ
          </button>
          <span className="text-gray-500">
            {page + 1} / {maxPage + 1}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={page >= maxPage}
            className="rounded-lg border px-3 py-1 disabled:opacity-40"
          >
            次へ
          </button>
        </div>
      )}
    </div>
  );
}
