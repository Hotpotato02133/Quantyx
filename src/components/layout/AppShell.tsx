import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { TradeQuickEntrySheet } from '@/components/trades/TradeQuickEntrySheet'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { SettingsModal } from '@/components/settings/SettingsModal'

interface AppShellProps {
  children: React.ReactNode
}

/**
 * Root layout shell wrapping all authenticated pages.
 * Composes: Sidebar (left) + Topbar (top) + page content area.
 */
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-canvas">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Topbar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>

      {/* Global overlays */}
      <CommandPalette />
      <TradeQuickEntrySheet />
      <SettingsModal />
    </div>
  )
}
