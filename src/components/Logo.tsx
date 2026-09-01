export default function Logo({ className = "w-[168px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 600 170"
      className={className}
      role="img"
      aria-label="EVLASER CORPORATION"
    >
      <defs>
        <linearGradient id="evlGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#F2384F" />
          <stop offset="100%" stopColor="#7A0016" />
        </linearGradient>
        <filter id="evlShadow" x="-40%" y="-30%" width="180%" height="180%">
          <feDropShadow dx="6" dy="10" stdDeviation="7" floodColor="#7A0016" floodOpacity="0.45" />
        </filter>
      </defs>
      <rect
        x="35"
        y="40"
        width="100"
        height="100"
        rx="20"
        transform="rotate(45 85 90)"
        fill="url(#evlGrad)"
        filter="url(#evlShadow)"
      />
      <text
        x="85"
        y="101"
        textAnchor="middle"
        fontFamily="var(--font-brand)"
        fontWeight="800"
        fontSize="31"
        letterSpacing="0.5"
        fill="#ffffff"
      >
        EVL
      </text>
      <text x="178" y="122" fontFamily="var(--font-brand)" fill="currentColor">
        <tspan fontSize="92" fontWeight="800">
          EV
        </tspan>
        <tspan fontSize="58" fontWeight="700" dx="2">
          LASER
        </tspan>
      </text>
      <line x1="178" y1="136" x2="290" y2="136" stroke="var(--red)" strokeWidth="4" strokeLinecap="round" />
      <text
        x="466"
        y="151"
        textAnchor="end"
        fontFamily="var(--font-brand)"
        fontWeight="700"
        fontSize="16"
        letterSpacing="3"
        fill="var(--red)"
      >
        CORPORATION
      </text>
    </svg>
  );
}
