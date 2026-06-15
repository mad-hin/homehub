import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { App, AppStatus } from '../types'

interface Props {
  app: App
  status?: AppStatus
  editMode: boolean
  isUserApp: boolean
  onRemove?: () => void
}

export function AppCard({ app, status, editMode, isUserApp, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: `${app.name}::${app.url}`,
    disabled: !editMode,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  }

  const handleClick = (e: React.MouseEvent) => {
    if (editMode) { e.preventDefault(); return }
    window.open(app.url, '_blank')
  }

  const checked = status !== undefined
  const online = status?.online ?? false

  const hairlineBorder = '1px solid var(--color-hairline)'

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        minHeight: '160px',
      }}
      {...(editMode ? { ...attributes, ...listeners } : {})}
      onClick={handleClick}
      className={`design-card relative flex flex-col justify-between p-4 transition-colors duration-150 group
        ${editMode
          ? 'cursor-grab active:cursor-grabbing'
          : 'cursor-pointer'
        }`}
    >
      {/* Drag handle — visible in edit mode */}
      {editMode && (
        <div className="absolute top-2 left-2 opacity-60 group-hover:opacity-100 z-10">
          <span className="material-symbols-outlined text-[18px] text-(--color-outline)">
            drag_indicator
          </span>
        </div>
      )}

      {/* Delete button — only for user-added apps in edit mode */}
      {editMode && isUserApp && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove?.() }}
          className="absolute top-2 right-2 opacity-60 hover:opacity-100 z-10"
          style={{ color: 'var(--color-error)' }}
        >
          <span className="material-symbols-outlined text-[18px]">close</span>
        </button>
      )}

      {/* Top row: icon box + status dot */}
      <div className="flex justify-between items-start">
        <div
          className="p-2.5 rounded-lg"
          style={{
            backgroundColor: 'var(--color-background)',
            border: hairlineBorder,
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: 'var(--color-primary)' }}
          >
            {app.icon}
          </span>
        </div>
        <div
          className="w-2 h-2 rounded-full mt-1"
          title={checked ? (online ? 'Online' : 'Offline') : 'Checking...'}
          style={{
            backgroundColor: !checked
              ? 'var(--color-outline-variant)'
              : online
                ? 'var(--color-status-online)'
                : 'var(--color-status-offline)',
          }}
        />
      </div>

      {/* Bottom: title + label */}
      <div>
        <h3
          className="mb-0.5 group-hover:underline underline-offset-4 decoration-1"
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '16px',
            fontWeight: 600,
            lineHeight: '24px',
          }}
        >
          {app.name}
        </h3>
        <p
          className="uppercase"
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: '12px',
            fontWeight: 500,
            lineHeight: '16px',
            letterSpacing: '0.05em',
            color: 'var(--color-on-surface-variant)',
          }}
        >
          {app.label || 'APP'}
        </p>
      </div>
    </div>
  )
}
