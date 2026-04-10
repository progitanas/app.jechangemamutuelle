import { cn } from "@/lib/utils";

type BadgeTone = "emerald" | "blue" | "amber" | "red" | "slate";

const toneMap: Record<BadgeTone, string> = {
  emerald: "bg-emerald-50 text-emerald-700",
  blue: "bg-blue-50 text-blue-700",
  amber: "bg-amber-50 text-amber-700",
  red: "bg-rose-50 text-rose-700",
  slate: "bg-slate-100 text-slate-700",
};

export function StatusBadge({
  label,
  tone = "slate",
}: {
  label: string;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide",
        toneMap[tone],
      )}
    >
      {label}
    </span>
  );
}
