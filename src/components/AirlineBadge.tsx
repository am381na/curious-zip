import React, { useState } from "react";
import { lookupAirlineInfo } from "@/lib/airlines";

type Props = {
  name?: string;
  /** overall visual size in px for pill height (default 28) */
  size?: number;
  /** show airline name text inside the pill (default true) */
  showName?: boolean;
  /** if true, show only the two-letter code (smaller pill) */
  codeOnly?: boolean;
  /** extra className if needed */
  className?: string;
};

/**
 * AirlineBadge — pill-style badge with brand color background.
 * - Loads local SVG if available at /airlines/{CODE}.svg
 * - Falls back to two-letter code if SVG missing
 * - Always readable: white text over brand bg
 */
export default function AirlineBadge({
  name,
  size = 28,
  showName = true,
  codeOnly = false,
  className = "",
}: Props) {
  const { code, bg, fg } = lookupAirlineInfo(name);
  const [logoOk, setLogoOk] = useState(true);
  const src = `/airlines/${code}.svg`;

  // Computed styles
  const pillHeight = Math.max(24, size);
  const iconSize = Math.max(16, Math.floor(pillHeight * 0.72));

  return (
    <div
      className={[
        "inline-flex items-center rounded-full shadow-sm",
        "ring-1 ring-black/5",
        "whitespace-nowrap",
        className,
      ].join(" ")}
      style={{ backgroundColor: bg, color: fg, height: pillHeight }}
      aria-label={name || code}
      title={name || code}
    >
      {/* Left content: logo or code */}
      <div className="flex items-center pl-2">
        {logoOk ? (
          <img
            src={src}
            width={iconSize}
            height={iconSize}
            alt={name || code}
            className="h-[1.1em] w-auto object-contain"
            style={{ height: iconSize, width: iconSize }}
            onError={() => setLogoOk(false)}
            draggable={false}
          />
        ) : (
          <span className="px-1 text-xs font-semibold leading-none tracking-wide select-none">
            {code}
          </span>
        )}
      </div>

      {/* Right text: code or name */}
      {!codeOnly && (
        <span
          className="px-2 text-sm font-medium leading-none"
          style={{ lineHeight: `${pillHeight - 8}px` }}
        >
          {showName ? (name ?? code) : code}
        </span>
      )}

      {codeOnly && <span className="pr-2" /> }
    </div>
  );
}
