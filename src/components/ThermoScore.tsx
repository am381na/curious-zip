import React from "react";
import { cn } from "@/lib/utils";

type Props = {
  score: number;             // 0..100
  label?: string;            // e.g., "Mostly Smooth"
  className?: string;
  width?: number;            // px, default 140
  height?: number;           // px, default 10
  showNumber?: boolean;      // default true
};

export default function ThermoScore({
  score,
  label,
  className,
  width = 140,
  height = 10,
  showNumber = true,
}: Props) {
  const s = Math.max(0, Math.min(100, Math.round(score)));
  return (
    <div className={cn("flex items-center gap-2", className)} aria-label={`Smoothness ${s}`}>
      <div
        className="relative rounded-full bg-neutral-200 overflow-hidden"
        style={{ width, height }}
      >
        <div
          className="absolute left-0 top-0 h-full rounded-full"
          style={{
            width: `${s}%`,
            background:
              "linear-gradient(90deg, rgb(163,163,163) 0%, rgb(134,239,172) 60%, rgb(22,163,74) 100%)",
          }}
        />
      </div>
      <div className="flex items-baseline gap-1">
        {showNumber && <span className="text-sm font-semibold tabular-nums">{s}</span>}
        {label && <span className="text-xs text-neutral-600">{label}</span>}
      </div>
    </div>
  );
}
