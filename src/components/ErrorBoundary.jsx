import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch() {
    // Intentionally suppress verbose stack traces in user-facing production UI
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-white dark:bg-[#161616] flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-neutral-800 rounded-xl p-8 max-w-md w-full shadow-sm">
            <span className="inline-block px-2.5 py-1 text-xs font-mono uppercase tracking-widest bg-accent/10 text-accent rounded mb-4">
              Unexpected Error
            </span>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              An unexpected error occurred while rendering this view. Refresh the page or return home to continue.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="bg-accent hover:bg-accent-light text-white font-semibold text-sm px-5 py-2.5 rounded-md transition-colors cursor-pointer"
              >
                Reload Page
              </button>
              <a
                href="/"
                className="bg-gray-100 dark:bg-neutral-800 hover:bg-gray-200 dark:hover:bg-neutral-700 text-gray-800 dark:text-gray-200 font-semibold text-sm px-5 py-2.5 rounded-md transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
