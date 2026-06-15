interface Props {
  editMode: boolean
  onToggle: () => void
}

export function EditModeToggle({ editMode, onToggle }: Props) {
  return (
    <>
      {/* Edit mode banner */}
      {editMode && (
        <div
          className="fixed top-0 left-0 w-full z-100 flex justify-center items-center gap-2 py-2"
          style={{
            backgroundColor: 'var(--color-primary-container)',
            color: 'var(--color-on-primary-container)',
          }}
        >
          <span className="material-symbols-outlined text-[14px]">edit</span>
          <span className="design-label">Layout Configuration Mode</span>
        </div>
      )}

      {/* Save Layout pill — bottom-left, visible only in edit mode */}
      {editMode && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 left-4 md:left-16 z-50 h-14 px-6 design-pill flex items-center gap-2 transition-colors duration-150 hover:brightness-110"
          style={{
            backgroundColor: 'var(--color-primary)',
            color: 'var(--color-on-primary)',
          }}
        >
          <span className="material-symbols-outlined">check</span>
          <span className="design-label normal-case tracking-normal text-[16px] leading-6 font-semibold">Save Layout</span>
        </button>
      )}

      {/* Toggle FAB — bottom-right */}
      <button
        onClick={onToggle}
        className="fixed bottom-6 right-6 w-14 h-14 design-pill flex items-center justify-center transition-transform duration-150 z-50 group hover:scale-110"
        style={{
          backgroundColor: 'var(--color-primary)',
          color: 'var(--color-on-primary)',
        }}
        title={editMode ? 'Save Layout & Exit' : 'Edit Layout'}
      >
        <span
          className={`material-symbols-outlined text-[28px] transition-transform ${editMode ? 'group-hover:rotate-12' : ''
            }`}
        >
          {editMode ? 'check' : 'edit'}
        </span>

        {/* Tooltip in edit mode */}
        {editMode && (
          <div
            className="absolute right-full mr-4 py-1 px-3 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
            style={{
              backgroundColor: '#303030',
              color: '#f3f0ef',
            }}
          >
            <span className="design-label normal-case tracking-normal">Save Layout &amp; Exit</span>
          </div>
        )}
      </button>
    </>
  )
}
