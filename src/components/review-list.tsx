import { Star } from "lucide-react";

export function ReviewList({
  reviews,
}: {
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    createdAt: Date;
    parent: { name: string };
  }[];
}) {
  if (reviews.length === 0) {
    return <p className="text-sm text-muted-foreground">ยังไม่มีรีวิวจากผู้เรียน</p>;
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
          <div className="flex items-center justify-between">
            <p className="font-medium">{r.parent.name}</p>
            <span className="inline-flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={14}
                  className={
                    i < r.rating
                      ? "fill-amber-400 text-amber-400"
                      : "fill-transparent text-muted-foreground"
                  }
                  strokeWidth={1.5}
                />
              ))}
            </span>
          </div>
          {r.comment && (
            <p className="mt-1 text-sm whitespace-pre-line text-muted-foreground">
              {r.comment}
            </p>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {r.createdAt.toLocaleDateString("th-TH")}
          </p>
        </li>
      ))}
    </ul>
  );
}
