import { Star } from "lucide-react";

export function RatingSummary({
  average,
  count,
  size = "sm",
}: {
  average: number;
  count: number;
  size?: "sm" | "md";
}) {
  if (count === 0) {
    return <span className="text-xs text-muted-foreground">ยังไม่มีรีวิว</span>;
  }
  const iconSize = size === "md" ? 18 : 14;
  return (
    <span className="inline-flex items-center gap-1">
      <Star
        size={iconSize}
        className="fill-amber-400 text-amber-400"
        strokeWidth={1.5}
      />
      <span className={size === "md" ? "text-base font-semibold" : "text-sm font-medium"}>
        {average.toFixed(1)}
      </span>
      <span className="text-xs text-muted-foreground">({count} รีวิว)</span>
    </span>
  );
}
