type DayCount = { date: string; label: string; parents: number; tutors: number };

const COLOR_PARENT = "#2a78d6";
const COLOR_TUTOR = "#eb6834";

export function RegistrationsChart({ days }: { days: DayCount[] }) {
  const width = 700;
  const height = 220;
  const padLeft = 28;
  const padRight = 8;
  const padTop = 12;
  const padBottom = 28;
  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;

  const maxRaw = Math.max(1, ...days.map((d) => Math.max(d.parents, d.tutors)));
  const ticks = 4;
  const step = Math.max(1, Math.ceil(maxRaw / ticks));
  const yMax = step * ticks;
  const groupW = plotW / days.length;
  const barW = Math.min(14, groupW * 0.32);
  const barGap = 3;

  const y = (v: number) => padTop + plotH - (v / yMax) * plotH;

  return (
    <div className="viz-root">
      <style>{`
        .viz-root {
          color-scheme: light;
          --surface-1: #fcfcfb;
          --text-secondary: #52514e;
          --muted: #898781;
          --gridline: #e1e0d9;
          --baseline: #c3c2b7;
        }
      `}</style>

      <div className="mb-2 flex items-center gap-4 text-xs">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: COLOR_PARENT }}
          />
          <span style={{ color: "var(--text-secondary)" }}>ผู้ปกครอง/ผู้เรียน</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-2.5 w-2.5 rounded-sm"
            style={{ backgroundColor: COLOR_TUTOR }}
          />
          <span style={{ color: "var(--text-secondary)" }}>ติวเตอร์</span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ background: "var(--surface-1)" }}
        role="img"
        aria-label="จำนวนสมาชิกใหม่รายวันย้อนหลัง 14 วัน แยกผู้ปกครองและติวเตอร์"
      >
        {Array.from({ length: ticks + 1 }).map((_, i) => {
          const v = (yMax / ticks) * i;
          return (
            <g key={i}>
              <line
                x1={padLeft}
                x2={width - padRight}
                y1={y(v)}
                y2={y(v)}
                stroke="var(--gridline)"
                strokeWidth={1}
              />
              <text
                x={padLeft - 6}
                y={y(v)}
                textAnchor="end"
                dominantBaseline="middle"
                fontSize={10}
                fill="var(--muted)"
              >
                {Math.round(v)}
              </text>
            </g>
          );
        })}

        <line
          x1={padLeft}
          x2={width - padRight}
          y1={y(0)}
          y2={y(0)}
          stroke="var(--baseline)"
          strokeWidth={1}
        />

        {days.map((d, i) => {
          const groupX = padLeft + i * groupW;
          const cx = groupX + groupW / 2;
          const showLabel = days.length <= 10 || i % 2 === 0;
          return (
            <g key={d.date}>
              <rect
                x={cx - barGap / 2 - barW}
                y={y(d.parents)}
                width={barW}
                height={Math.max(0, y(0) - y(d.parents))}
                rx={2}
                fill={COLOR_PARENT}
              >
                <title>
                  {d.label}: ผู้ปกครอง/ผู้เรียน {d.parents} คน
                </title>
              </rect>
              <rect
                x={cx + barGap / 2}
                y={y(d.tutors)}
                width={barW}
                height={Math.max(0, y(0) - y(d.tutors))}
                rx={2}
                fill={COLOR_TUTOR}
              >
                <title>
                  {d.label}: ติวเตอร์ {d.tutors} คน
                </title>
              </rect>
              {showLabel && (
                <text
                  x={cx}
                  y={height - padBottom + 14}
                  textAnchor="middle"
                  fontSize={9}
                  fill="var(--muted)"
                >
                  {d.label}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
