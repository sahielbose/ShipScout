// Inline icons matching the prototype exactly. Sizes are mostly controlled by
// CSS (for example .aside .ab svg); pass width/height at call sites that need it.
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6 as number,
  ...props,
});

export const IconPlus = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconClock = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IconBookmark = (p: P) => (
  <svg {...base(p)}>
    <path d="M6 4h12v16l-6-4-6 4z" />
  </svg>
);
export const IconUpload = (p: P) => (
  <svg {...base(p)}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
export const IconGitHub = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="6" r="2.4" />
    <circle cx="6" cy="18" r="2.4" />
    <circle cx="18" cy="8" r="2.4" />
    <path d="M6 8.4v7.2M8.4 6h5.2a3 3 0 0 1 3 3v.6M18 10.4c0 4-3.5 4.6-6 5.2" />
  </svg>
);
export const IconHelp = (p: P) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .8-1 1.7" />
    <circle cx="12" cy="16.5" r="0.6" fill="currentColor" />
  </svg>
);
export const IconExit = (p: P) => (
  <svg {...base(p)}>
    <path d="M14 4h4v16h-4M10 12h8M13 9l3 3-3 3" />
  </svg>
);
export const IconChevronLeft = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M15 18l-6-6 6-6" />
  </svg>
);
export const IconArrowRight = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);
export const IconArrowUp = (p: P) => (
  <svg {...base(p)} strokeWidth={1.7}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
export const IconSearch = (p: P) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4-4" />
  </svg>
);
export const IconDownload = (p: P) => (
  <svg {...base(p)} strokeWidth={1.5}>
    <path d="M12 16V4M7 11l5 5 5-5M5 20h14" />
  </svg>
);
export const IconExternal = (p: P) => (
  <svg {...base(p)}>
    <path d="M7 17L17 7M9 7h8v8" />
  </svg>
);
export const IconShare = (p: P) => (
  <svg {...base(p)}>
    <circle cx="6" cy="12" r="2" />
    <circle cx="18" cy="6" r="2" />
    <circle cx="18" cy="18" r="2" />
    <path d="M8 11l8-4M8 13l8 4" />
  </svg>
);
export const IconCopy = (p: P) => (
  <svg {...base(p)}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h10" />
  </svg>
);
export const IconMail = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h16v12H4z" />
    <path d="M4 7l8 6 8-6" />
  </svg>
);
export const IconRefine = (p: P) => (
  <svg {...base(p)}>
    <path d="M3 5h18M6 12h12M10 19h4" />
  </svg>
);
export const IconSequence = (p: P) => (
  <svg {...base(p)}>
    <path d="M4 6h13v10H4z" />
    <path d="M4 7l6.5 5L17 7" />
    <path d="M20 9v9H9" />
  </svg>
);
