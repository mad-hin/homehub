import { useState } from 'react'
import type { Category, Config } from '../types'

interface Props {
  config: Config
  categories: Category[]
  onClose: () => void
}

export function ConfigGenModal({ config, categories, onClose }: Props) {
  const [copied, setCopied] = useState(false)

  const generated: Config = {
    ...config,
    categories: categories.map((c) => ({
      name: c.name,
      label: c.label,
      apps: c.apps.map((a) => ({
        name: a.name,
        url: a.url,
        icon: a.icon,
        label: a.label,
      })),
    })),
  }

  const json = JSON.stringify(generated, null, 2)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(json)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch { /* clipboard may be unavailable over http */ }
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: 'rgba(27, 28, 28, 0.4)' }}
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center p-4 pt-12">
        <div
          className="w-full max-w-3xl rounded-xl p-8 md:p-10"
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-hairline)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-6">
            <h1 className="design-heading-lg text-(--color-on-background)">
              Generated config
            </h1>
            <button
              onClick={onClose}
              className="material-symbols-outlined text-(--color-outline) hover:text-(--color-on-surface) transition-colors"
            >
              close
            </button>
          </div>

          <p className="text-[16px] leading-6 text-(--color-on-surface-variant) mb-6">
            This merges the server config with all apps and categories stored in
            your browser's local layout. If you're an admin, copy the JSON below
            and paste it into the server's{' '}
            <code className="px-1 py-0.5 rounded text-xs bg-(--color-surface-container-low) border border-(--color-hairline)">
              config.json
            </code>{' '}
            so everyone shares the same layout.
          </p>

          <pre
            className="text-xs rounded-lg p-4 overflow-auto max-h-96"
            style={{
              backgroundColor: 'var(--color-surface-container-low)',
              border: '1px solid var(--color-hairline)',
              color: 'var(--color-on-surface-variant)',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {json}
          </pre>

          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCopy}
              className="design-pill h-11 px-6 design-label bg-(--color-primary-container) text-(--color-on-primary-container) flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-[16px]">
                {copied ? 'check' : 'content_copy'}
              </span>
              {copied ? 'Copied' : 'Copy JSON'}
            </button>
            <button
              onClick={onClose}
              className="design-pill h-11 px-6 design-label border border-(--color-hairline) text-(--color-outline) hover:border-(--color-primary) hover:text-(--color-primary) transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
