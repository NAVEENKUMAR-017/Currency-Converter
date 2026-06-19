export default function Sparkline({ series }) {
  if (!series || series.length < 2) {
    return <div className="sparkline-placeholder" />;
  }

  const values = series.map((p) => p.rate).filter((v) => Number.isFinite(v));
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;

  const width = 320;
  const height = 56;
  const padX = 4;
  const padY = 6;

  const points = series.map((p, i) => {
    const x = padX + (i / (series.length - 1)) * (width - padX * 2);
    const y = padY + (1 - (p.rate - min) / range) * (height - padY * 2);
    return [x, y];
  });

  const path = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const areaPath = `${path} L${points[points.length - 1][0]},${height} L${points[0][0]},${height} Z`;

  const trendingUp = values[values.length - 1] >= values[0];

  return (
    <div className="sparkline-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={trendingUp ? "#34D399" : "#FB7185"} stopOpacity="0.25" />
            <stop offset="100%" stopColor={trendingUp ? "#34D399" : "#FB7185"} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={areaPath} fill="url(#sparkFill)" stroke="none" />
        <path
          d={path}
          fill="none"
          stroke={trendingUp ? "#34D399" : "#FB7185"}
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={points[points.length - 1][0]}
          cy={points[points.length - 1][1]}
          r="3"
          fill={trendingUp ? "#34D399" : "#FB7185"}
        />
      </svg>
      <span className="sparkline-label">7-day trend</span>
    </div>
  );
}
