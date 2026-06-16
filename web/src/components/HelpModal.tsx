interface Props {
  onClose: () => void
}

const ICONS = [
  'dns', 'security', 'deployed_code', 'live_tv', 'tv', 'movie',
  'play_circle', 'cloud', 'storage', 'home_iot_device', 'public',
  'rss_feed', 'download', 'bookmark', 'code', 'terminal',
  'database', 'hub', 'router', 'wifi', 'settings', 'monitoring',
  'analytics', 'smart_toy', 'automation', 'verified_user',
  'monitor_heart', 'description', 'folder', 'language', 'mail',
  'photo_library', 'music_note', 'shopping_cart', 'account_balance',
  'school', 'science', 'biotech', 'restaurant', 'directions_car',
  'flight', 'hotel', 'fitness_center', 'favorite', 'star',
  'bolt', 'water_drop', 'local_fire_department', 'psychology',
  'piano', 'podcasts', 'satellite_alt', 'masks',
]

export function HelpModal({ onClose }: Props) {
  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      style={{ backgroundColor: 'rgba(27, 28, 28, 0.4)' }}
      onClick={onClose}
    >
      <div className="min-h-screen flex items-start justify-center p-4 pt-12">
        <div
          className="w-full max-w-2xl rounded-xl p-8 md:p-12"
          style={{
            backgroundColor: 'var(--color-background)',
            border: '1px solid var(--color-hairline)',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-start mb-10">
            <h1
              className="design-heading-lg text-(--color-on-background)"
            >
              How to use Homehub
            </h1>
            <button
              onClick={onClose}
              className="material-symbols-outlined text-(--color-outline) hover:text-(--color-on-surface) transition-colors"
            >
              close
            </button>
          </div>

          <div className="space-y-10">
            {/* Search */}
            <section>
              <h2 className="design-heading-md mb-4 text-(--color-on-surface)">Search bar</h2>
              <ul className="space-y-2 text-[16px] leading-6 text-(--color-on-surface)">
                <li>Press <kbd className="px-1.5 py-0.5 rounded text-xs font-medium bg-(--color-surface-container-low) border border-(--color-hairline) font-mono">/</kbd> anywhere to focus the search bar.</li>
                <li><strong>Type to filter</strong> — service cards update instantly as you type. Matches name, label, and URL.</li>
                <li><strong>Press Enter</strong> to search the web with the active engine.</li>
                <li>Switch engines by typing a prefix: <code className="px-1 py-0.5 rounded text-xs bg-(--color-surface-container-low) border border-(--color-hairline)">/g</code> for Google, <code className="px-1 py-0.5 rounded text-xs bg-(--color-surface-container-low) border border-(--color-hairline)">/d</code> for DuckDuckGo, etc.</li>
                <li>Press <kbd className="px-1.5 py-0.5 rounded text-xs font-medium bg-(--color-surface-container-low) border border-(--color-hairline) font-mono">ESC</kbd> to clear the search and exit edit mode.</li>
              </ul>
            </section>

            {/* Edit mode */}
            <section>
              <h2 className="design-heading-md mb-4 text-(--color-on-surface)">Edit mode</h2>
              <ul className="space-y-2 text-[16px] leading-6 text-(--color-on-surface)">
                <li>Click the <span className="material-symbols-outlined text-[16px] align-text-bottom">edit</span> button (bottom right) to enter layout configuration mode.</li>
                <li><strong>Drag cards</strong> to reorder them within and across categories.</li>
                <li>Click <strong>"ADD SERVICE"</strong> inside any category to add your own site — it saves to your browser.</li>
                <li>Click <span className="material-symbols-outlined text-[16px] align-text-bottom text-(--color-error)">close</span> on any card you added to remove it.</li>
                <li>Click <strong>"Save Layout"</strong> or press <kbd className="px-1.5 py-0.5 rounded text-xs font-medium bg-(--color-surface-container-low) border border-(--color-hairline) font-mono">ESC</kbd> to exit edit mode.</li>
                <li className="text-(--color-on-surface-variant)">Edit mode changes (reordering, added sites) are saved in your browser's local storage. Clearing your browser history or site data will reset your layout to the server default.</li>
              </ul>
            </section>

            {/* Config */}
            <section>
              <h2 className="design-heading-md mb-4 text-(--color-on-surface)">Configuration</h2>
              <ul className="space-y-2 text-[16px] leading-6 text-(--color-on-surface)">
                <li>Edit <code className="px-1 py-0.5 rounded text-xs bg-(--color-surface-container-low) border border-(--color-hairline)">config.json</code> on the server to add or remove services, bookmarks, or change the theme.</li>
                <li>Changes are picked up automatically within seconds — no restart needed.</li>
                <li>Each person who opens the dashboard gets their own layout (drag order, added sites) saved in their browser.</li>
              </ul>
            </section>

            {/* Icons */}
            <section>
              <h2 className="design-heading-md mb-4 text-(--color-on-surface)">Icons</h2>
              <p className="text-[16px] leading-6 text-(--color-on-surface-variant) mb-4">
                Use any name from{' '}
                <a
                  href="https://fonts.google.com/icons?icon.style=Outlined"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline text-(--color-primary)"
                >
                  Google Material Symbols
                </a>
                {' '}in the <code className="px-1 py-0.5 rounded text-xs bg-(--color-surface-container-low) border border-(--color-hairline)">icon</code> field of config.json or when adding a site.
                Here are some useful ones:
              </p>
              <div className="flex flex-wrap gap-2">
                {ICONS.map((icon) => (
                  <span
                    key={icon}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{
                      backgroundColor: 'var(--color-surface-container-low)',
                      border: '1px solid var(--color-hairline)',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '11px',
                      color: 'var(--color-on-surface-variant)',
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px] text-(--color-primary)">{icon}</span>
                    {icon}
                  </span>
                ))}
              </div>
            </section>

            {/* Keyboard shortcuts */}
            <section>
              <h2 className="design-heading-md mb-4 text-(--color-on-surface)">Keyboard shortcuts</h2>
              <div className="space-y-2 text-[16px] leading-6">
                {[
                  ['/', 'Focus search bar'],
                  ['ESC', 'Exit edit mode / close modal'],
                  ['Enter', 'Search web (when search bar focused)'],
                ].map(([key, desc]) => (
                  <div key={key} className="flex items-center gap-3">
                    <kbd
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium shrink-0"
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        backgroundColor: 'var(--color-surface-container-low)',
                        border: '1px solid var(--color-hairline)',
                        color: 'var(--color-on-surface-variant)',
                      }}
                    >
                      {key}
                    </kbd>
                    <span className="text-(--color-on-surface)">{desc}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
