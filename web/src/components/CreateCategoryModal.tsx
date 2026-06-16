import { useState } from 'react'
import type { Category } from '../types'

interface Props {
  onAdd: (cat: Category) => void
  onClose: () => void
}

export function CreateCategoryModal({ onAdd, onClose }: Props) {
  const [name, setName] = useState('')
  const [label, setLabel] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onAdd({
      name: name.trim(),
      label: label.trim().toUpperCase() || name.trim().toUpperCase(),
      apps: [],
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
          Create New Category
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
              placeholder="Media"
              autoFocus
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
              placeholder="ENTERTAINMENT"
            />
          </div>
          <div className="flex gap-3 pt-3">
            <button
              type="submit"
              className="flex-1 design-pill h-11 design-label bg-(--color-primary-container) text-(--color-on-primary-container)"
            >
              Create
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
