import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: number;
  max?: number;
  tone?: "blue" | "red" | "green" | "amber";
  suffix?: string;
}

const toneClass: Record<string, string> = {
  blue: "bg-neon-blue",
  red: "bg-neon-red",
  green: "bg-neon-green",
  amber: "bg-[hsl(var(--neon-amber))]",
};

export function StatBar({ label, value, max = 100, tone = "blue", suffix }: Props) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex justify-between text-[11px] uppercase tracking-widest text-muted-foreground mb-1">
        <span>{label}</span>
        <span className="text-foreground font-semibold">
          {Math.round(value)}
          {suffix ?? (max === 100 ? "%" : "")}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full transition-all duration-500", toneClass[tone])}
          style={{ width: `${pct}%`, boxShadow: `0 0 8px hsl(var(--neon-${tone}) / 0.7)` }}
        />
      </div>
    </div>
  );
}