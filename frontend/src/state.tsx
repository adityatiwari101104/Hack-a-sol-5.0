import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { api, type AskResult, type DocumentRow, type Health } from './api'
import { todayISO } from './lib/format'
import type { Lang } from './lib/i18n'

// Replay mode serves only recorded model calls. The demo set was recorded with as_of 2026-11-23, so in replay the
// app's "today" is the recording date (stated openly in the top bar) — any other date would miss the cassette.
export const RECORDED_TODAY = '2026-11-23'

export type Domain = 'banking' | 'insurance' | 'uploads'

export interface HistoryEntry {
  question: string
  as_of: string
  profile: string
  outcome?: string
  query_id?: string
  collection?: string
  upload_ids?: string[]
  /** a follow-up's earlier turns, sent again when it is re-opened */
  history?: { question: string; query_id?: string }[]
  at: number
}

export interface Features {
  pages: boolean
  traceList: boolean
  tamper: boolean
  rules: boolean
  stream: boolean
  upload: boolean
  /** /ask accepts `history` / `previous_query_id` (follow-up questions) */
  followup: boolean
}

interface Ctx {
  health: Health | null
  healthError: string | null
  apiState: 'starting' | 'up' | 'down'
  retry: () => void
  /** Re-read /health quietly (live spend after an answer); no banner, no state change on failure. */
  refreshHealth: () => void
  features: Features
  docs: DocumentRow[]
  docById: Record<string, DocumentRow>
  today: string
  asOf: string
  setAsOf: (d: string) => void
  profile: string
  setProfile: (p: string) => void
  lang: Lang
  setLang: (l: Lang) => void
  theme: 'light' | 'dark'
  setTheme: (t: 'light' | 'dark') => void
  actor: string
  setActor: (a: string) => void
  domain: Domain
  setDomain: (d: Domain) => void
  uploadIds: string[]
  setUploadIds: (ids: string[]) => void
  uploadCollection: string
  setUploadCollection: (c: string) => void
  history: HistoryEntry[]
  pushHistory: (h: HistoryEntry) => void
  results: Record<string, AskResult>
  cacheResult: (r: AskResult) => void
  reducedMotion: boolean
}

const AppCtx = createContext<Ctx | null>(null)

