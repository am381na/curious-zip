import React from "react";

export default function ScoringExplainer() {
  return (
    <div className="mt-8">
      <details className="rounded-lg border bg-card/60 p-4" open={false}>
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          How SmoothSky Calculates Smoothness
        </summary>

        <div className="mt-3 space-y-3 text-sm text-muted-foreground">
          <p>
            SmoothSky estimates how comfortable a flight typically feels based on three factors:
          </p>

          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong className="text-foreground">Aircraft Design (40%)</strong> — Some aircraft ride more smoothly than others.
              Newer composite wide-bodies like the <strong>A350</strong> and <strong>787</strong> absorb
              vibration better, have improved wing flex, and pressurize at lower cabin altitude.
            </li>
            <li>
              <strong className="text-foreground">Route History (60%)</strong> — Some air corridors are consistently smoother due to
              jet stream patterns and terrain. We use long-term turbulence history for your route.
            </li>
            <li>
              <strong className="text-foreground">Today's Jet Stream (0–15 pts)</strong> — We check current upper-air wind speeds 
              along your route. High winds mean choppier conditions, so we reduce the score by up to 15 points. 
              If weather data isn't available, no adjustment is made.
            </li>
          </ul>

          <pre className="mt-2 rounded bg-muted p-2 text-xs text-foreground">
{`Final Smoothness = Aircraft (40%) + Route (60%) ± Realtime Adjustment`}
          </pre>

          <p className="text-xs text-muted-foreground">
            Score reflects typical in-seat ride stability — not safety. All commercial flights are safe; this is about comfort.
          </p>
        </div>
      </details>
    </div>
  );
}
