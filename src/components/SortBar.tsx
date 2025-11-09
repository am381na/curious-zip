import React from "react";

export type SortKey = "smoothest" | "cheapest" | "earliest" | "shortest";

export default function SortBar({
  value,
  onChange,
}: {
  value: SortKey;
  onChange: (v: SortKey) => void;
}) {
  const opt = (k: SortKey, label: string) => (
    <button
      key={k}
      onClick={() => onChange(k)}
      className={`rounded-full border px-3 py-1 text-sm transition-colors ${
        value === k ? "bg-neutral-900 text-white border-neutral-900" : "bg-white hover:bg-neutral-50"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="mb-4 flex items-center gap-2">
      <span className="text-sm text-neutral-600">Sort by:</span>
      {opt("smoothest", "Smoothest")}
      {opt("cheapest", "Cheapest")}
      {opt("earliest", "Earliest")}
      {opt("shortest", "Shortest")}
    </div>
  );
}
