import { useMemo } from 'react'
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
import { cn } from '@/lib/cn'
import type { Trade } from '@/types'

interface CalendarHeatmapProps {
  trades: Trade[]
}




function getColorForPnl(pnl: number, maxAbs: number): string {
  if (pnl === 0) return '#262626'
  const intensity = Math.min(Math.abs(pnl) / maxAbs, 1)
  if (pnl > 0) {
    const alpha = 0.25 + intensity * 0.75
    return `rgba(29, 185, 84, ${alpha})`
  }
  const alpha = 0.25 + intensity * 0.75
  return `rgba(239, 68, 68, ${alpha})`
}

function PlaybookTooltip({ active, payload }: {
  active?: boolean
  payload?: Array<{ payload: { name: string; pnl: number; winRate: number; trades: number } }>
}) {
  if (!active || !payload?.length) return null
  const d = payload[0].payload
  return (
    <div className="rounded-lg border border-border bg-elevated/95 backdrop-blur-sm px-3 py-2 shadow-xl">
      <p className="text-xs font-semibold text-[#F4F4F5] mb-1">{d.name}</p>
      <div className="space-y-0.5 text-[11px]">
        <p className={cn('font-mono tabular-nums', d.pnl >= 0 ? 'text-profit' : 'text-loss')}>
          {d.pnl >= 0 ? '+' : ''}${Math.abs(d.pnl).toFixed(2)}
        </p>
        <p className="text-[#A1A1AA]">{d.winRate.toFixed(0)}% win rate</p>
        <p className="text-[#525252]">{d.trades} trades</p>
      </div>
    </div>
  )
}

// ─── Calendar Heatmap ─────────────────────────────────────────────────────────

export function CalendarHeatmap({ trades }: CalendarHeatmapProps) {
  const dailyData = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number }>()

    trades
      .filter((t) => t.exit_at && t.pnl !== null)
      .forEach((t) => {
        const day = t.exit_at!.slice(0, 10)
        const existing = map.get(day) ?? { pnl: 0, count: 0 }
        map.set(day, { pnl: existing.pnl + (t.pnl ?? 0), count: existing.count + 1 })
      })

    return map
  }, [trades])

  // Build a 12-week grid (most recent trading days)
  const cells = useMemo(() => {
    const today = new Date()
    const result: Array<{ date: string; pnl: number; count: number; day: number }> = []
    for (let i = 83; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = d.toISOString().slice(0, 10)
      const entry = dailyData.get(key) ?? { pnl: 0, count: 0 }
      result.push({ date: key, pnl: entry.pnl, count: entry.count, day: d.getDay() })
    }
    return result
  }, [dailyData])

  const maxAbs = useMemo(() => Math.max(...cells.map((c) => Math.abs(c.pnl)), 1), [cells])

  // Group into weeks
  const weeks = useMemo(() => {
    const result: typeof cells[] = []
    let current: typeof cells = []
    cells.forEach((c, i) => {
      if (i === 0 && c.day !== 0) {
        // Pad start
        for (let p = 0; p < c.day; p++) current.push({ date: '', pnl: 0, count: -1, day: p })
      }
      current.push(c)
      if (current.length === 7) {
        result.push(current)
        current = []
      }
    })
    if (current.length > 0) result.push(current)
    return result
  }, [cells])

  const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  return (
    <div id="calendar-heatmap" className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-4 text-sm font-semibold text-[#F4F4F5]">Daily PnL Heatmap</h2>
      <div className="flex gap-1">
        {/* Day labels */}
        <div className="flex flex-col gap-1 pt-6">
          {DAY_LABELS.map((d, i) => (
            <div key={i} className="h-5 w-4 text-[9px] text-[#525252] flex items-center justify-center">
              {i % 2 === 1 ? d : ''}
            </div>
          ))}
        </div>
        {/* Weeks grid */}
        <div className="flex gap-1 overflow-x-auto">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1">
              {/* Month label on first day of month */}
              <div className="h-5 text-[9px] text-[#525252] flex items-end justify-center">
                {week[0]?.date?.slice(8, 10) === '01' ? week[0].date.slice(5, 7) : ''}
              </div>
              {week.map((cell, di) => (
                <div
                  key={di}
                  title={cell.count >= 0 ? `${cell.date}: ${cell.pnl >= 0 ? '+' : ''}$${cell.pnl.toFixed(2)} (${cell.count} trades)` : ''}
                  className="h-5 w-5 rounded-sm transition-all duration-150 hover:ring-1 hover:ring-white/20 cursor-default"
                  style={{
                    backgroundColor: cell.count < 0 ? 'transparent' : getColorForPnl(cell.pnl, maxAbs),
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[10px] text-[#525252]">
        <span>Loss</span>
        {[-1, -0.5, 0, 0.5, 1].map((v, i) => (
          <div
            key={i}
            className="h-3 w-3 rounded-sm"
            style={{ backgroundColor: getColorForPnl(v * 100, 100) }}
          />
        ))}
        <span>Profit</span>
      </div>
    </div>
  )
}

// ─── Setup Performance Chart ──────────────────────────────────────────────────

interface SetupData {
  name: string
  pnl: number
  winRate: number
  trades: number
}

interface SetupPerformanceChartProps {
  trades: Trade[]
}

export function SetupPerformanceChart({ trades }: SetupPerformanceChartProps) {
  const setupData = useMemo<SetupData[]>(() => {
    const map = new Map<string, { pnl: number; wins: number; total: number }>()

    trades
      .filter((t) => t.tags.length > 0 && t.pnl !== null)
      .forEach((t) => {
        const tag = t.tags[0] // primary tag as "setup"
        const existing = map.get(tag) ?? { pnl: 0, wins: 0, total: 0 }
        map.set(tag, {
          pnl: existing.pnl + (t.pnl ?? 0),
          wins: existing.wins + ((t.pnl ?? 0) > 0 ? 1 : 0),
          total: existing.total + 1,
        })
      })

    return Array.from(map.entries())
      .map(([name, { pnl, wins, total }]) => ({
        name,
        pnl: Math.round(pnl * 100) / 100,
        winRate: total > 0 ? (wins / total) * 100 : 0,
        trades: total,
      }))
      .sort((a, b) => b.pnl - a.pnl)
      .slice(0, 8)
  }, [trades])

  if (setupData.length === 0) {
    return (
      <div id="setup-performance-chart" className="rounded-xl border border-border bg-surface p-4">
        <h2 className="mb-4 text-sm font-semibold text-[#F4F4F5]">Setup Performance</h2>
        <div className="flex h-[160px] items-center justify-center text-[#525252] text-sm">
          Tag trades with playbooks to see breakdown
        </div>
      </div>
    )
  }

  return (
    <div id="setup-performance-chart" className="rounded-xl border border-border bg-surface p-4">
      <h2 className="mb-4 text-sm font-semibold text-[#F4F4F5]">Setup Performance</h2>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={setupData} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }}>
          <CartesianGrid horizontal={false} stroke="#262626" strokeDasharray="3 3" />
          <XAxis
            type="number"
            tick={{ fill: '#525252', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `$${v}`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: '#A1A1AA', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            width={80}
          />
          <Tooltip content={<PlaybookTooltip />} />
          <Bar dataKey="pnl" radius={[0, 4, 4, 0]} maxBarSize={16}>
            {setupData.map((entry, index) => (
              <Cell key={index} fill={entry.pnl >= 0 ? '#1DB954' : '#EF4444'} fillOpacity={0.85} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
