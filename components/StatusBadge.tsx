const colors: Record<string, string> = {
  応募: "bg-gray-100 text-gray-700",
  書類選考: "bg-blue-100 text-blue-700",
  面接: "bg-indigo-100 text-indigo-700",
  内定: "bg-amber-100 text-amber-700",
  入社: "bg-green-100 text-green-700",
  退職: "bg-rose-100 text-rose-700",
};

export default function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${
        colors[status] ?? "bg-gray-100 text-gray-700"
      }`}
    >
      {status}
    </span>
  );
}
