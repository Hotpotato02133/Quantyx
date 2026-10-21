import { useMemo, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import {
  ChevronLeft,
  ChevronRight,
  Flame,
  Layers,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay } from 'date-fns'
import { getPlaybookByTag, getPlaybookById } from '@/lib/playbooks'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/store/useUiStore'
import type { Trade } from '@/types'

// ─── Color Helper for Calendar Intensity ─────────────────────────────────────

function getColorForPnl(pnl: number, maxAbs: number): string {
  if (pnl === 0) return 'rgba(255, 255, 255, 0.03)'
  const intensity = Math.min(Math.abs(pnl) / maxAbs, 1)
  if (pnl > 0) {
    const alpha = 0.25 + intensity * 0.75
    return `rgba(29, 185, 84, ${alpha.toFixed(2)})`
  }
  const alpha = 0.25 + intensity * 0.75
  return `rgba(239, 68, 68, ${alpha.toFixed(2)})`
}

// ─── Playbook Performance Bar Chart (Step 4.3) ───────────────────────────────

interface SetupData {
  id: string
  name: string
  pnl: number
  winRate: number
  trades: number
  color: string
}

function SetupTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: SetupData }>
}) {
  const { privacyMode } = useUiStore()
  if (!active || !payload?.length) return null
  const d = payload[0].payload

  return (
    <div className="rounded-lg border border-border bg-[#18181B]/95 backdrop-blur-md px-3.5 py-2.5 shadow-2xl min-w-[160px]">
      <div className="flex items-center gap-2 mb-1.5 pb-1 border-b border-border/50">
        <span className="h-2 w-2 rounded-full" style={{ backgroundColor: d.color }} />
        <p className="text-xs font-semibold text-[#F4F4F5] truncate">{d.name}</p>
      </div>

      <div className="space-y-1 text-[11px]">
        <div className="flex justify-between items-center">
          <span className="text-[#A1A1AA]">Net PnL:</span>
          <span
            className={cn(
              'font-mono font-semibold tabular-nums',
              d.pnl >= 0 ? 'text-profit' : 'text-loss',
              privacyMode && 'blur-sm select-none',
            )}
          >
            {d.pnl >= 0 ? '+' : ''}${d.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#A1A1AA]">Win Rate:</span>
          <span className="font-mono text-[#F4F4F5]">{d.winRate.toFixed(1)}%</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-[#A1A1AA]">Total Executions:</span>
          <span className="font-mono text-[#F4F4F5]">{d.trades}</span>
        </div>
      </div>
    </div>
  )
}

interface SetupPerformanceChartProps {
  trades: Trade[]
}

export function SetupPerformanceChart({ trades }: SetupPerformanceChartProps) {
  const setupData = useMemo<SetupData[]>(() => {
    const map = new Map<string, { pnl: number; wins: number; total: number; color: string; name: string }>()

    trades
      .filter((t) => t.status === 'closed' && t.pnl !== null)
      .forEach((t) => {
        // Resolve playbook by playbook_id or tags
        const pb = getPlaybookById(t.playbook_id) || (t.tags.length > 0 ? getPlaybookByTag(t.tags[0]) : undefined)
        const id = pb?.id || (t.tags.length > 0 ? t.tags[0] : 'Uncategorized')
        const name = pb?.name || (t.tags.length > 0 ? t.tags[0] : 'Uncategorized')
        const color = pb?.color || '#A1A1AA'

        const existing = map.get(id) ?? { pnl: 0, wins: 0, total: 0, color, name }
        map.set(id, {
          pnl: existing.pnl + (t.pnl ?? 0),
          wins: existing.wins + ((t.pnl ?? 0) > 0 ? 1 : 0),
          total: existing.total + 1,
          color,
          name,
        })
      })

    return Array.from(map.entries())
      .map(([id, { pnl, wins, total, color, name }]) => ({
        id,
        name,
        color,
        pnl: Math.round(pnl * 100) / 100,
        winRate: total > 0 ? Math.round((wins / total) * 1000) / 10 : 0,
        trades: total,
      }))
      .sort((a, b) => b.pnl - a.pnl)
  }, [trades])

  if (setupData.length === 0) {
    return (
      <div id="setup-performance-chart" className="rounded-xl border border-border bg-surface p-4 shadow-xl">
        <h2 className="mb-2 text-sm font-semibold text-[#F4F4F5]">Setup & Playbook Edge</h2>
        <div className="flex h-[220px] flex-col items-center justify-center text-[#71717A] text-center">
          <Layers className="h-8 w-8 mb-2 opacity-30" />
          <p className="text-xs">No tagged executions yet</p>
          <p className="text-[11px] text-[#525252] mt-0.5">
            Assign Playbooks in the Trade Grid to view comparative strategy metrics
          </p>
        </div>
      </div>
    )
  }

  return (
    <div id="setup-performance-chart" className="rounded-xl border border-border bg-surface p-4 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-border/50">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F4F5] tracking-tight">Setup Performance</h2>
          <p className="text-xs text-[#A1A1AA]">Comparative net PnL and win rate across Playbooks</p>
        </div>
        <span className="rounded bg-white/[0.05] px-2 py-0.5 font-mono text-[11px] text-[#A1A1AA] border border-border">
          {setupData.length} Playbooks
        </span>
      </div>

      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart
            data={setupData}
            layout="vertical"
            margin={{ left: 10, right: 30, top: 5, bottom: 5 }}
          >
            <CartesianGrid horizontal={false} stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
            <XAxis
              type="number"
              tick={{ fill: '#71717A', fontSize: 10, fontFamily: 'monospace' }}
              axisLine={{ stroke: '#262626' }}
              tickLine={false}
              tickFormatter={(v) => `$${v}`}
            />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fill: '#D4D4D8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={130}
            />
            <Tooltip content={<SetupTooltip />} />
            <Bar dataKey="pnl" radius={[0, 4, 4, 0]} maxBarSize={18}>
              {setupData.map((entry, index) => (
                <Cell
                  key={index}
                  fill={entry.pnl >= 0 ? '#1DB954' : '#EF4444'}
                  fillOpacity={0.85}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Monthly Calendar Heatmap (Step 4.3) ──────────────────────────────────────

interface CalendarHeatmapProps {
  trades: Trade[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarHeatmap({ trades }: CalendarHeatmapProps) {
  const { privacyMode } = useUiStore()

  // Determine current month focus (defaults to month of most recent trade or current date)
  const [currentMonth, setCurrentMonth] = useState<Date>(() => {
    const closed = trades.filter((t) => t.exit_at && t.pnl !== null)
    if (closed.length > 0) {
      const mostRecent = [...closed].sort(
        (a, b) => new Date(b.exit_at!).getTime() - new Date(a.exit_at!).getTime(),
      )[0]
      return new Date(mostRecent.exit_at!)
    }
    return new Date()
  })

  // Aggregate daily trade PnL and count
  const dailyData = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number; wins: number }>()

    trades
      .filter((t) => t.status === 'closed' && t.exit_at && t.pnl !== null)
      .forEach((t) => {
        const dayKey = t.exit_at!.slice(0, 10)
        const existing = map.get(dayKey) ?? { pnl: 0, count: 0, wins: 0 }
        map.set(dayKey, {
          pnl: existing.pnl + (t.pnl ?? 0),
          count: existing.count + 1,
          wins: existing.wins + ((t.pnl ?? 0) > 0 ? 1 : 0),
        })
      })

    return map
  }, [trades])

  // Month days interval
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Max absolute PnL for color intensity normalization
  const maxAbs = useMemo(() => {
    let max = 1
    dailyData.forEach((val) => {
      if (Math.abs(val.pnl) > max) max = Math.abs(val.pnl)
    })
    return max
  }, [dailyData])

  // Month navigation
  const handlePrevMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1))
  }

  // Monthly totals
  const monthlySummary = useMemo(() => {
    let totalPnl = 0
    let totalTrades = 0
    let greenDays = 0
    let redDays = 0

    daysInMonth.forEach((d) => {
      const key = d.toISOString().slice(0, 10)
      const data = dailyData.get(key)
      if (data && data.count > 0) {
        totalPnl += data.pnl
        totalTrades += data.count
        if (data.pnl > 0) greenDays++
        else if (data.pnl < 0) redDays++
      }
    })

    return { totalPnl, totalTrades, greenDays, redDays }
  }, [daysInMonth, dailyData])

  // Leading empty slots for starting day of week
  const startDayOfWeek = getDay(monthStart)

  return (
    <div id="calendar-heatmap" className="rounded-xl border border-border bg-surface p-4 shadow-xl">
      {/* Header with Month Navigation & Monthly PnL */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-3 border-b border-border/50">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevMonth}
            className="p-1 rounded hover:bg-white/[0.08] text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <h2 className="text-sm font-semibold text-[#F4F4F5] tracking-tight">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>

          <button
            type="button"
            onClick={handleNextMonth}
            className="p-1 rounded hover:bg-white/[0.08] text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        {/* Month Summary Badge */}
        <div className="flex items-center gap-3 text-xs">
          <span className="text-[#A1A1AA]">
            {monthlySummary.greenDays}G / {monthlySummary.redDays}R days
          </span>
          <span
            className={cn(
              'font-mono font-bold tabular-nums',
              monthlySummary.totalPnl >= 0 ? 'text-profit' : 'text-loss',
              privacyMode && 'blur-sm select-none',
            )}
          >
            {monthlySummary.totalPnl >= 0 ? '+' : ''}$
            {monthlySummary.totalPnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold text-[#71717A] mb-1">
        {WEEKDAYS.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Leading empty days */}
        {Array.from({ length: startDayOfWeek }).map((_, i) => (
          <div key={`empty-${i}`} className="h-14 rounded-md bg-transparent" />
        ))}

        {/* Days of month */}
        {daysInMonth.map((day) => {
          const key = day.toISOString().slice(0, 10)
          const entry = dailyData.get(key)
          const hasTrades = entry && entry.count > 0
          const pnl = entry?.pnl ?? 0
          const count = entry?.count ?? 0
          const isPos = pnl >= 0

          return (
            <div
              key={key}
              title={
                hasTrades
                  ? `${key}: ${isPos ? '+' : ''}$${pnl.toFixed(2)} (${count} trades)`
                  : key
              }
              className={cn(
                'group relative h-14 rounded-md border p-1.5 flex flex-col justify-between transition-all duration-150',
                hasTrades
                  ? 'border-white/[0.08] hover:border-white/30 cursor-pointer hover:scale-[1.02]'
                  : 'border-border/30 bg-[#161618]',
              )}
              style={
                hasTrades
                  ? { backgroundColor: getColorForPnl(pnl, maxAbs) }
                  : undefined
              }
            >
              <div className="flex items-center justify-between text-[10px]">
                <span className={hasTrades ? 'text-white font-medium' : 'text-[#525252]'}>
                  {format(day, 'd')}
                </span>
                {hasTrades && (
                  <span className="text-[9px] font-mono text-white/70">
                    {count}t
                  </span>
                )}
              </div>

              {hasTrades && (
                <div
                  className={cn(
                    'font-mono text-[10px] font-bold tabular-nums text-right',
                    isPos ? 'text-white' : 'text-white',
                    privacyMode && 'blur-sm select-none',
                  )}
                >
                  {isPos ? '+' : ''}${Math.round(pnl).toLocaleString()}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="mt-3 flex items-center justify-between text-[10px] text-[#71717A] pt-2 border-t border-border/40">
        <span className="flex items-center gap-1">
          <Flame className="h-3 w-3 text-profit" />
          <span>Profit / Loss Day Color Scaling</span>
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-loss">-$Loss</span>
          {[-1, -0.5, 0, 0.5, 1].map((scale, i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-sm border border-white/10"
              style={{ backgroundColor: getColorForPnl(scale * 100, 100) }}
            />
          ))}
          <span className="text-profit">+$Profit</span>
        </div>
      </div>
    </div>
  )
}
