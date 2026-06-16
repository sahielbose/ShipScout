// The ShipScout pixel mark. Our own design (CONTEXT.md section 15): a stacked
// "S" of squares with one blue accent square. Not derived from any other brand.

interface LogoProps {
  size?: number;
  className?: string;
  fill?: string;
  accent?: string;
  title?: string;
}

export function Logo({
  size = 26,
  className,
  fill = "#fafafa",
  accent = "#4f8bff",
  title = "ShipScout",
}: LogoProps) {
  const height = (size * 125) / 100;
  return (
    <svg
      width={size}
      height={height}
      viewBox="0 0 100 125"
      className={className}
      role="img"
      aria-label={title}
    >
      <g fill={fill}>
        <rect x="22" y="25" width="14" height="14" rx="3" />
        <rect x="40" y="25" width="14" height="14" rx="3" />
        <rect x="58" y="25" width="14" height="14" rx="3" />
        <rect x="22" y="43" width="14" height="14" rx="3" />
        <rect x="22" y="61" width="14" height="14" rx="3" />
        <rect x="40" y="61" width="14" height="14" rx="3" />
        <rect x="58" y="61" width="14" height="14" rx="3" />
        <rect x="58" y="79" width="14" height="14" rx="3" />
        <rect x="22" y="97" width="14" height="14" rx="3" />
        <rect x="40" y="97" width="14" height="14" rx="3" />
      </g>
      <rect x="58" y="97" width="14" height="14" rx="3" fill={accent} />
    </svg>
  );
}
