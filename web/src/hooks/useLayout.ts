import { useState, useCallback } from 'react'
import type { App, Category, UserLayout } from '../types'

const STORAGE_KEY = 'homehub-layout'

function load(): UserLayout {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return { order: [], userApps: [], categories: [] }
}

function save(l: UserLayout) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(l))
}

function appKey(a: App): string {
  return `${a.name}::${a.url}`
}

function defaultOrder(cats: Category[]): string[] {
  const o: string[] = []
  for (const c of cats) for (const a of c.apps) o.push(appKey(a))
  return o
}

export function useLayout(serverCats: Category[]) {
  const [layout, setLayout] = useState<UserLayout>(load)

  const allApps = useCallback((): App[] => {
    const serverApps = serverCats.flatMap((c) => c.apps)
    const merged = [...serverApps]
    for (const ua of layout.userApps) {
      if (!merged.some((a) => appKey(a) === appKey(ua))) merged.push(ua)
    }
    const order = layout.order.length > 0 ? layout.order : defaultOrder(serverCats)
    const sorted: App[] = []
    const seen = new Set<string>()
    for (const key of order) {
      const app = merged.find((a) => appKey(a) === key)
      if (app && !seen.has(key)) { sorted.push(app); seen.add(key) }
    }
    for (const app of merged) {
      if (!seen.has(appKey(app))) sorted.push(app)
    }
    return sorted
  }, [serverCats, layout])

  const reorder = useCallback((o: string[]) => {
    setLayout((prev) => { const n = { ...prev, order: o }; save(n); return n })
  }, [])

  const addUserApp = useCallback((app: App) => {
    setLayout((prev) => {
      const n = { ...prev, userApps: [...prev.userApps, app], order: [...prev.order, appKey(app)] }
      save(n); return n
    })
  }, [])

  const removeUserApp = useCallback((app: App) => {
    const key = appKey(app)
    setLayout((prev) => {
      const n = { ...prev, userApps: prev.userApps.filter((a) => appKey(a) !== key), order: prev.order.filter((k) => k !== key) }
      save(n); return n
    })
  }, [])

  const isUserApp = useCallback((app: App) => layout.userApps.some((a) => appKey(a) === appKey(app)), [layout.userApps])

  return { allApps, reorder, addUserApp, removeUserApp, isUserApp, order: layout.order, userApps: layout.userApps }
}
