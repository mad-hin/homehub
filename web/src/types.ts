export interface App {
  name: string
  url: string
  icon: string
  label: string
  category?: string
}

export interface Category {
  name: string
  label: string
  apps: App[]
}

export interface SearchEngine {
  name: string
  url: string
  prefix: string
}

export interface Search {
  engines: SearchEngine[]
}

export interface BookmarkLink {
  name: string
  url: string
}

export interface BookmarkGroup {
  name: string
  label: string
  links: BookmarkLink[]
}

export interface Theme {
  surface: string
  surfaceContainerLow: string
  onSurface: string
  onSurfaceVariant: string
  outline: string
  outlineVariant: string
  primary: string
  primaryContainer: string
  onPrimary: string
  background: string
}

export interface Config {
  greeting: string
  search: Search
  categories: Category[]
  bookmarks: BookmarkGroup[]
  theme: Theme
}

export interface AppStatus {
  url: string
  online: boolean
  statusCode: number
  latencyMs: number
  checkedAt: string
  error?: string
}

export interface UserLayout {
  order: string[]
  userApps: App[]
  categories: Category[]
  categoriesOrder: string[]
}

export type StatusMap = Record<string, AppStatus>
