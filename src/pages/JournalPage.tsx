import { AppShell } from '@/components/layout/AppShell'
import { TradeDataGrid } from '@/components/trades/TradeDataGrid'
import { useTrades } from '@/hooks/useTrades'
import { useUiStore } from '@/store/useUiStore'
import { useFilterStore } from '@/store/useFilterStore'
import { Plus } from 'lucide-react'

export default function JournalPage() {
  const { setTradeSheetOpen } = useUiStore()
  const { direction, outcome, symbol } = useFilterStore()
  const { data: trades = [], isLoading } = useTrades({
    direction: direction !== 'all' ? direction : undefined,
    status: outcome !== 'all' ? (outcome === 'win' ? 'closed' : outcome === 'loss' ? 'closed' : undefined) : undefined,
    symbol: symbol || undefined,
  })

  return (
    <AppShell>
      <div className="px-6 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#F4F4F5] tracking-tight">Trade Journal</h1>
            <p className="mt-0.5 text-sm text-[#A1A1AA]">
              Your full trade history — sortable, filterable, searchable
            </p>
          </div>
          <button
            onClick={() => setTradeSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-profit text-[#0A0A0A] text-sm font-semibold hover:bg-profit/90 active:scale-95 transition-all duration-150"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            Log Trade
          </button>
        </div>

        {/* Data Grid */}
        <TradeDataGrid trades={trades} isLoading={isLoading} />
      </div>
    </AppShell>
  )
}
