// Monochrome line icons on a 16px grid (Activity Timeline ref: thin, single-weight strokes).
import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 16, children, ...rest }: P) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...rest}>
      {children}
    </svg>
  )
}

export const ICheck = (p: P) => <Svg {...p}><path d="M3.5 8.5l3 3 6-7" /></Svg>
export const IHalf = (p: P) => <Svg {...p}><circle cx="8" cy="8" r="5.5" /><path d="M8 2.5v11a5.5 5.5 0 000-11z" fill="currentColor" stroke="none" /></Svg>
export const IConflict = (p: P) => <Svg {...p}><path d="M2.5 5.5h9l-2.5-2.5M13.5 10.5h-9l2.5 2.5" /></Svg>
export const IHand = (p: P) => <Svg {...p}><path d="M8 2l5 2v4c0 3-2.2 5-5 6-2.8-1-5-3-5-6V4l5-2z" /><path d="M5.8 8h4.4" /></Svg>
export const IX = (p: P) => <Svg {...p}><path d="M4 4l8 8M12 4l-8 8" /></Svg>
export const IChevron = (p: P) => <Svg {...p}><path d="M6 3.5L10.5 8 6 12.5" /></Svg>
export const IChevronDown = (p: P) => <Svg {...p}><path d="M3.5 6L8 10.5 12.5 6" /></Svg>
export const ICalendar = (p: P) => <Svg {...p}><rect x="2.5" y="3.5" width="11" height="10" rx="1.5" /><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" /></Svg>
export const IBank = (p: P) => <Svg {...p}><path d="M2 6l6-3.5L14 6M3 6.5v5.5M6.3 6.5v5.5M9.7 6.5v5.5M13 6.5v5.5M2 13.5h12" /></Svg>
export const ISun = (p: P) => <Svg {...p}><circle cx="8" cy="8" r="2.8" /><path d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M3.4 12.6l1.1-1.1M11.5 4.5l1.1-1.1" /></Svg>
export const IMoon = (p: P) => <Svg {...p}><path d="M13 9.5A5.5 5.5 0 016.5 3a5.5 5.5 0 106.5 6.5z" /></Svg>
export const IAsk = (p: P) => <Svg {...p}><path d="M2.5 3.5h11v7h-6l-3 2.5v-2.5h-2z" /></Svg>
export const IHistory = (p: P) => <Svg {...p}><path d="M2.5 8a5.5 5.5 0 105.5-5.5A5.6 5.6 0 003.6 5M2.5 2.5V5h2.5" /><path d="M8 5v3l2 1.5" /></Svg>
export const IBoard = (p: P) => <Svg {...p}><rect x="2" y="2.5" width="3.5" height="11" rx="1" /><rect x="6.25" y="2.5" width="3.5" height="7" rx="1" /><rect x="10.5" y="2.5" width="3.5" height="9" rx="1" /></Svg>
export const IBell = (p: P) => <Svg {...p}><path d="M4 11V7a4 4 0 018 0v4l1 1.5H3L4 11zM6.5 14h3" /></Svg>
export const IInbox = (p: P) => <Svg {...p}><path d="M2.5 9.5l1.5-6h8l1.5 6v4h-11zM2.5 9.5h3.2l.8 1.5h3l.8-1.5h3.2" /></Svg>
export const IChain = (p: P) => <Svg {...p}><path d="M6.5 9.5l3-3M5.5 7.5l-1.8 1.8a2.1 2.1 0 003 3L8.5 10.5M10.5 8.5l1.8-1.8a2.1 2.1 0 00-3-3L7.5 5.5" /></Svg>
export const IShield = (p: P) => <Svg {...p}><path d="M8 2l5 2v4c0 3-2.2 5-5 6-2.8-1-5-3-5-6V4l5-2z" /><path d="M5.8 8l1.6 1.6 3-3" /></Svg>
export const IUpload = (p: P) => <Svg {...p}><path d="M8 10.5V2.5M4.8 5.5L8 2.3l3.2 3.2M2.5 10v3.5h11V10" /></Svg>
export const IDoc = (p: P) => <Svg {...p}><path d="M4 1.5h5.5L12.5 4.5v10h-8.5zM9.5 1.5v3h3M6 8h4.5M6 10.5h4.5" /></Svg>
export const IClock = (p: P) => <Svg {...p}><circle cx="8" cy="8" r="5.5" /><path d="M8 5v3.2l2 1.3" /></Svg>
export const ICalc = (p: P) => <Svg {...p}><rect x="3" y="1.5" width="10" height="13" rx="1.5" /><path d="M5.5 4.5h5M5.5 8h.01M8 8h.01M10.5 8h.01M5.5 10.5h.01M8 10.5h.01M10.5 10.5h.01" /></Svg>
export const IXray = (p: P) => <Svg {...p}><path d="M2.5 4h11M2.5 8h7M2.5 12h9" /><circle cx="12.5" cy="8" r="1.2" /></Svg>
export const ISearch = (p: P) => <Svg {...p}><circle cx="7" cy="7" r="4.2" /><path d="M10.2 10.2L13.5 13.5" /></Svg>
export const IArrowUp = (p: P) => <Svg {...p}><path d="M8 13V3M4 7l4-4 4 4" /></Svg>
export const IExternal = (p: P) => <Svg {...p}><path d="M9 2.5h4.5V7M13.5 2.5L7.5 8.5M11.5 9.5v4h-9v-9h4" /></Svg>
export const IFlag = (p: P) => <Svg {...p}><path d="M3.5 14V2.5M3.5 3h8l-1.5 3 1.5 3h-8" /></Svg>
export const ICopy = (p: P) => <Svg {...p}><rect x="5.5" y="5.5" width="8" height="8" rx="1.2" /><path d="M10.5 5.5V3a.5.5 0 00-.5-.5H3a.5.5 0 00-.5.5v7a.5.5 0 00.5.5h2.5" /></Svg>
export const IPrint = (p: P) => <Svg {...p}><path d="M4.5 6V2.5h7V6M4.5 11.5h-2v-5h11v5h-2M4.5 9.5h7v4h-7z" /></Svg>
export const ISend = (p: P) => <Svg {...p}><path d="M14 2L7 9M14 2l-4.5 12L7 9 2 6.5 14 2z" /></Svg>
export const IUser = (p: P) => <Svg {...p}><circle cx="8" cy="5.5" r="2.5" /><path d="M3 13.5c.8-2.4 2.7-3.5 5-3.5s4.2 1.1 5 3.5" /></Svg>
export const IWarn = (p: P) => <Svg {...p}><path d="M8 2.5l6 10.5H2L8 2.5zM8 7v2.6M8 11.3h.01" /></Svg>
export const IGlobe = (p: P) => <Svg {...p}><circle cx="8" cy="8" r="5.5" /><path d="M2.5 8h11M8 2.5c1.6 1.6 2.3 3.5 2.3 5.5S9.6 11.9 8 13.5C6.4 11.9 5.7 10 5.7 8S6.4 4.1 8 2.5z" /></Svg>
export const IZoomIn = (p: P) => <Svg {...p}><circle cx="7" cy="7" r="4.2" /><path d="M10.2 10.2L13.5 13.5M5 7h4M7 5v4" /></Svg>
export const IZoomOut = (p: P) => <Svg {...p}><circle cx="7" cy="7" r="4.2" /><path d="M10.2 10.2L13.5 13.5M5 7h4" /></Svg>
export const IScale = (p: P) => <Svg {...p}><path d="M8 2.5v11M4.5 13.5h7M3 4.5h10M3 4.5L1.5 8.5a1.8 1.8 0 003 0L3 4.5zM13 4.5l-1.5 4a1.8 1.8 0 003 0L13 4.5z" /></Svg>
export const IDiff = (p: P) => <Svg {...p}><path d="M5 2.5v7M2 6h6M3 13h4M11 6.5v7M8.5 11l2.5 2.5 2.5-2.5M11 2.5v.01" /></Svg>

/** Line-art filing cabinet with one drawer pulled open and empty ("No data yet" ref, tinted slate-blue). */
export function CabinetArt({ size = 84 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 96 96" fill="none" stroke="currentColor" strokeWidth="1.6"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="22" y="10" width="44" height="76" rx="3" />
      <path d="M22 35h44M22 60h44" />
      <path d="M38 21h12M38 71h12" />
      <path d="M22 41l-10 6v24h52V47l2-6" opacity="0.9" />
      <path d="M12 47h52" />
      <path d="M33 56h18" />
      <path d="M74 30l6-4M76 38h7M74 46l6 4" opacity="0.55" />
    </svg>
  )
}
