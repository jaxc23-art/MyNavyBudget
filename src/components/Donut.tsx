'EOF' 
type Segment = { value: number; color: string };

type Props = {
  segments?: Segment[];   // multi-segment mode
  value?: number;         // single-segment fallback
  max?: number;           // single-segment fallback
  size?: number;
  stroke?: number;
  trackColor?: string;
};

export default function Donut({
  segments,
  value = 0,
  max = 1,
  size = 180,
  stroke = 16,
  trackColor = "#e5e7eb", // slate-200
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;

  const segs: Segment[] =
    segments && segments.length
      ? segments
      : [{ value: Math.max(0, Math.min(value, max)), color: "#2563eb" }]; // blue-600

  const total = segs.reduce((a, s) => a + Math.max(0, s.value || 0), 0) || 1;

  let acc = 0;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} strokeWidth={stroke} stroke={trackColor} fill="none" />
        {segs.map((s, i) => {
          const v = Math.max(0, s.value || 0);
          const dash = (v / total) * c;
          const dasharray = `${dash} ${c - dash}`;
          const dashoffset = (acc / total) * c;
          acc += v;
          return (
            <circle
              key={i}
              cx={size/2}
              cy={size/2}
              r={r}
              strokeWidth={stroke}
              stroke={s.color}
              strokeLinecap="butt"
              fill="none"
              style={{ strokeDasharray: dasharray, strokeDashoffset: dashoffset }}
            />
          );
        })}
      </svg>
    </div>
  );
}
'EOF'
