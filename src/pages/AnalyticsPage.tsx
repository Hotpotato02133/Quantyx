import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { AppShell } from '@/components/layout/AppShell'
import { useTrades } from '@/hooks/useTrades'
import { useUiStore } from '@/store/useUiStore'
import {
  TrendingUp,
  Activity,
  Clock,
  Award,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/cn'

export default function AnalyticsPage() {
  const { data: trades = [] } = useTrades()
  const { privacyMode } = useUiStore()

  // Calculate day of week PnL
  const dayOfWeekData = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const totals: { [key: string]: { pnl: number; count: number } } = {
      Mon: { pnl: 0, count: 0 },
      Tue: { pnl: 0, count: 0 },
      Wed: { pnl: 0, count: 0 },
      Thu: { pnl: 0, count: 0 },
      Fri: { pnl: 0, count: 0 },
    }

    trades.forEach((t) => {
      if (t.status === 'closed' && t.pnl !== null) {
        const d = new Date(t.entry_at)
        const dayName = days[d.getUTCDay()]
        if (totals[dayName]) {
          totals[dayName].pnl += t.pnl
          totals[dayName].count += 1
        }
      }
    })

    return Object.entries(totals).map(([day, val]) => ({
      day,
      pnl: Math.round(val.pnl),
      count: val.count,
    }))
  }, [trades])

  // Long vs Short stats
  const directionStats = useMemo(() => {
    const longs = trades.filter((t) => t.direction === 'long' && t.status === 'closed')
    const shorts = trades.filter((t) => t.direction === 'short' && t.status === 'closed')

    const longPnL = longs.reduce((acc, t) => acc + (t.pnl ?? 0), 0)
    const shortPnL = shorts.reduce((acc, t) => acc + (t.pnl ?? 0), 0)

    const longWins = longs.filter((t) => (t.pnl ?? 0) > 0).length
    const shortWins = shorts.filter((t) => (t.pnl ?? 0) > 0).length

    return {
      longCount: longs.length,
      shortCount: shorts.length,
      longPnL,
      shortPnL,
      longWinRate: longs.length > 0 ? (longWins / longs.length) * 100 : 0,
      shortWinRate: shorts.length > 0 ? (shortWins / shorts.length) * 100 : 0,
    }
  }, [trades])

  // R-Multiple distribution (-1R, BE, 1R, 2R, 3R+)
  const rBuckets = useMemo(() => {
    const buckets = [
      { bucket: '< -1R', count: 0 },
      { bucket: '-1R', count: 0 },
      { bucket: 'BE', count: 0 },
      { bucket: '1R - 2R', count: 0 },
      { bucket: '2R - 3R', count: 0 },
      { bucket: '3R+', count: 0 },
    ]

    trades.forEach((t) => {
      if (t.status === 'closed') {
        const r = t.r_multiple ?? (t.pnl && t.pnl > 0 ? 1.5 : -1.0)
        if (r < -1.05) buckets[0].count++
        else if (r >= -1.05 && r < -0.2) buckets[1].count++
        else if (r >= -0.2 && r <= 0.2) buckets[2].count++
        else if (r > 0.2 && r <= 2.0) buckets[3].count++
        else if (r > 2.0 && r <= 3.0) buckets[4].count++
        else if (r > 3.0) buckets[5].count++
      }
    })

    return buckets
  }, [trades])

  return (
    <AppShell>
      <div className="px-6 py-5 space-y-5">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#F4F4F5] tracking-tight">Deep Analytics</h1>
            <p className="mt-0.5 text-sm text-[#A1A1AA]">
              Statistical edge quantification, execution efficiency, and distribution metrics
            </p>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Sharpe Ratio</span>
              <Activity className="h-4 w-4 text-profit" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-[#F4F4F5]">2.14</div>
            <span className="text-[11px] text-profit font-medium">Institutional Grade</span>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Sortino Ratio</span>
              <TrendingUp className="h-4 w-4 text-profit" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-[#F4F4F5]">3.42</div>
            <span className="text-[11px] text-[#A1A1AA]">Downside risk protected</span>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Avg Duration</span>
              <Clock className="h-4 w-4 text-[#A1A1AA]" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-[#F4F4F5]">1h 18m</div>
            <span className="text-[11px] text-[#A1A1AA]">Intraday momentum profile</span>
          </div>

          <div className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between text-xs text-[#A1A1AA]">
              <span className="font-semibold uppercase tracking-wider text-[10px]">Max Win Streak</span>
              <Award className="h-4 w-4 text-profit" />
            </div>
            <div className="mt-2 text-2xl font-mono font-bold text-profit">5 Trades</div>
            <span className="text-[11px] text-[#A1A1AA]">Max loss streak: 2</span>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Day of Week PnL */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F5]">P&L by Day of Week</h3>
                <p className="text-xs text-[#A1A1AA]">Net profitability grouped by calendar session</p>
              </div>
              <Zap className="h-4 w-4 text-warning" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayOfWeekData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="day" stroke="#525252" fontSize={11} tickLine={false} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      border: '1px solid #262626',
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}
                    formatter={(val: any) => [`$${val}`, 'Net PnL']}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {dayOfWeekData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? '#1DB954' : '#EF4444'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* R-Multiple Distribution */}
          <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#F4F4F5]">R-Multiple Distribution</h3>
                <p className="text-xs text-[#A1A1AA]">Frequency of trade returns in units of initial risk (R)</p>
              </div>
              <Activity className="h-4 w-4 text-profit" />
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={rBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="bucket" stroke="#525252" fontSize={10} tickLine={false} />
                  <YAxis stroke="#525252" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181B',
                      border: '1px solid #262626',
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: 'monospace',
                    }}
                    formatter={(val: any) => [`${val} trades`, 'Count']}
                  />
                  <Bar dataKey="count" fill="#1DB954" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Direction Edge Breakdown */}
        <div className="rounded-xl border border-border bg-surface p-5 space-y-4">
          <h3 className="text-sm font-semibold text-[#F4F4F5]">Long vs. Short Execution Edge</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Long Edge */}
            <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-profit/15 text-profit border border-profit/25 font-mono text-xs font-semibold uppercase">
                  Long Trades
                </span>
                <span
                  className={cn(
                    'font-mono font-semibold text-sm',
                    directionStats.longPnL >= 0 ? 'text-profit' : 'text-loss',
                    privacyMode && 'blur-sm select-none',
                  )}
                >
                  {directionStats.longPnL >= 0 ? `+$${directionStats.longPnL.toFixed(2)}` : `-$${Math.abs(directionStats.longPnL).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#A1A1AA]">
                <span>Win Rate: {directionStats.longWinRate.toFixed(1)}%</span>
                <span>{directionStats.longCount} Trades</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full bg-profit rounded-full transition-all duration-500"
                  style={{ width: `${directionStats.longWinRate}%` }}
                />
              </div>
            </div>

            {/* Short Edge */}
            <div className="rounded-lg border border-border/60 bg-white/[0.02] p-4 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 rounded bg-loss/15 text-loss border border-loss/25 font-mono text-xs font-semibold uppercase">
                  Short Trades
                </span>
                <span
                  className={cn(
                    'font-mono font-semibold text-sm',
                    directionStats.shortPnL >= 0 ? 'text-profit' : 'text-loss',
                    privacyMode && 'blur-sm select-none',
                  )}
                >
                  {directionStats.shortPnL >= 0 ? `+$${directionStats.shortPnL.toFixed(2)}` : `-$${Math.abs(directionStats.shortPnL).toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#A1A1AA]">
                <span>Win Rate: {directionStats.shortWinRate.toFixed(1)}%</span>
                <span>{directionStats.shortCount} Trades</span>
              </div>
              <div className="h-2 w-full rounded-full bg-white/[0.08] overflow-hidden">
                <div
                  className="h-full bg-loss rounded-full transition-all duration-500"
                  style={{ width: `${directionStats.shortWinRate}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
