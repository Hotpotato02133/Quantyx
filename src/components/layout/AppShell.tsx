import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { TradeQuickEntrySheet } from '@/components/trades/TradeQuickEntrySheet'
import { CsvImportModal } from '@/components/trades/CsvImportModal'
import { ShareTradeCardModal } from '@/components/trades/ShareTradeCardModal'
import { ErrorBoundary } from '@/components/layout/ErrorBoundary'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { useUiStore } from '@/store/useUiStore'

interface AppShellProps {
  children: React.ReactNode
}

/**
 * Root layout shell wrapping all authenticated pages.
 * Composes: Sidebar (left) + Topbar (top) + page content area.
 */
export function AppShell({ children }: AppShellProps) {
  const { csvModalOpen, setCsvModalOpen, sharingTrade, setSharingTrade } = useUiStore()

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
      <CsvImportModal isOpen={csvModalOpen} onClose={() => setCsvModalOpen(false)} />
      <ShareTradeCardModal
        trade={sharingTrade}
        isOpen={Boolean(sharingTrade)}
        onClose={() => setSharingTrade(null)}
      />
    </div>
  )
}
