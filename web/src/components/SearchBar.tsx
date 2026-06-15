import { useState, useRef, useEffect } from 'react'
import type { SearchEngine } from '../types'

interface Props {
  engines: SearchEngine[]
}

export function SearchBar({ engines }: Props) {
  const [query, setQuery] = useState('')
  const [activeEngine, setActiveEngine] = useState<SearchEngine | null>(
    engines.length > 0 ? engines[0] : null,
  )
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && query.trim() && activeEngine) {
      window.location.href = activeEngine.url + encodeURIComponent(query.trim())
      return
    }
    for (const eng of engines) {
      if (query.trim() === eng.prefix) {
        setActiveEngine(eng)
        setQuery('')
        e.preventDefault()
        return
      }
    }
  }

  return (
    <section className="max-w-2xl mx-auto mb-20 w-full">
      <div className="relative group">
        <div
          className="flex items-center rounded-xl px-4 py-2.5 transition-all duration-150 focus-within:border-(--color-primary)"
          style={{
            backgroundColor: 'var(--color-surface-container-low)',
            border: '1px solid var(--color-hairline)',
          }}
        >
          <span
            className="material-symbols-outlined mr-4 shrink-0"
            style={{ color: 'var(--color-on-surface-variant)' }}
          >
            search
          </span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent border-none outline-none focus:ring-0 text-[16px] leading-6 placeholder:opacity-50"
            style={{
              color: 'var(--color-on-surface)',
              fontFamily: "'Inter', sans-serif",
            }}
            placeholder="Search services or enter URL..."
          />
          <kbd
            className="hidden md:inline-flex items-center px-2 py-1 rounded-lg text-xs font-medium shrink-0"
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              backgroundColor: 'var(--color-background)',
              border: '1px solid var(--color-hairline)',
              color: 'var(--color-on-surface-variant)',
            }}
          >
            CMD + K
          </kbd>
        </div>
      </div>
    </section>
  )
}
