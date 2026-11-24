// Jaali line-art watermark (landing_page_research.md §4 direction C).
/** Jaali lattice as 1px line art (direction C): an Indian institutional motif without any real emblem. */
export function JaaliPattern({ id = 'jaali' }: { id?: string }) {
  return (
    <svg className="jaali" aria-hidden="true" width="100%" height="100%">
      <defs>
        <pattern id={id} width="56" height="56" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M28 4 L34 22 L52 28 L34 34 L28 52 L22 34 L4 28 L22 22 Z" />
            <circle cx="28" cy="28" r="7" />
            <path d="M0 0 L8 8 M56 0 L48 8 M0 56 L8 48 M56 56 L48 48" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  )
}
