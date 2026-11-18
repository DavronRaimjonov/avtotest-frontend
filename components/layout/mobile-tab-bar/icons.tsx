// iOS tab bar ikonkalari — SF Symbols uslubida to'ldirilgan (house.fill, square.grid.2x2.fill,
// exclamationmark.triangle.fill, ellipsis.circle.fill). Rang — currentColor
type P = { size?: number };

const Svg = ({ size = 26, children }: P & { children: React.ReactNode }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    {children}
  </svg>
);

export const HouseFill = (p: P) => (
  <Svg {...p}>
    <path d="M11.3 2.6a1.1 1.1 0 0 1 1.4 0l8.6 7.1c.6.5.3 1.5-.5 1.5H19.5v8.3c0 .8-.6 1.5-1.5 1.5h-3.3v-5.6c0-.5-.4-.9-.9-.9h-3.6c-.5 0-.9.4-.9.9V21H6c-.8 0-1.5-.7-1.5-1.5v-8.3H3.2c-.8 0-1.1-1-.5-1.5z" />
  </Svg>
);

export const GridFill = (p: P) => (
  <Svg {...p}>
    <rect x="3" y="3" width="8" height="8" rx="2.2" />
    <rect x="13" y="3" width="8" height="8" rx="2.2" />
    <rect x="3" y="13" width="8" height="8" rx="2.2" />
    <rect x="13" y="13" width="8" height="8" rx="2.2" />
  </Svg>
);


export const TriangleFill = (p: P) => (
  <Svg {...p}>
    <path d="M10.3 3.3a2 2 0 0 1 3.4 0l7.9 13.6A2 2 0 0 1 19.9 20H4.1a2 2 0 0 1-1.7-3.1zM12 8.2c-.6 0-1.1.5-1 1.1l.3 4.6c0 .4.3.7.7.7s.7-.3.7-.7l.3-4.6c.1-.6-.4-1.1-1-1.1zm0 9.3a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4z" />
  </Svg>
);


export const EllipsisFill = (p: P) => (
  <Svg {...p}>
    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM7 13.4a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8zm5 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8zm5 0a1.4 1.4 0 1 1 0-2.8 1.4 1.4 0 0 1 0 2.8z" />
  </Svg>
);
