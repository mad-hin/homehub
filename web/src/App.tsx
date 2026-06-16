import { useState, useMemo, useEffect } from 'react'
import { useConfig } from './hooks/useConfig'
import { useLayout } from './hooks/useLayout'
import { useHealth } from './hooks/useHealth'
import { Greeter } from './components/Greeter'
import { SearchBar } from './components/SearchBar'
import { CategorySection } from './components/CategorySection'
import { BookmarkSection } from './components/BookmarkSection'
import { EditModeToggle } from './components/EditModeToggle'
import { AddSiteModal } from './components/AddSiteModal'
import { CreateCategoryModal } from './components/CreateCategoryModal'
import { HelpModal } from './components/HelpModal'
import type { App, Category } from './types'

export default function App() {
  const { config, loading, error } = useConfig()
  const {
    reorder, addUserApp, removeUserApp, isUserApp,
    order, userApps, userCategories, addUserCategory,
    categoriesOrder, reorderCategories,
  } = useLayout(config.categories)
  const statuses = useHealth()
  const [editMode, setEditMode] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addToCategory, setAddToCategory] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showHelp, setShowHelp] = useState(false)
  const [showCreateCat, setShowCreateCat] = useState(false)

  const handleAddToCategory = (catName: string) => {
    setAddToCategory(catName)
    setShowAddModal(true)
  }

  const handleToggleEdit = () => {
    if (!editMode) {
      // Entering edit mode — snapshot current layout
      const current = localStorage.getItem('homehub-layout')
      if (current) localStorage.setItem('homehub-layout-backup', current)
    } else {
      // Exiting via Save — discard backup
      localStorage.removeItem('homehub-layout-backup')
    }
    setEditMode(!editMode)
  }

  const handleEscapeEdit = () => {
    // Revert to snapshot
    const backup = localStorage.getItem('homehub-layout-backup')
    if (backup) {
      localStorage.setItem('homehub-layout', backup)
      localStorage.removeItem('homehub-layout-backup')
    }
    setEditMode(false)
    // Force reload layout state
    window.location.reload()
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (showHelp) { setShowHelp(false); return }
      if (showCreateCat) { setShowCreateCat(false); return }
      if (showAddModal) { setShowAddModal(false); return }
      if (editMode) { handleEscapeEdit(); return }
      if (searchQuery) { setSearchQuery(''); return }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [editMode, showAddModal, showHelp, showCreateCat, searchQuery])

  const handleAdd = (app: App) => {
    addUserApp({ ...app, category: addToCategory })
    setShowAddModal(false)
  }

  const handleCreateCategory = (cat: Category) => {
    addUserCategory(cat)
    setShowCreateCat(false)
  }

  const mergedCategories = useMemo((): Category[] => {
    const cats: Category[] = config.categories.map((c) => ({ ...c, apps: [...c.apps] }))
    for (const uc of userCategories) {
      if (!cats.some((c) => c.name === uc.name)) cats.push({ ...uc, apps: [] })
    }
    for (const ua of userApps) {
      const cat = cats.find((c) => c.name === ua.category)
      if (cat) {
        cat.apps.push(ua)
      } else if (cats.length > 0) {
        cats[0].apps.push(ua)
      }
    }
    if (categoriesOrder.length > 0) {
      const orderMap = new Map(categoriesOrder.map((name, i) => [name, i]))
      cats.sort((a, b) => {
        const ai = orderMap.get(a.name) ?? Infinity
        const bi = orderMap.get(b.name) ?? Infinity
        return ai - bi
      })
    }
    return cats
  }, [config.categories, userApps, userCategories, categoriesOrder])

  const filteredCategories = useMemo((): Category[] => {
    if (!searchQuery.trim()) return mergedCategories
    const q = searchQuery.toLowerCase()
    return mergedCategories
      .map((c) => ({
        ...c,
        apps: c.apps.filter(
          (a) =>
            a.name.toLowerCase().includes(q) ||
            a.label.toLowerCase().includes(q) ||
            a.url.toLowerCase().includes(q),
        ),
      }))
      .filter((c) => c.apps.length > 0)
  }, [mergedCategories, searchQuery])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center design-label text-(--color-outline)">
        Loading...
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center design-label text-(--color-error)">
        Failed to load config: {error}
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Edit mode banner offset */}
      {editMode && <div className="h-8" />}

      <main className="design-shell">
        <header className="mb-8 md:mb-10 flex items-center justify-between">
          <span className="design-heading-lg text-(--color-on-background)">Homehub</span>
          <button
            onClick={() => setShowHelp(true)}
            className="material-symbols-outlined w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-150 hover:bg-(--color-surface-container-low)"
            style={{ color: 'var(--color-outline)' }}
            title="Help"
          >
            help
          </button>
        </header>

        <Greeter greeting={config.greeting} />

        <SearchBar
          engines={config.search.engines}
          query={searchQuery}
          onQueryChange={setSearchQuery}
        />

        <CategorySection
          categories={filteredCategories}
          statuses={statuses}
          editMode={editMode}
          order={order}
          isUserApp={isUserApp}
          onRemoveUserApp={removeUserApp}
          onReorder={reorder}
          onAddToCategory={handleAddToCategory}
          onCreateCategory={() => setShowCreateCat(true)}
          onReorderCategories={reorderCategories}
        />

        <BookmarkSection groups={config.bookmarks} />

        <footer className="mt-16 pt-6 text-center"
          style={{ borderTop: '1px solid var(--color-hairline)' }}
        >
          <span className="design-label text-(--color-outline)">
            Powered by{' '}
            <a
              href="https://github.com/mad-hin/homehub"
              target="_blank"
              rel="noopener noreferrer"
              className="text-(--color-primary) hover:underline"
              style={{ textDecoration: 'none' }}
            >
              Homehub
            </a>
          </span>
        </footer>
      </main>

      <EditModeToggle editMode={editMode} onToggle={handleToggleEdit} />

      {showAddModal && (
        <AddSiteModal
          categoryName={addToCategory}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      {showCreateCat && (
        <CreateCategoryModal
          onAdd={handleCreateCategory}
          onClose={() => setShowCreateCat(false)}
        />
      )}
    </div>
  )
}
