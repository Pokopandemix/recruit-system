const colors: Record<string, string> = {
  応募: "bg-gray-100 text-gray-700",
  架電中: "bg-slate-100 text-slate-700",
  一次面談調整: "bg-cyan-100 text-cyan-700",
  一次面談確定: "bg-sky-100 text-sky-700",
  面接設置: "bg-blue-100 text-blue-700",
  面接実施: "bg-indigo-100 text-indigo-700",
  OB面接: "bg-violet-100 text-violet-700",
  クロ面: "bg-purple-100 text-purple-700",
  合格: "bg-amber-100 text-amber-700",
  オリテ: "bg-orange-100 text-orange-700",
  入社前研修: "bg-lime-100 text-lime-700",
  リーダー紹介: "bg-teal-100 text-teal-700",
  社長面談: "bg-emerald-100 text-emerald-700",
  スタート: "bg-green-100 text-green-700",
  退社: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({
  stage,
  active,
}: {
  stage: string;
  active?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
          colors[stage] ?? "bg-gray-100 text-gray-700"
        }`}
      >
        {stage}
      </span>
      {active === false && (
        <span className="inline-block rounded-full bg-rose-50 px-1.5 py-0.5 text-[10px] font-medium text-rose-600">
          脱落
        </span>
      )}
    </span>
  );
}
