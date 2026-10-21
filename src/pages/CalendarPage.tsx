import { useState } from 'react'
import { AppShell } from '@/components/layout/AppShell'
import { CalendarHeatmap } from '@/components/dashboard/DashboardCharts'
import { CsvImportModal } from '@/components/trades/CsvImportModal'
import { useTrades } from '@/hooks/useTrades'
import { useUiStore } from '@/store/useUiStore'
import { useFilterStore } from '@/store/useFilterStore'
import { Plus, FileSpreadsheet, Calendar as CalendarIcon } from 'lucide-react'

export default function CalendarPage() {
  const { setTradeSheetOpen } = useUiStore()
  const { accountId } = useFilterStore()
  const [csvModalOpen, setCsvModalOpen] = useState(false)

  const { data: trades = [], isLoading } = useTrades({ accountId })

  return (
    <AppShell>
      <div className="px-6 py-5 space-y-5 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-emerald-400" />
              <h1 className="text-xl font-semibold text-[#F4F4F5] tracking-tight">Trading Calendar</h1>
            </div>
            <p className="mt-0.5 text-sm text-[#A1A1AA]">
              Interactive calendar view of your daily P&L, trade frequency, and execution journal
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCsvModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.08] bg-[#141414] text-xs font-medium text-zinc-300 hover:text-white hover:border-white/[0.16] transition-colors"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
              <span>Import CSV</span>
            </button>
            <button
              onClick={() => setTradeSheetOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white hover:bg-zinc-200 text-black text-xs font-semibold shadow-sm active:scale-95 transition-all duration-150"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              <span>Log Trade</span>
            </button>
          </div>
        </div>

        {/* Calendar Heatmap Container */}
        {isLoading ? (
          <div className="h-96 rounded-2xl border border-white/[0.06] bg-[#141414] animate-pulse" />
        ) : (
          <CalendarHeatmap trades={trades} />
        )}
      </div>

      {/* CSV Import Modal */}
      <CsvImportModal isOpen={csvModalOpen} onClose={() => setCsvModalOpen(false)} />
    </AppShell>
  )
}
