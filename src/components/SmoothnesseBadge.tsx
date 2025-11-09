import { cn } from "@/lib/utils";

interface SmoothnessBadgeProps {
  tci: number;
  bucket: "Smooth" | "Moderate" | "Turbulent" | "Avoid";
  className?: string;
}

export const SmoothnessBadge = ({ tci, bucket, className }: SmoothnessBadgeProps) => {
  const variants = {
    Smooth: "bg-smooth-bg text-smooth border-smooth",
    Moderate: "bg-moderate-bg text-moderate-foreground border-moderate",
    Turbulent: "bg-turbulent-bg text-turbulent-foreground border-turbulent",
    Avoid: "bg-avoid-bg text-avoid-foreground border-avoid",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-full border-2 px-3 py-1.5 text-sm font-semibold transition-all",
        variants[bucket],
        className
      )}
    >
      <span className="text-2xl font-bold tabular-nums">{tci}</span>
      <span className="text-xs font-medium uppercase tracking-wider">{bucket}</span>
    </div>
  );
};
