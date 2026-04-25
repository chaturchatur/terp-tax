export function MdFlag({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 28 28"
      style={{ borderRadius: 5, display: "block", flexShrink: 0 }}
    >
      <clipPath id="mdf-tl"><rect x="0" y="0" width="14" height="14" /></clipPath>
      <g clipPath="url(#mdf-tl)">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x="-28"
            y={i * 4 - 8}
            width="84"
            height="2"
            fill={i % 2 === 0 ? "#e8b800" : "#000"}
            transform="rotate(45 7 7)"
          />
        ))}
      </g>
      <clipPath id="mdf-tr"><rect x="14" y="0" width="14" height="14" /></clipPath>
      <g clipPath="url(#mdf-tr)">
        <rect x="14" y="0" width="14" height="14" fill="#c8102e" />
        <path d="M21 3v8M17 7h8" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <clipPath id="mdf-bl"><rect x="0" y="14" width="14" height="14" /></clipPath>
      <g clipPath="url(#mdf-bl)">
        <rect x="0" y="14" width="14" height="14" fill="#c8102e" />
        <path d="M7 17v8M3 21h8" stroke="white" strokeWidth="2.4" strokeLinecap="round" />
      </g>
      <clipPath id="mdf-br"><rect x="14" y="14" width="14" height="14" /></clipPath>
      <g clipPath="url(#mdf-br)">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <rect
            key={i}
            x="-28"
            y={14 + i * 4 - 8}
            width="84"
            height="2"
            fill={i % 2 === 0 ? "#e8b800" : "#000"}
            transform="rotate(45 21 21)"
          />
        ))}
      </g>
    </svg>
  );
}
