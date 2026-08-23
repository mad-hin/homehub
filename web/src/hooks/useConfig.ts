import { useState, useEffect, useRef } from 'react'
import type { Config } from '../types'

const FALLBACK: Config = {
  greeting: 'Welcome',
  search: { engines: [] },
  categories: [],
  bookmarks: [],
  theme: {
    surface: '#fcf9f8',
    surfaceContainerLow: '#f0eded',
    onSurface: '#1b1c1c',
    onSurfaceVariant: '#58413d',
    outline: '#8b716b',
    outlineVariant: '#dfc0b9',
    primary: '#a83820',
    primaryContainer: '#ff7759',
    onPrimary: '#ffffff',
    background: '#fcf9f8',
  },
}

// normalize guards against partial/legacy payloads (e.g. a config event
// arriving while config.json is mid-edit): missing arrays become [] and
// missing theme fields fall back to defaults, so rendering never sees null.
function normalize(data: Config | null): Config {
  const src: Partial<Config> = data ?? {}
  return {
    greeting: typeof src.greeting === 'string' ? src.greeting : FALLBACK.greeting,
    search: { engines: Array.isArray(src.search?.engines) ? src.search.engines : [] },
    categories: Array.isArray(src.categories)
      ? src.categories.map((c) => ({ ...c, apps: Array.isArray(c.apps) ? c.apps : [] }))
      : [],
    bookmarks: Array.isArray(src.bookmarks)
      ? src.bookmarks.map((g) => ({ ...g, links: Array.isArray(g.links) ? g.links : [] }))
      : [],
    theme: { ...FALLBACK.theme, ...(src.theme ?? {}) },
  }
}

export function useConfig() {
  const [config, setConfig] = useState<Config>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const loadedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const apply = (data: Config) => {
      if (cancelled) return
      const next = normalize(data)
      loadedRef.current = true
      setConfig(next)
      applyTheme(next.theme)
      setError(null)
      setLoading(false)
    }

    const es = new EventSource('/api/events')
    es.addEventListener('config', (e) => {
      try {
        const data = JSON.parse((e as MessageEvent).data) as Config
        apply(data)
      } catch { /* ignore malformed event */ }
    })
    es.addEventListener('error', () => {
      // EventSource auto-reconnects; once we have a config, transient drops
      // (proxy timeouts, server restarts) are invisible. Only surface an
      // error if the initial load never succeeded.
      if (!cancelled && !loadedRef.current) setError('connection lost (retrying)')
    })

    return () => { cancelled = true; es.close() }
  }, [])

  return { config, loading, error }
}

function applyTheme(t: Config['theme']) {
  const r = document.documentElement.style
  r.setProperty('--color-surface', t.surface)
  r.setProperty('--color-surface-container-low', t.surfaceContainerLow)
  r.setProperty('--color-on-surface', t.onSurface)
  r.setProperty('--color-on-surface-variant', t.onSurfaceVariant)
  r.setProperty('--color-outline', t.outline)
  r.setProperty('--color-outline-variant', t.outlineVariant)
  r.setProperty('--color-primary', t.primary)
  r.setProperty('--color-primary-container', t.primaryContainer)
  r.setProperty('--color-on-primary', t.onPrimary)
  r.setProperty('--color-background', t.background)
}
