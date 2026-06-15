import type { BookmarkGroup } from '../types'

interface Props {
  groups: BookmarkGroup[]
}

export function BookmarkSection({ groups }: Props) {
  if (groups.length === 0) return null

  return (
    <section className="mt-14 pt-10" style={{ borderTop: '1px solid var(--color-hairline)' }}>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-10">
        {groups.map((g) => (
          <div key={g.name}>
            <h3 className="design-label mb-3 text-(--color-outline)">
              {g.label || g.name}
            </h3>
            <ul className="space-y-1.5">
              {g.links.map((l) => (
                <li key={l.name}>
                  <a
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[16px] leading-6 transition-colors duration-150 hover:underline text-(--color-on-surface)"
                    style={{ textDecoration: 'none' }}
                  >
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
