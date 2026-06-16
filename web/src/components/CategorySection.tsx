import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { App, Category, StatusMap } from '../types'
import { AppCard } from './AppCard'

interface Props {
  categories: Category[]
  statuses: StatusMap
  editMode: boolean
  order: string[]
  isUserApp: (app: App) => boolean
  onRemoveUserApp: (app: App) => void
  onReorder: (newOrder: string[]) => void
  onAddToCategory: (catName: string) => void
  onCreateCategory: () => void
  onReorderCategories: (newOrder: string[]) => void
}

function catKey(name: string) { return `cat::${name}` }
function isCatKey(id: string) { return id.startsWith('cat::') }

function CategoryHeader({ name, label, count, editMode }: {
  name: string; label?: string; count: number; editMode: boolean
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: catKey(name),
    disabled: !editMode,
  })

  return (
    <div
      ref={editMode ? setNodeRef : undefined}
      style={editMode ? { transform: CSS.Transform.toString(transform), transition } : undefined}
      {...(editMode ? { ...attributes, ...listeners } : {})}
      className={`flex items-center justify-between mb-6 ${editMode ? 'cursor-grab active:cursor-grabbing' : ''}`}
    >
      <div className="flex items-center gap-2">
        <h2 id={`cat-${name}`} className="design-heading-md">{name}</h2>
        {editMode && (
          <span className="material-symbols-outlined text-[20px] text-(--color-outline)">
            drag_indicator
          </span>
        )}
      </div>
      <span className="design-label text-(--color-outline)">
        {label || `${count} SERVICES`}
      </span>
    </div>
  )
}

export function CategorySection({
  categories,
  statuses,
  editMode,
  order,
  isUserApp,
  onRemoveUserApp,
  onReorder,
  onAddToCategory,
  onCreateCategory,
  onReorderCategories,
}: Props) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const sortByOrder = (apps: App[]): App[] => {
    const m = new Map(apps.map((a) => [`${a.name}::${a.url}`, a]))
    const r: App[] = []
    const s = new Set<string>()
    for (const k of order) {
      const a = m.get(k)
      if (a && !s.has(k)) { r.push(a); s.add(k) }
    }
    for (const a of apps) {
      if (!s.has(`${a.name}::${a.url}`)) r.push(a)
    }
    return r
  }

  const allApps = categories.flatMap((c) => c.apps)
  const appIds = allApps.map((a) => `${a.name}::${a.url}`)
  const catIds = categories.map((c) => catKey(c.name))
  const allIds = [...catIds, ...appIds]

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    if (isCatKey(active.id as string) && isCatKey(over.id as string)) {
      const oi = catIds.indexOf(active.id as string)
      const ni = catIds.indexOf(over.id as string)
      if (oi !== -1 && ni !== -1) {
        onReorderCategories(arrayMove(categories.map((c) => c.name), oi, ni))
      }
      return
    }

    if (!isCatKey(active.id as string) && !isCatKey(over.id as string)) {
      const oi = appIds.indexOf(active.id as string)
      const ni = appIds.indexOf(over.id as string)
      if (oi !== -1 && ni !== -1) {
        onReorder(arrayMove(appIds, oi, ni))
      }
    }
  }

  if (categories.length === 0) return null

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={allIds} strategy={rectSortingStrategy}>
        <div className="space-y-8 md:space-y-10">
          {categories.map((cat) => {
            const sorted = sortByOrder(cat.apps)
            return (
              <section key={cat.name} aria-labelledby={`cat-${cat.name}`}>
                <CategoryHeader
                  name={cat.name}
                  label={cat.label}
                  count={sorted.length}
                  editMode={editMode}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {sorted.map((app) => (
                    <AppCard
                      key={`${app.name}::${app.url}`}
                      app={app}
                      status={statuses[app.url]}
                      editMode={editMode}
                      isUserApp={isUserApp(app)}
                      onRemove={() => onRemoveUserApp(app)}
                    />
                  ))}

                  {editMode && (
                    <button
                      onClick={() => onAddToCategory(cat.name)}
                      className="design-card design-card-quiet flex flex-col items-center justify-center border-dashed p-4 transition-colors duration-150 h-full"
                      style={{
                        minHeight: '160px',
                        color: 'var(--color-on-surface-variant)',
                      }}
                    >
                      <span className="material-symbols-outlined mb-2">add_circle</span>
                      <span className="design-label">ADD SERVICE</span>
                    </button>
                  )}
                </div>
              </section>
            )
          })}
        </div>
      </SortableContext>

      {editMode && (
        <section
          onClick={onCreateCategory}
          className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center gap-4 opacity-60 hover:opacity-100 transition-colors cursor-pointer mt-10"
          style={{
            borderColor: 'var(--color-hairline)',
            color: 'var(--color-outline)',
          }}
        >
          <span className="material-symbols-outlined text-[48px]">playlist_add</span>
          <p className="design-heading-md text-(--color-outline)">
            Create New Category
          </p>
        </section>
      )}
    </DndContext>
  )
}
