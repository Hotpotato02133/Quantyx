import { Component, type ReactNode, type ErrorInfo } from 'react'
import { AlertTriangle, RefreshCw, LayoutDashboard } from 'lucide-react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Quantyx ErrorBoundary caught an unhandled rendering error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-center bg-canvas">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 text-[#EF4444] mb-4">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-[#F4F4F5]">Something went wrong</h2>
          <p className="mt-1 text-sm text-[#A1A1AA] max-w-md">
            An unexpected error occurred while rendering this view.
          </p>
          {this.state.error?.message && (
            <p className="mt-2 text-xs font-mono text-[#EF4444] bg-[#EF4444]/10 border border-[#EF4444]/20 rounded px-2.5 py-1 max-w-lg truncate">
              {this.state.error.message}
            </p>
          )}
          <div className="mt-5 flex items-center gap-3">
            <button
              onClick={this.handleReset}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-profit text-[#0A0A0A] text-xs font-semibold hover:bg-profit/90 active:scale-95 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>Try Again</span>
            </button>
            <a
              href="/dashboard"
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border text-xs font-medium text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/[0.05] transition-colors"
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Back to Dashboard</span>
            </a>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
