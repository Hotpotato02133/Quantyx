import { useState, useMemo } from 'react'
import { Plus, RefreshCw } from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { KpiBentoGrid } from '@/components/dashboard/KpiBentoGrid'
import { EquityCurveChart } from '@/components/dashboard/EquityCurveChart'
import { CalendarHeatmap, SetupPerformanceChart } from '@/components/dashboard/DashboardCharts'
import { useTrades } from '@/hooks/useTrades'
import { useUiStore } from '@/store/useUiStore'
import { useFilterStore } from '@/store/useFilterStore'
import {
  calcWinRate,
  calcProfitFactor,
  calcExpectancy,
  calcMaxDrawdown,
} from '@/lib/math'
import type { TradeStats } from '@/types'

type EquityViewMode = 'pnl' | 'balance' | 'r-multiple'

export default function DashboardPage() {
  const { setTradeSheetOpen } = useUiStore()
  const { accountId } = useFilterStore()
  const { data: trades = [], isLoading, refetch, isFetching } = useTrades({ accountId })
  const [equityView, setEquityView] = useState<EquityViewMode>('pnl')

  const stats = useMemo<TradeStats>(() => {
    const closed = trades.filter((t) => t.status === 'closed' && t.pnl !== null)
    const pnls = closed.map((t) => t.pnl!)
    const rMultiples = closed.map((t) => t.r_multiple).filter((r): r is number => r !== null)
    const totalPnL = pnls.reduce((sum, p) => sum + p, 0)

    // Build equity curve from cumulative PnL
    let running = 0
    const curve = closed
      .sort((a, b) => new Date(a.exit_at!).getTime() - new Date(b.exit_at!).getTime())
      .map((t) => { running += t.pnl!; return running })

    const wins = pnls.filter((p) => p > 0)
    const losses = pnls.filter((p) => p < 0)
    const { maxDrawdown, maxDrawdownPct } = calcMaxDrawdown(curve)

    return {
      totalTrades: closed.length,
      winRate: calcWinRate(pnls),
      profitFactor: calcProfitFactor(pnls),
      expectancy: calcExpectancy(pnls),
      totalPnL,
      maxDrawdown,
      maxDrawdownPct,
      avgWin: wins.length > 0 ? wins.reduce((s, p) => s + p, 0) / wins.length : 0,
      avgLoss: losses.length > 0 ? Math.abs(losses.reduce((s, p) => s + p, 0) / losses.length) : 0,
      bestTrade: pnls.length > 0 ? Math.max(...pnls) : 0,
      worstTrade: pnls.length > 0 ? Math.min(...pnls) : 0,
      avgRMultiple: rMultiples.length > 0 ? rMultiples.reduce((s, r) => s + r, 0) / rMultiples.length : null,
    }
  }, [trades])

  return (
    <AppShell>
      <div className="px-6 py-5 space-y-5">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#F4F4F5] tracking-tight">Dashboard</h1>
            <p className="mt-0.5 text-sm text-[#A1A1AA]">Performance analytics overview</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh data"
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#F4F4F5] transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            </button>
            <button
              onClick={() => setTradeSheetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-profit text-[#0A0A0A] text-sm font-semibold hover:bg-profit/90 active:scale-95 transition-all duration-150"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              New Trade
            </button>
          </div>
        </div>

        {/* KPI Bento Grid */}
        <KpiBentoGrid stats={stats} isLoading={isLoading} />

        {/* Equity Curve */}
        <EquityCurveChart
          trades={trades}
          viewMode={equityView}
          onViewModeChange={setEquityView}
        />

        {/* Bottom charts */}
        <div className="grid grid-cols-2 gap-4">
          <CalendarHeatmap trades={trades} />
          <SetupPerformanceChart trades={trades} />
        </div>
      </div>
    </AppShell>
  )
}
