import { Component, type ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

// ErrorBoundary prevents a single render error (e.g. a malformed config
// event) from unmounting the whole app into a blank page.
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-3 p-8 text-center">
          <p className="design-heading-lg" style={{ color: 'var(--color-on-surface)' }}>
            Something went wrong
          </p>
          <p className="design-label max-w-md" style={{ color: 'var(--color-on-surface-variant)' }}>
            {String(this.state.error)}
          </p>
          <button
            onClick={() => this.setState({ error: null })}
            className="design-label mt-2 rounded-lg px-4 py-2 transition-colors"
            style={{
              backgroundColor: 'var(--color-primary)',
              color: 'var(--color-on-primary)',
            }}
          >
            Try again
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
