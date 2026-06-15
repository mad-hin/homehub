import { useState } from 'react'
import type { App } from '../types'

interface Props {
  categoryName: string
  onAdd: (app: App) => void
  onClose: () => void
}

export function AddSiteModal({ categoryName, onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [url, setUrl] = useState('')
  const [icon, setIcon] = useState('bookmark')
  const [label, setLabel] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return

    let resolvedUrl = url.trim()
    if (!resolvedUrl.startsWith('http://') && !resolvedUrl.startsWith('https://')) {
      resolvedUrl = `https://${resolvedUrl}`
    }

    onAdd({
      name: name.trim(),
      url: resolvedUrl,
      icon: icon.trim() || 'bookmark',
      label: label.trim().toUpperCase() || 'SERVICE',
    })
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(27, 28, 28, 0.22)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-lg p-8"
        style={{
          backgroundColor: 'var(--color-background)',
          border: '1px solid var(--color-hairline)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="design-heading-md mb-6 text-(--color-on-surface)">
          Add to {categoryName}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="design-label block mb-1 text-(--color-outline)">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="design-input"
              placeholder="My App"
              autoFocus
            />
          </div>
          <div>
            <label className="design-label block mb-1 text-(--color-outline)">
              URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="design-input"
              placeholder="https://example.com"
            />
          </div>
          <div>
            <label className="design-label block mb-1 text-(--color-outline)">
              Icon
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="design-input"
              placeholder="bookmark"
            />
          </div>
          <div>
            <label className="design-label block mb-1 text-(--color-outline)">
              Label
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="design-input"
              placeholder="SERVICE"
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 design-pill h-11 design-label bg-(--color-primary-container) text-(--color-on-primary-container)"
            >
              Add
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 design-pill h-11 design-label border border-(--color-hairline) text-(--color-outline) hover:border-(--color-primary) hover:text-(--color-primary) transition-colors duration-150"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
