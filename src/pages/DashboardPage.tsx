import { useState, useMemo } from 'react'
import {
  RefreshCw,
  Target,
  ShieldCheck,
  Eye,
  EyeOff,
  Plus,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { KpiBentoGrid } from '@/components/dashboard/KpiBentoGrid'
import { EquityCurveChart } from '@/components/dashboard/EquityCurveChart'
import {
  TradeExecutionSetupsCard,
  PlanComplianceChart,
  CalendarHeatmap,
} from '@/components/dashboard/DashboardCharts'
import { RecentTradesWidget } from '@/components/dashboard/RecentTradesWidget'
import { UserAvatar } from '@/components/layout/Topbar'
import { useTrades } from '@/hooks/useTrades'
import { useAccounts } from '@/hooks/useAccounts'
import { useUiStore } from '@/store/useUiStore'
import { useFilterStore } from '@/store/useFilterStore'
import { calculatePortfolioMetrics, round } from '@/lib/math'
import { cn } from '@/lib/cn'
import type { TradeStats } from '@/types'

type EquityViewMode = 'pnl' | 'balance' | 'r-multiple'
type TimeHorizon = '7D' | '30D' | 'MTD' | 'YTD' | 'ALL'

export default function DashboardPage() {
  const { privacyMode, togglePrivacyMode, setTradeSheetOpen } = useUiStore()
  const { accountId } = useFilterStore()
  const { currentAccount } = useAccounts()

  // Dynamically resolve account starting equity and risk limit
  const initialBalance = currentAccount.initial_balance || 10000
  const maxDailyDrawdownPct = currentAccount.max_daily_drawdown_pct || 5.0

  const { data: trades = [], isLoading, refetch, isFetching } = useTrades({ accountId })
  const [equityView, setEquityView] = useState<EquityViewMode>('pnl')
  const [timeHorizon, setTimeHorizon] = useState<TimeHorizon>('ALL')

  // Filter trades based on selected Time Horizon
  const filteredTrades = useMemo(() => {
    if (timeHorizon === 'ALL' || trades.length === 0) return trades

    const timestamps = trades.map((t) => new Date(t.entry_at).getTime())
    const baseTime = Math.max(...timestamps)
    const baseDate = new Date(baseTime)

    return trades.filter((t) => {
      const tradeDate = new Date(t.entry_at)
      if (timeHorizon === '7D') {
        const cutoff = new Date(baseTime - 7 * 24 * 60 * 60 * 1000)
        return tradeDate >= cutoff
      }
      if (timeHorizon === '30D') {
        const cutoff = new Date(baseTime - 30 * 24 * 60 * 60 * 1000)
        return tradeDate >= cutoff
      }
      if (timeHorizon === 'MTD') {
        return (
          tradeDate.getFullYear() === baseDate.getFullYear() &&
          tradeDate.getMonth() === baseDate.getMonth()
        )
      }
      if (timeHorizon === 'YTD') {
        return tradeDate.getFullYear() === baseDate.getFullYear()
      }
      return true
    })
  }, [trades, timeHorizon])

  // Recalculate portfolio metrics using filtered time horizon and dynamic account balance
  const stats = useMemo<TradeStats>(() => {
    const metrics = calculatePortfolioMetrics(filteredTrades, initialBalance)
    const pnlPct = round((metrics.totalPnL / initialBalance) * 100, 2)
    const rExpectancy =
      metrics.avgRMultiple !== null
        ? round(metrics.avgRMultiple * (metrics.winRate / 100), 2)
        : null

    const sparklineData =
      metrics.cumulativeEquity.length > 1
        ? metrics.cumulativeEquity
        : [initialBalance, initialBalance]

    return {
      totalTrades: metrics.totalTrades,
      winsCount: metrics.winsCount,
      lossesCount: metrics.lossesCount,
      breakevenCount: metrics.breakevenCount,
      winRate: metrics.winRate,
      profitFactor: metrics.profitFactor,
      expectancy: metrics.expectancy,
      rExpectancy,
      totalPnL: metrics.totalPnL,
      pnlPct,
      maxDrawdown: metrics.maxDrawdown,
      maxDrawdownPct: metrics.maxDrawdownPct,
      currentDrawdownPct: metrics.maxDrawdownPct,
      maxDailyDrawdownPct,
      avgWin: metrics.avgWin,
      avgLoss: metrics.avgLoss,
      bestTrade: metrics.bestTrade,
      worstTrade: metrics.worstTrade,
      avgRMultiple: metrics.avgRMultiple,
      sparklineData,
    }
  }, [filteredTrades, initialBalance, maxDailyDrawdownPct])

  // Prop Firm Challenge Tracker (e.g. Apex 50k Target: $3,000 / 6%)
  const isChallengeAccount = useMemo(() => {
    const name = currentAccount.name.toLowerCase()
    return name.includes('apex') || name.includes('funded') || name.includes('topstep') || name.includes('challenge')
  }, [currentAccount.name])

  const challengeTarget = useMemo(() => {
    if (initialBalance >= 100000) return 6000
    if (initialBalance >= 50000) return 3000
    return Math.round(initialBalance * 0.06)
  }, [initialBalance])

  const challengeProgressPct = useMemo(() => {
    if (challengeTarget <= 0) return 0
    return Math.min(100, Math.max(0, round((stats.totalPnL / challengeTarget) * 100, 1)))
  }, [stats.totalPnL, challengeTarget])

  const maxAllowedLoss = round((initialBalance * maxDailyDrawdownPct) / 100, 2)
  const remainingLossBuffer = Math.max(0, round(maxAllowedLoss - stats.maxDrawdown, 2))

  return (
    <AppShell showTopbar={false}>
      <div className="flex-1 overflow-y-auto bg-[#0A0A0A] px-8 py-6 space-y-5 select-none">
        {/* ─── Header Row (Matching Reference Clean Layout) ────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-white tracking-tight">Dashboard</h1>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Time Horizon Segmented Filter */}
            <div className="flex items-center rounded-xl border border-white/[0.06] bg-[#141414] p-1 text-xs">
              {(['7D', '30D', 'MTD', 'YTD', 'ALL'] as const).map((horizon) => (
                <button
                  key={horizon}
                  type="button"
                  onClick={() => setTimeHorizon(horizon)}
                  className={cn(
                    'px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150',
                    timeHorizon === horizon
                      ? 'bg-[#222222] text-white font-semibold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300',
                  )}
                >
                  {horizon === 'ALL' ? 'All Time' : horizon}
                </button>
              ))}
            </div>

            {/* Privacy Mode Toggle */}
            <button
              onClick={togglePrivacyMode}
              aria-label={privacyMode ? 'Disable privacy mode' : 'Enable privacy mode'}
              className={cn(
                'flex h-8 items-center gap-1.5 px-2.5 rounded-xl border transition-colors text-xs',
                privacyMode
                  ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                  : 'border-white/[0.06] bg-[#141414] text-zinc-400 hover:text-white hover:border-white/[0.12]',
              )}
              title={privacyMode ? 'Privacy Mode Active (Cmd+B)' : 'Enable Privacy Mode (Cmd+B)'}
            >
              {privacyMode ? (
                <EyeOff className="h-3.5 w-3.5" strokeWidth={1.75} />
              ) : (
                <Eye className="h-3.5 w-3.5" strokeWidth={1.75} />
              )}
              <span className="hidden md:inline font-mono text-[10px] text-zinc-500">⌘B</span>
            </button>

            {/* Refresh Data CTA */}
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              aria-label="Refresh data"
              title="Refresh live metrics"
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] bg-[#141414] text-zinc-400 hover:bg-white/[0.06] hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} strokeWidth={1.75} />
            </button>

            {/* + Log Trade CTA */}
            <button
              id="dashboard-new-trade"
              type="button"
              onClick={() => setTradeSheetOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 active:scale-95 transition-all shadow-sm"
              aria-label="Log new trade (Ctrl+N)"
            >
              <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
              <span>Log Trade</span>
            </button>

            {/* User Profile */}
            <div className="pl-1 border-l border-white/[0.08]">
              <UserAvatar />
            </div>
          </div>
        </div>

        {/* ─── Prop Firm Target & Risk Safety Banner (when challenge account) ─ */}
        {isChallengeAccount && (
          <div className="rounded-2xl border border-emerald-500/20 bg-[#141414] p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-white font-mono">
                    Funded Account Target Progress
                  </h3>
                  <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-full">
                    {challengeProgressPct}% Completed
                  </span>
                </div>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Target: <span className="font-mono text-white font-semibold">${challengeTarget.toLocaleString()}</span> • Profit:{' '}
                  <span
                    className={cn(
                      'font-mono font-semibold',
                      stats.totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400',
                      privacyMode && 'blur-sm select-none',
                    )}
                  >
                    {stats.totalPnL >= 0 ? '+' : '-'}${Math.abs(stats.totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </p>
              </div>
            </div>

            {/* Progress Bar & Safe Buffer */}
            <div className="w-full sm:w-72 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono">
                <span className="text-zinc-400 flex items-center gap-1">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                  Buffer to Max Loss:
                </span>
                <span className="text-white font-bold">
                  ${remainingLossBuffer.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-[#1e1e1e] overflow-hidden border border-white/[0.06]">
                <div
                  className="h-full rounded-full bg-emerald-400 transition-all duration-700"
                  style={{ width: `${challengeProgressPct}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* ─── Row 1: 3-Column KPI Bento Grid ───────────────────────────────── */}
        <KpiBentoGrid stats={stats} isLoading={isLoading} />

        {/* ─── Row 2: Hero Monochrome Area Chart (Revenue over time) ────────── */}
        <EquityCurveChart
          trades={filteredTrades}
          initialBalance={initialBalance}
          viewMode={equityView}
          onViewModeChange={setEquityView}
        />

        {/* ─── Row 3: Bottom Split Analytics Row (7 cols + 5 cols) ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7">
            <TradeExecutionSetupsCard trades={filteredTrades} />
          </div>
          <div className="lg:col-span-5">
            <PlanComplianceChart trades={filteredTrades} />
          </div>
        </div>

        {/* ─── Row 4: Recent Executions & Monthly Calendar Heatmap ──────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-1">
          <RecentTradesWidget trades={filteredTrades} limit={5} />
          <CalendarHeatmap trades={trades} />
        </div>
      </div>
    </AppShell>
  )
}
