import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number; // 0-100
  className?: string;
  showLabel?: boolean;
  color?: "default" | "accent" | "green";
}

const colors = {
  default: "bg-brand-900",
  accent:  "bg-accent",
  green:   "bg-green-500",
};

export function ProgressBar({ value, className, showLabel, color = "default" }: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, value));
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex-1 bg-brand-100 rounded-full h-2 overflow-hidden">
        <div
          className={cn("h-2 rounded-full transition-all duration-500", colors[color])}
          style={{ width: `${pct}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs font-medium text-brand-600 w-8 text-right">{pct}%</span>
      )}
    </div>
  );
}
