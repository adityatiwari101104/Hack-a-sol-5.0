// One popover primitive for the whole app: rendered in a portal on document.body (so no stacking context or
// overflow container in page content can trap or clip it), positioned against its anchor, flipped above/below and
// shifted to stay inside the viewport, re-positioned on scroll/resize, closed on Esc or an outside click.
// z-index comes from the token scale in tokens.css (--z-popover, --z-tooltip).
import { useLayoutEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { createPortal } from 'react-dom'

type Place = 'bottom-start' | 'bottom-end' | 'top-start'

export function Popover({ anchor, open, onClose, children, place = 'bottom-start', className = '', layer = 'popover', role = 'dialog', label, matchWidth, interactive = true }: {
  anchor: RefObject<HTMLElement | null>
  open: boolean
  onClose?: () => void
  children: ReactNode
  place?: Place
  className?: string
  layer?: 'popover' | 'tooltip'
  role?: string
  label?: string
  matchWidth?: boolean
  interactive?: boolean
}) {
  const box = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number; width?: number; flipped: boolean } | null>(null)

  useLayoutEffect(() => {
    if (!open) { setPos(null); return }
    const update = () => {
      const a = anchor.current
      const b = box.current
      if (!a || !b) return
      const r = a.getBoundingClientRect()
      const vw = window.innerWidth
      const vh = window.innerHeight
      const m = 8
      const w = matchWidth ? r.width : Math.min(b.offsetWidth, vw - 2 * m)
      const h = b.offsetHeight
      let top = place.startsWith('top') ? r.top - h - 6 : r.bottom + 6
      let flipped = false
      if (!place.startsWith('top') && top + h > vh - m && r.top - h - 6 > m) { top = r.top - h - 6; flipped = true }
      if (place.startsWith('top') && top < m && r.bottom + 6 + h < vh - m) { top = r.bottom + 6; flipped = true }
      top = Math.max(m, Math.min(top, vh - h - m))
      let left = place.endsWith('end') ? r.right - w : r.left
      left = Math.max(m, Math.min(left, vw - w - m))
      setPos({ top, left, width: matchWidth ? r.width : undefined, flipped })
    }
    update()
    const raf = requestAnimationFrame(update) // after content (fonts, async) settles
    window.addEventListener('resize', update)
    window.addEventListener('scroll', update, true)
    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', update); window.removeEventListener('scroll', update, true) }
  }, [open, anchor, place, matchWidth])

  useLayoutEffect(() => {
    if (!open || !onClose) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { onClose(); anchor.current?.focus?.() } }
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node
      if (box.current?.contains(t) || anchor.current?.contains(t)) return
      onClose()
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => { document.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onDown) }
  }, [open, onClose, anchor])

  if (!open) return null
  return createPortal(
    <div ref={box} className={`popover layer-${layer} ${className}`} role={role} aria-label={label}
      style={{ top: pos?.top ?? -9999, left: pos?.left ?? -9999, width: pos?.width, visibility: pos ? 'visible' : 'hidden', pointerEvents: interactive ? 'auto' : 'none' }}>
      {children}
    </div>,
    document.body,
  )
}
