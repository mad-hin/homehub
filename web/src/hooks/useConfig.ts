import { useState, useEffect } from 'react'
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

export function useConfig() {
  const [config, setConfig] = useState<Config>(FALLBACK)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false

    const load = () => {
      fetch('/api/config')
        .then((res) => {
          if (!res.ok) throw new Error(`HTTP ${res.status}`)
          return res.json()
        })
        .then((data: Config) => {
          if (cancelled) return
          setConfig(data)
          applyTheme(data.theme)
          setError(null)
        })
        .catch((err) => {
          if (cancelled) return
          setError(err.message)
        })
        .finally(() => {
          if (!cancelled) setLoading(false)
        })
    }

    load()
    const id = setInterval(load, 3000)
    return () => { cancelled = true; clearInterval(id) }
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
