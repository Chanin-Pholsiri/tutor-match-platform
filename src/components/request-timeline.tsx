const ACTION_LABEL: Record<string, string> = {
  SENT: "ส่งคำขอ",
  COUNTERED: "เสนอราคาใหม่",
  ACCEPTED: "ตกลงราคา",
  DECLINED: "ปฏิเสธ",
  CANCELLED: "ยกเลิกคำขอ",
};

export function RequestTimeline({
  events,
  parentId,
  parentName,
  tutorName,
}: {
  events: {
    id: string;
    actorId: string;
    action: string;
    price: string | null;
    note: string | null;
    createdAt: Date;
  }[];
  parentId: string;
  parentName: string;
  tutorName: string;
}) {
  return (
    <ol className="space-y-3">
      {events.map((e) => (
        <li key={e.id} className="border-l-2 border-border pl-4">
          <p className="text-sm font-medium">
            {e.actorId === parentId ? parentName : tutorName} — {ACTION_LABEL[e.action] ?? e.action}
            {e.price ? ` (${e.price} บาท)` : ""}
          </p>
          {e.note && <p className="text-sm text-muted-foreground">{e.note}</p>}
          <p className="text-xs text-muted-foreground">
            {e.createdAt.toLocaleString("th-TH")}
          </p>
        </li>
      ))}
    </ol>
  );
}
