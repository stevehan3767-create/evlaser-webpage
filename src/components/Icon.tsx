import type { IconName } from "@/lib/data";

const paths: Record<IconName, React.ReactNode> = {
  car: (
    <>
      <path d="M3.5 15.5 5 10a2 2 0 0 1 2-1.5h10A2 2 0 0 1 19 10l1.5 5.5" />
      <rect x="2.5" y="15.5" width="19" height="4" rx="0.6" />
      <circle cx="7" cy="19.5" r="1.6" />
      <circle cx="17" cy="19.5" r="1.6" />
      <line x1="6" y1="11.5" x2="18" y2="11.5" />
    </>
  ),
  battery: (
    <>
      <rect x="3" y="7" width="16" height="10" rx="1" />
      <rect x="19.5" y="10" width="2" height="4" />
      <line x1="7" y1="10" x2="7" y2="14" />
      <line x1="11" y1="10" x2="11" y2="14" />
    </>
  ),
  semi: (
    <>
      <rect x="7" y="7" width="10" height="10" rx="0.5" />
      <rect x="10" y="10" width="4" height="4" />
      <line x1="3.5" y1="9" x2="7" y2="9" />
      <line x1="3.5" y1="15" x2="7" y2="15" />
      <line x1="17" y1="9" x2="20.5" y2="9" />
      <line x1="17" y1="15" x2="20.5" y2="15" />
      <line x1="9" y1="3.5" x2="9" y2="7" />
      <line x1="15" y1="3.5" x2="15" y2="7" />
      <line x1="9" y1="17" x2="9" y2="20.5" />
      <line x1="15" y1="17" x2="15" y2="20.5" />
    </>
  ),
  bio: (
    <>
      <path d="M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9" />
      <line x1="7.3" y1="7" x2="16.7" y2="7" />
      <line x1="7.3" y1="17" x2="16.7" y2="17" />
    </>
  ),
  home: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="0.6" />
      <line x1="6" y1="11" x2="18" y2="11" />
      <circle cx="9" cy="7" r="0.9" fill="currentColor" stroke="none" />
      <line x1="9" y1="15" x2="9" y2="17.5" />
      <line x1="12" y1="15" x2="12" y2="17.5" />
      <line x1="15" y1="15" x2="15" y2="17.5" />
    </>
  ),
  ship: (
    <>
      <path d="M4 15.5h16l-2 4.5H6z" />
      <path d="M7 15.5V6h6l3 5.3" />
      <line x1="10" y1="6" x2="10" y2="3" />
    </>
  ),
  aero: <path d="M12 2.5v11.7M12 2.5 6 9v3l6-1.8M12 2.5 18 9v3l-6-1.8M12 14.2 8 20l4-1.4 4 1.4z" />,
  machine: (
    <>
      <circle cx="9" cy="9" r="3" />
      <path d="M9 2.7v2.1M9 12.2v2.1M2.7 9h2.1M12.2 9h2.1M4.9 4.9l1.5 1.5M11.6 11.6l1.5 1.5M13.1 4.9l-1.5 1.5M6.4 11.6l-1.5 1.5" />
      <path d="M14 20.5l6.5-6.5-2-2-6.5 6.5z" />
      <line x1="12.7" y1="15.3" x2="16.7" y2="19.3" />
    </>
  ),
  steel: (
    <>
      <rect x="4" y="14" width="16" height="4" rx="0.5" />
      <rect x="6" y="9" width="12" height="4" rx="0.5" />
      <rect x="8" y="4" width="8" height="4" rx="0.5" />
    </>
  ),
  display: (
    <>
      <rect x="3" y="4" width="18" height="12" rx="0.8" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="16" x2="12" y2="20" />
    </>
  ),
  defense: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  precision: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <line x1="12" y1="12" x2="16" y2="8.5" />
      <line x1="12" y1="6" x2="12" y2="7.6" />
      <line x1="12" y1="16.4" x2="12" y2="18" />
      <line x1="6" y1="12" x2="7.6" y2="12" />
      <line x1="16.4" y1="12" x2="18" y2="12" />
    </>
  ),
  etc: (
    <>
      {[6, 12, 18].flatMap((cy) =>
        [6, 12, 18].map((cx) => (
          <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="1.5" fill="currentColor" stroke="none" />
        ))
      )}
    </>
  ),
  weld: (
    <>
      <path d="M3 17l6-6" />
      <path d="M11 9l7-7 3 3-7 7" />
      <path d="M13 15l6 6" />
      <line x1="4.5" y1="20" x2="9" y2="15.5" />
      <path d="M15.5 3.5l2 2M17.8 6l1.6 1.6" />
    </>
  ),
  cut: (
    <>
      <circle cx="6" cy="6" r="2.4" />
      <circle cx="6" cy="18" r="2.4" />
      <line x1="20" y1="4" x2="7.7" y2="10.3" />
      <line x1="8.4" y1="13.4" x2="20" y2="20" />
      <line x1="20" y1="20" x2="12" y2="12" />
    </>
  ),
  mark: (
    <>
      <path d="M4 20h6l10-10-6-6-10 10z" />
      <line x1="14" y1="4" x2="20" y2="10" />
      <line x1="4" y1="20" x2="4" y2="16.5" />
    </>
  ),
  clean: (
    <>
      <path d="M12 3c2.5 3 4 5.4 4 7.8a4 4 0 1 1-8 0C8 8.4 9.5 6 12 3z" />
      <line x1="4" y1="20" x2="7" y2="20" />
      <line x1="10" y1="20" x2="16" y2="20" />
      <line x1="19" y1="20" x2="21" y2="20" />
    </>
  ),
  drill: (
    <>
      <line x1="12" y1="3" x2="12" y2="14" />
      <path d="M9 14h6l-3 7z" />
      <path d="M5 5c1 1 1 2 0 3M8 4c1 1 1 2 0 3" />
    </>
  ),
  heat: (
    <>
      <path d="M12 2.5c1 3 4 4.8 4 9a4 4 0 0 1-8 0c0-1.6.8-2.7 1.5-3.8.3 1 .9 1.6 1.5 1.6-.4-2.6.7-4.7 1-6.8z" />
      <line x1="6" y1="20.5" x2="18" y2="20.5" />
    </>
  ),
  clad: (
    <>
      <polygon points="12 3 21 8 12 13 3 8" />
      <polyline points="3 13 12 18 21 13" />
      <polyline points="3 17.5 12 22.5 21 17.5" />
    </>
  ),
  print3d: (
    <>
      <polygon points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5" />
      <polyline points="4 7.5 12 12 20 7.5" />
      <line x1="12" y1="12" x2="12" y2="21" />
    </>
  ),
  medical: <path d="M3 12h4l2-5 3 10 2-7 1.5 2H21" />,
  safety: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <circle cx="12" cy="11" r="1.3" fill="currentColor" stroke="none" />
      <line x1="12" y1="13.5" x2="12" y2="16.5" />
    </>
  ),
  measure: (
    <>
      <rect x="3" y="8" width="18" height="8" rx="0.6" transform="rotate(-8 12 12)" />
      <line x1="7" y1="9" x2="7.6" y2="11" transform="rotate(-8 12 12)" />
      <line x1="11" y1="9" x2="11.8" y2="11.5" transform="rotate(-8 12 12)" />
      <line x1="15" y1="9" x2="15.8" y2="11.5" transform="rotate(-8 12 12)" />
    </>
  ),
  doc: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <line x1="9" y1="12" x2="16" y2="12" />
      <line x1="9" y1="15.5" x2="16" y2="15.5" />
      <line x1="9" y1="19" x2="13" y2="19" />
    </>
  ),
  play: (
    <>
      <circle cx="12" cy="12" r="9.2" />
      <polygon points="10 8.3 16 12 10 15.7" fill="currentColor" stroke="none" />
    </>
  ),
  case: (
    <>
      <rect x="3.5" y="8" width="17" height="11.5" rx="0.5" />
      <path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
      <line x1="3.5" y1="13" x2="20.5" y2="13" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s7-6.4 7-12a7 7 0 0 0-14 0c0 5.6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.4" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" />
      <ellipse cx="12" cy="12" rx="4" ry="9" />
      <line x1="3" y1="12" x2="21" y2="12" />
    </>
  ),
  bell: (
    <>
      <path d="M6 10a6 6 0 0 1 12 0c0 4 1.5 5.5 2 6H4c.5-.5 2-2 2-6z" />
      <path d="M10 19a2 2 0 0 0 4 0" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="10.5" width="14" height="9.5" rx="0.5" />
      <path d="M8 10.5V8a4 4 0 0 1 8 0v2.5" />
    </>
  ),
  build: (
    <>
      <path d="M3 21h18" />
      <path d="M6 21V9l6-5 6 5v12" />
      <line x1="10" y1="21" x2="10" y2="14" />
      <line x1="14" y1="21" x2="14" y2="14" />
    </>
  ),
  flag: (
    <>
      <line x1="5" y1="3" x2="5" y2="21" />
      <path d="M5 4h13l-3 4 3 4H5" />
    </>
  ),
  people: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20c0-3.3 2.7-5.5 6-5.5s6 2.2 6 5.5" />
      <circle cx="17.5" cy="9" r="2.3" />
      <path d="M15.7 14.6c2.6.3 4.3 2.2 4.3 5.4" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
  star: (
    <polygon points="12 3 14.7 9.3 21.5 9.9 16.3 14.3 17.9 21 12 17.3 6.1 21 7.7 14.3 2.5 9.9 9.3 9.3" />
  ),
  alert: (
    <>
      <path d="M12 3 2 20h20z" />
      <line x1="12" y1="9.5" x2="12" y2="14" />
      <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
    </>
  ),
  handshake: (
    <>
      <path d="M2 12l4-3 3 2 4-3 3 2 4-3" />
      <path d="M9 11l3 3 3-3" />
      <path d="M2 12v3l4 3M22 12v3l-4 3" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="8" width="18" height="11" rx="1" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <line x1="3" y1="13" x2="21" y2="13" />
    </>
  ),
};

export default function Icon({
  name,
  className = "w-6 h-6",
  strokeWidth = 1.5,
}: {
  name: IconName;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      className={className}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
