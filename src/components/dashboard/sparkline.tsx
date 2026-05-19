interface SparklineProps {
  data: number[];
  /** Brand color for the line/area */
  color?: "accent" | "primary" | "success" | "warning";
  className?: string;
  /** Height in px */
  height?: number;
}

const COLOR_MAP = {
  accent: "#40E0D0",
  primary: "#1A5490",
  success: "#10b981",
  warning: "#f59e0b",
};

/**
 * Tiny SVG sparkline — no library. Renders an area + line for a series of values.
 */
export function Sparkline({
  data,
  color = "accent",
  className,
  height = 36,
}: SparklineProps) {
  if (!data.length) return null;
  const stroke = COLOR_MAP[color];

  const w = 100;
  const h = height;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const step = data.length > 1 ? w / (data.length - 1) : 0;

  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - 4 - ((v - min) / range) * (h - 8);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`)
    .join(" ");

  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;

  const lastX = points[points.length - 1][0];
  const lastY = points[points.length - 1][1];

  const gradId = `spark-${color}-${data.join("-").slice(0, 16)}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={className}
      style={{ width: "100%", height }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={stroke}
        strokeWidth={1.6}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={lastX}
        cy={lastY}
        r={2.5}
        fill={stroke}
        stroke="#FFFFFF"
        strokeWidth={1.4}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
