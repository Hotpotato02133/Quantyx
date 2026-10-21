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
  showTopbar?: boolean
}

/**
 * Root layout shell wrapping all authenticated pages.
 * Composes: Sidebar (left) + Topbar (top, optional) + page content area.
 */
export function AppShell({ children, showTopbar = true }: AppShellProps) {
  const { csvModalOpen, setCsvModalOpen, sharingTrade, setSharingTrade } = useUiStore()

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#0A0A0A]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden min-w-0 bg-[#0A0A0A]">
        {showTopbar && <Topbar />}
        <main className="flex-1 overflow-y-auto overflow-x-hidden bg-[#0A0A0A]">
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
