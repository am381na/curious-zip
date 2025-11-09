import React, { useState } from "react";
import { lookupAirlineInfo } from "@/lib/airlines";
import { publicUrl } from "@/lib/assets";

type Props = {
  name?: string;
  size?: number;       // pill height
  showName?: boolean;  // show airline name inside pill
  codeOnly?: boolean;  // compact pill showing only code
  className?: string;
};

export default function AirlineBadge({
  name,
  size = 28,
  showName = true,
  codeOnly = false,
  className = "",
}: Props) {
  const { code, bg, fg } = lookupAirlineInfo(name);
  const [logoOk, setLogoOk] = useState(true);

  // ✅ Use BASE_URL-safe path to public assets
  const src = publicUrl(`airlines/${code}.svg`);

  const pillH = Math.max(24, size);
  const icon = Math.max(16, Math.floor(pillH * 0.72));

  return (
    <div
      className={[
        "inline-flex items-center rounded-full shadow-sm ring-1 ring-black/5 whitespace-nowrap",
        className,
      ].join(" ")}
      style={{ backgroundColor: bg, color: fg, height: pillH }}
      aria-label={name || code}
      title={name || code}
    >
      <div className="flex items-center pl-2">
        {logoOk ? (
          <img
            src={src}
            width={icon}
            height={icon}
            alt={name || code}
            className="object-contain"
            style={{ width: icon, height: icon }}
            onError={() => {
              setLogoOk(false);
              // Helpful once-per-render hint in dev
              if (import.meta.env.DEV) console.warn("Airline logo missing:", src);
            }}
            draggable={false}
          />
        ) : (
          <span className="px-1 text-xs font-semibold leading-none tracking-wide select-none">
            {code}
          </span>
        )}
      </div>

      {!codeOnly && (
        <span className="px-2 text-sm font-medium leading-none">
          {showName ? (name ?? code) : code}
        </span>
      )}
      {codeOnly && <span className="pr-2" />}
    </div>
  );
}
