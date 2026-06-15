import { useState, useMemo } from 'react'
import { useConfig } from './hooks/useConfig'
import { useLayout } from './hooks/useLayout'
import { useHealth } from './hooks/useHealth'
import { Greeter } from './components/Greeter'
import { SearchBar } from './components/SearchBar'
import { CategorySection } from './components/CategorySection'
import { BookmarkSection } from './components/BookmarkSection'
import { EditModeToggle } from './components/EditModeToggle'
import { AddSiteModal } from './components/AddSiteModal'
import type { App, Category } from './types'

export default function App() {
  const { config, loading, error } = useConfig()
  const { reorder, addUserApp, removeUserApp, isUserApp, order, userApps } = useLayout(
    config.categories,
  )
  const statuses = useHealth()
  const [editMode, setEditMode] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [addToCategory, setAddToCategory] = useState('')

  const handleAddToCategory = (catName: string) => {
    setAddToCategory(catName)
    setShowAddModal(true)
  }

  const handleAdd = (app: App) => {
    addUserApp({ ...app, category: addToCategory })
    setShowAddModal(false)
  }

  const mergedCategories = useMemo((): Category[] => {
    const cats = config.categories.map((c) => ({ ...c, apps: [...c.apps] }))
    for (const ua of userApps) {
      const cat = cats.find((c) => c.name === ua.category)
      if (cat) {
        cat.apps.push(ua)
      } else if (cats.length > 0) {
        cats[0].apps.push(ua)
      }
    }
    return cats
  }, [config.categories, userApps])

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
    <div className="min-h-screen pb-28">
      {/* Edit mode banner offset */}
      {editMode && <div className="h-8" />}

      <main className="design-shell">
        <header className="mb-8 md:mb-10">
          <span className="design-heading-lg text-(--color-on-background)">Homehub</span>
        </header>

        <Greeter greeting={config.greeting} />

        <SearchBar engines={config.search.engines} />

        <CategorySection
          categories={mergedCategories}
          statuses={statuses}
          editMode={editMode}
          order={order}
          isUserApp={isUserApp}
          onRemoveUserApp={removeUserApp}
          onReorder={reorder}
          onAddToCategory={handleAddToCategory}
        />

        <BookmarkSection groups={config.bookmarks} />
      </main>

      <EditModeToggle editMode={editMode} onToggle={() => setEditMode(!editMode)} />

      {showAddModal && (
        <AddSiteModal
          categoryName={addToCategory}
          onAdd={handleAdd}
          onClose={() => setShowAddModal(false)}
        />
      )}
    </div>
  )
}