function useStored<T>(key: string, init: T): [T, (v: T | ((old: T) => T)) => void] {
  const [v, setV] = useState<T>(() => {
    try {
      const s = localStorage.getItem(key)
      return s ? (JSON.parse(s) as T) : init
    } catch {
      return init
    }
  })
  const set = useCallback((nv: T | ((old: T) => T)) => {
    setV((old) => {
      const next = typeof nv === 'function' ? (nv as (o: T) => T)(old) : nv
      try {
        localStorage.setItem(key, JSON.stringify(next))
      } catch {
        /* quota */
      }
      return next
    })
  }, [key])
  return [v, set]
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [health, setHealth] = useState<Health | null>(null)
  const [healthError, setHealthError] = useState<string | null>(null)
  const [apiState, setApiState] = useState<'starting' | 'up' | 'down'>('starting')
  const [features, setFeatures] = useState<Features>({ pages: false, traceList: false, tamper: false, rules: false, stream: false, upload: false, followup: false })
  const [docs, setDocs] = useState<DocumentRow[]>([])
  const [profile, setProfile] = useStored('pos.profile', 'ucb_tier3')
  const [lang, setLang] = useStored<Lang>('pos.lang', 'en')
  // Light by default (paper, bright back-offices); dark is a projector toggle.
  const [theme, setTheme] = useStored<'light' | 'dark'>('pos.theme', 'light')
  const [actor, setActor] = useStored('pos.actor', 'A. Rao (maker)')
  const [domain, setDomain] = useStored<Domain>('pos.domain', 'banking')
  const [uploadIds, setUploadIds] = useStored<string[]>('pos.uploadIds', [])
  const [uploadCollection, setUploadCollection] = useStored('pos.uploadCollection', 'banking')
  const [history, setHistory] = useStored<HistoryEntry[]>('pos.history', [])
  const [results, setResults] = useState<Record<string, AskResult>>({})
  const [asOf, setAsOfState] = useState<string>(RECORDED_TODAY)
  const userMovedDate = useRef(false)
  const reducedMotion = typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

  const today = health && health.llm_mode !== 'replay' ? todayISO() : RECORDED_TODAY

  useEffect(() => {
    if (!userMovedDate.current) setAsOfState(today)
  }, [today])

  const setAsOf = useCallback((d: string) => {
    userMovedDate.current = true
    setAsOfState(d)
  }, [])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = lang === 'hi' ? 'hi' : 'en'
  }, [lang])

  // Backend status. The API loads its models at start-up (~15 s), and until then the Vite proxy answers 502.
  // For the first 45 s of failures (or after Retry) the UI says "starting"; after that it says "not running" with
  // the command to start it. Polls every 2 s while not up, every 15 s once up.
  const retryAt = useRef(Date.now())
  const [retryN, setRetryN] = useState(0)
  useEffect(() => {
    let alive = true
    let haveDocs = false
    let haveFeatures = false
    let timer = 0
    const detect = () => api.openapi().then((o) => {
      if (!alive) return
      haveFeatures = true
      const paths = Object.keys(o.paths ?? {})
      setFeatures({
        pages: paths.some((p) => p.includes('/pages')),
        traceList: paths.includes('/trace') || paths.includes('/trace/'),
        tamper: paths.some((p) => p.includes('tamper')),
        rules: paths.includes('/rules'),
        stream: paths.some((p) => p.includes('/ask/stream')),
        upload: !!(o.paths?.['/documents'] as Record<string, unknown> | undefined)?.post,
        followup: (() => { const p = ((o as { components?: { schemas?: Record<string, { properties?: Record<string, unknown> }> } }).components?.schemas?.AskIn?.properties) ?? {}; return 'history' in p || 'previous_query_id' in p })(),
      })
    }).catch(() => {})
    const tick = () => {
      api.health().then((h) => {
        if (!alive) return
        setHealth(h); setHealthError(null); setApiState('up')
        if (!haveDocs) api.documents().then((d) => { if (alive && d.length) { haveDocs = true; setDocs(d) } }).catch(() => {})
        if (!haveFeatures) detect()
        timer = window.setTimeout(tick, 15000)
      }).catch((e) => {
        if (!alive) return
        setHealthError(String(e.message ?? e))
        setApiState(Date.now() - retryAt.current < 45000 ? 'starting' : 'down')
        timer = window.setTimeout(tick, 2000)
      })
    }
    tick()
    return () => { alive = false; clearTimeout(timer) }
  }, [retryN])
  const refreshHealth = useCallback(() => { api.health().then(setHealth).catch(() => { /* the poller reports outages */ }) }, [])
  const retry = useCallback(() => { retryAt.current = Date.now(); setApiState('starting'); setRetryN((n) => n + 1) }, [])

  const pushHistory = useCallback((h: HistoryEntry) => {
    setHistory((old) => [h, ...old.filter((x) => !(x.question === h.question && x.as_of === h.as_of && x.profile === h.profile && !!x.history === !!h.history))].slice(0, 30))
  }, [setHistory])

  const cacheResult = useCallback((r: AskResult) => setResults((m) => ({ ...m, [r.query_id]: r })), [])

  const docById = useMemo(() => Object.fromEntries(docs.map((d) => [d.doc_id, d])), [docs])

  const value: Ctx = {
    health, healthError, apiState, retry, refreshHealth, features, docs, docById, today, asOf, setAsOf, profile, setProfile, lang, setLang, theme, setTheme,
    actor, setActor, domain, setDomain, uploadIds, setUploadIds, uploadCollection, setUploadCollection, history, pushHistory, results, cacheResult, reducedMotion,
  }
  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>
}

export function useApp(): Ctx {
  const c = useContext(AppCtx)
  if (!c) throw new Error('useApp outside provider')
  return c
}

// Minimal hash router: #/ (landing), #/ask, #/history/<chunk_id>, #/conflicts, #/impact, #/review, #/audit, #/governance
export function useRoute(): [string, string, (to: string) => void] {
  const parse = () => {
    const h = decodeURIComponent(window.location.hash.replace(/^#\/?/, ''))
    const [page, ...rest] = h.split('/')
    return [page || 'home', rest.join('/')] as [string, string]
  }
  const [r, setR] = useState(parse)
  useEffect(() => {
    const on = () => setR(parse())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  const go = useCallback((to: string) => { window.location.hash = '/' + to }, [])
  return [r[0], r[1], go]
}
