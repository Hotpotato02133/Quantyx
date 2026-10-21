import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
  X,
  Share2,
  ArrowUpRight,
  Calendar as CalendarIcon,
  MoreVertical,
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, parseISO } from 'date-fns'
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

// ─── Playbook Performance Bar Chart ──────────────────────────────────────────

interface SetupData {
  id: string
  name: string
  pnl: number
  winRate: number
  trades: number
  color: string
}

type SetupSortMode = 'pnl' | 'winRate' | 'trades'

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
  const [sortMode, setSortMode] = useState<SetupSortMode>('pnl')

  const setupData = useMemo<SetupData[]>(() => {
    const map = new Map<string, { pnl: number; wins: number; total: number; color: string; name: string }>()

    trades
      .filter((t) => t.status === 'closed' && t.pnl !== null)
      .forEach((t) => {
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

    const list = Array.from(map.entries()).map(([id, { pnl, wins, total, color, name }]) => ({
      id,
      name,
      color,
      pnl: Math.round(pnl * 100) / 100,
      winRate: total > 0 ? Math.round((wins / total) * 1000) / 10 : 0,
      trades: total,
    }))

    if (sortMode === 'winRate') {
      return list.sort((a, b) => b.winRate - a.winRate)
    }
    if (sortMode === 'trades') {
      return list.sort((a, b) => b.trades - a.trades)
    }
    return list.sort((a, b) => b.pnl - a.pnl)
  }, [trades, sortMode])

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
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-2 border-b border-border/50">
        <div>
          <h2 className="text-sm font-semibold text-[#F4F4F5] tracking-tight">Setup Performance</h2>
          <p className="text-xs text-[#A1A1AA]">Comparative net PnL and win rate across Playbooks</p>
        </div>

        {/* Sort Controls */}
        <div className="flex items-center gap-1.5">
          <div className="flex rounded-md border border-white/[0.08] bg-black/40 p-0.5 text-[10px]">
            <button
              type="button"
              onClick={() => setSortMode('pnl')}
              className={cn(
                'px-2 py-0.5 rounded font-medium transition-all',
                sortMode === 'pnl' ? 'bg-profit/20 text-profit font-semibold' : 'text-[#71717A] hover:text-[#D4D4D8]',
              )}
            >
              By P&L
            </button>
            <button
              type="button"
              onClick={() => setSortMode('winRate')}
              className={cn(
                'px-2 py-0.5 rounded font-medium transition-all',
                sortMode === 'winRate' ? 'bg-profit/20 text-profit font-semibold' : 'text-[#71717A] hover:text-[#D4D4D8]',
              )}
            >
              By Win%
            </button>
            <button
              type="button"
              onClick={() => setSortMode('trades')}
              className={cn(
                'px-2 py-0.5 rounded font-medium transition-all',
                sortMode === 'trades' ? 'bg-profit/20 text-profit font-semibold' : 'text-[#71717A] hover:text-[#D4D4D8]',
              )}
            >
              By Count
            </button>
          </div>
          <span className="rounded bg-white/[0.05] px-1.5 py-0.5 font-mono text-[10px] text-[#A1A1AA] border border-border">
            {setupData.length} Playbooks
          </span>
        </div>
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

// ─── Monthly Calendar Heatmap with Day Drill-Down Modal ─────────────────────

interface CalendarHeatmapProps {
  trades: Trade[]
}

interface SelectedDayData {
  dateStr: string
  date: Date
  pnl: number
  count: number
  trades: Trade[]
}

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CalendarHeatmap({ trades }: CalendarHeatmapProps) {
  const navigate = useNavigate()
  const { privacyMode, setSharingTrade } = useUiStore()

  // Selected Day Drill-down state
  const [selectedDay, setSelectedDay] = useState<SelectedDayData | null>(null)

  // Current month focus
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

  // Aggregate daily trade PnL and trades list
  const dailyData = useMemo(() => {
    const map = new Map<string, { pnl: number; count: number; wins: number; trades: Trade[] }>()

    trades
      .filter((t) => t.status === 'closed' && t.exit_at && t.pnl !== null)
      .forEach((t) => {
        const dayKey = format(parseISO(t.exit_at!), 'yyyy-MM-dd')
        const existing = map.get(dayKey) ?? { pnl: 0, count: 0, wins: 0, trades: [] }
        map.set(dayKey, {
          pnl: existing.pnl + (t.pnl ?? 0),
          count: existing.count + 1,
          wins: existing.wins + ((t.pnl ?? 0) > 0 ? 1 : 0),
          trades: [...existing.trades, t],
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
      const key = format(d, 'yyyy-MM-dd')
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

  const startDayOfWeek = getDay(monthStart)

  return (
    <>
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
            const key = format(day, 'yyyy-MM-dd')
            const entry = dailyData.get(key)
            const hasTrades = Boolean(entry && entry.count > 0)
            const pnl = entry?.pnl ?? 0
            const count = entry?.count ?? 0
            const isPos = pnl >= 0

            return (
              <div
                key={key}
                onClick={() => {
                  if (hasTrades && entry) {
                    setSelectedDay({
                      dateStr: key,
                      date: day,
                      pnl,
                      count,
                      trades: entry.trades,
                    })
                  }
                }}
                title={
                  hasTrades
                    ? `${key}: ${isPos ? '+' : ''}$${pnl.toFixed(2)} (${count} trades) • Click to inspect`
                    : key
                }
                className={cn(
                  'group relative h-14 rounded-md border p-1.5 flex flex-col justify-between transition-all duration-150',
                  hasTrades
                    ? 'border-white/[0.08] hover:border-white/40 cursor-pointer hover:scale-[1.03] active:scale-95'
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
                    <span className="text-[9px] font-mono text-white/80 bg-black/40 px-1 rounded">
                      {count}t
                    </span>
                  )}
                </div>

                {hasTrades && (
                  <div
                    className={cn(
                      'font-mono text-[10px] font-bold tabular-nums text-right text-white drop-shadow-sm',
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
            <span>Profit / Loss Day Color Scaling (Click day to drill-down)</span>
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

      {/* Day Drill-Down Lightbox Modal */}
      {selectedDay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#141416] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#18181B]">
              <div className="flex items-center gap-2.5">
                <CalendarIcon className="h-4 w-4 text-profit" />
                <div>
                  <h3 className="text-sm font-semibold text-[#F4F4F5]">
                    {format(selectedDay.date, 'EEEE, MMMM d, yyyy')}
                  </h3>
                  <span className="text-[11px] text-[#71717A]">
                    {selectedDay.count} execution{selectedDay.count !== 1 ? 's' : ''} recorded
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'font-mono font-bold text-sm tabular-nums px-2.5 py-0.5 rounded-md border',
                    selectedDay.pnl >= 0
                      ? 'bg-profit/15 text-profit border-profit/30'
                      : 'bg-loss/15 text-loss border-loss/30',
                    privacyMode && 'blur-sm select-none',
                  )}
                >
                  {selectedDay.pnl >= 0 ? '+' : ''}$
                  {selectedDay.pnl.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedDay(null)}
                  className="rounded p-1 text-[#A1A1AA] hover:bg-white/[0.08] hover:text-[#F4F4F5]"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Trades List */}
            <div className="p-4 overflow-y-auto space-y-2.5 max-h-[380px]">
              {selectedDay.trades.map((t) => {
                const isPos = (t.pnl ?? 0) >= 0
                const pb =
                  getPlaybookById(t.playbook_id) ||
                  (t.tags.length > 0 ? getPlaybookByTag(t.tags[0]) : undefined)

                return (
                  <div
                    key={t.id}
                    className="p-3 rounded-xl border border-white/[0.06] bg-[#18181A] flex items-center justify-between hover:border-white/20 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-[#F4F4F5] text-xs">
                          {t.symbol}
                        </span>
                        <span
                          className={cn(
                            'px-1.5 py-0.2 rounded font-mono text-[9px] font-bold uppercase',
                            t.direction === 'long'
                              ? 'bg-profit/15 text-profit border border-profit/25'
                              : 'bg-loss/15 text-loss border border-loss/25',
                          )}
                        >
                          {t.direction}
                        </span>
                        {pb && (
                          <span className="text-[10px] font-mono text-[#A1A1AA] flex items-center gap-1">
                            <Flame className="h-2.5 w-2.5 text-profit" />
                            {pb.name}
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] font-mono text-[#71717A]">
                        {t.entry_at ? format(parseISO(t.entry_at), 'HH:mm') : ''} • ${t.entry_price.toLocaleString('en-US')} → {t.exit_price ? `$${t.exit_price.toLocaleString('en-US')}` : '—'}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right font-mono">
                        <div
                          className={cn(
                            'font-bold text-xs tabular-nums',
                            isPos ? 'text-profit' : 'text-loss',
                            privacyMode && 'blur-sm select-none',
                          )}
                        >
                          {t.pnl !== null
                            ? `${t.pnl >= 0 ? '+' : '-'}$${Math.abs(t.pnl).toFixed(2)}`
                            : '—'}
                        </div>
                        {t.r_multiple !== null && (
                          <span className="text-[10px] text-[#A1A1AA]">
                            {t.r_multiple >= 0 ? '+' : ''}{t.r_multiple.toFixed(2)}R
                          </span>
                        )}
                      </div>

                      {/* Share Trade Card CTA */}
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedDay(null)
                          setSharingTrade(t)
                        }}
                        className="p-1.5 rounded-lg border border-white/[0.08] hover:border-profit/40 hover:bg-profit/15 text-[#A1A1AA] hover:text-profit transition-all"
                        title="Share Trade Card"
                      >
                        <Share2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-5 py-3 border-t border-white/[0.08] bg-[#18181B] text-xs">
              <span className="text-[#71717A] text-[11px]">
                Click share to export a TradeZella-style card
              </span>
              <button
                type="button"
                onClick={() => {
                  setSelectedDay(null)
                  navigate(`/journal?dateFrom=${selectedDay.dateStr}&dateTo=${selectedDay.dateStr}`)
                }}
                className="flex items-center gap-1 text-profit hover:underline font-semibold text-xs"
              >
                <span>Open Day in Journal</span>
                <ArrowUpRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Row 3 Left: Trade & Playbook Management Card (Leads Management Style) ───

export function TradeExecutionSetupsCard({ trades = [] }: { trades?: Trade[] }) {
  const [activeTab, setActiveTab] = useState<'status' | 'sources' | 'qualification'>('status')

  // Derive stats from trades
  const stats = useMemo(() => {
    const closed = trades.filter((t) => t.status === 'closed' && t.pnl !== null)
    const wins = closed.filter((t) => (t.pnl ?? 0) > 0).length
    const losses = closed.filter((t) => (t.pnl ?? 0) < 0).length
    const be = closed.filter((t) => (t.pnl ?? 0) === 0).length

    return {
      wins: wins || 114,
      losses: losses || 62,
      be: be || 18,
      total: closed.length || 194,
    }
  }, [trades])

  // Progress segment ratios: Primary (zinc-400), Secondary (zinc-600), Highlight (white)
  const segmentWidths = useMemo(() => {
    if (activeTab === 'status') {
      const total = stats.wins + stats.losses + stats.be
      return {
        seg1: Math.max(15, Math.round((stats.wins / total) * 100)),
        seg2: Math.max(15, Math.round((stats.losses / total) * 100)),
        seg3: Math.max(10, Math.round((stats.be / total) * 100)),
      }
    }
    if (activeTab === 'sources') {
      return { seg1: 45, seg2: 35, seg3: 20 }
    }
    return { seg1: 60, seg2: 28, seg3: 12 }
  }, [activeTab, stats])

  // Sub-cards data per active tab matching reference screenshot
  const subCards = useMemo(() => {
    if (activeTab === 'sources') {
      return [
        { label: 'Break & Retest', count: 74, unit: 'leads' },
        { label: 'VWAP Reversal', count: 48, unit: 'leads' },
      ]
    }
    if (activeTab === 'qualification') {
      return [
        { label: 'Disciplined', count: 98, unit: 'leads' },
        { label: 'Patient Entry', count: 52, unit: 'leads' },
      ]
    }
    return [
      { label: 'Open', count: stats.wins, unit: 'leads' },
      { label: 'In Progress', count: stats.losses, unit: 'leads' },
    ]
  }, [activeTab, stats])

  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between select-none">
      <div>
        {/* Card Header Title */}
        <h3 className="text-xs font-medium text-zinc-400 mb-4">Leads Management</h3>

        {/* Underline Tab Bar */}
        <div className="flex items-center gap-6 border-b border-white/[0.06]">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={cn(
              'text-xs font-medium pb-2.5 transition-colors relative',
              activeTab === 'status'
                ? 'text-white border-b-2 border-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            Status
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sources')}
            className={cn(
              'text-xs font-medium pb-2.5 transition-colors relative',
              activeTab === 'sources'
                ? 'text-white border-b-2 border-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            Sources
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('qualification')}
            className={cn(
              'text-xs font-medium pb-2.5 transition-colors relative',
              activeTab === 'qualification'
                ? 'text-white border-b-2 border-white font-semibold'
                : 'text-zinc-500 hover:text-zinc-300',
            )}
          >
            Qualification
          </button>
        </div>

        {/* Segmented Multi-Bar Progress Indicator */}
        <div className="flex gap-2 w-full my-6">
          <div
            className="h-1.5 rounded-full bg-zinc-400 transition-all duration-500"
            style={{ width: `${segmentWidths.seg1}%` }}
          />
          <div
            className="h-1.5 rounded-full bg-zinc-600 transition-all duration-500"
            style={{ width: `${segmentWidths.seg2}%` }}
          />
          <div
            className="h-1.5 rounded-full bg-white transition-all duration-500"
            style={{ width: `${segmentWidths.seg3}%` }}
          />
        </div>
      </div>

      {/* 2 Sub-Cards Row (exactly as shown in reference) */}
      <div className="grid grid-cols-2 gap-3 mt-2">
        {subCards.map((card, idx) => (
          <div
            key={idx}
            className="bg-[#181818] border border-white/[0.06] rounded-xl p-4 hover:border-white/[0.12] transition-colors"
          >
            {/* Top mini pill indicator */}
            <div className="w-4 h-1 rounded-full bg-zinc-500 mb-3" />
            <p className="text-xs text-zinc-400">{card.label}</p>
            <div className="mt-1 flex items-baseline gap-1.5">
              <span className="text-xl font-mono font-semibold text-white tracking-tight">
                {card.count}
              </span>
              <span className="text-xs font-sans text-zinc-500 font-normal">
                {card.unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Row 3 Right: Discipline / Win Consistency Grouped Bar Chart (Retention Rate Style) ───

export function PlanComplianceChart({ trades: _trades = [] }: { trades?: Trade[] }) {
  // 7 grouped buckets representing performance across sessions/weeks
  const buckets = [
    { label: 'W1', bars: [45, 80, 60] },
    { label: 'W2', bars: [60, 95, 75] },
    { label: 'W3', bars: [40, 70, 50] },
    { label: 'W4', bars: [70, 90, 80] },
    { label: 'W5', bars: [85, 100, 70] },
    { label: 'W6', bars: [55, 85, 65] },
    { label: 'W7', bars: [75, 95, 85] },
  ]

  return (
    <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between select-none">
      <div>
        {/* Header Row: Title & Three-Dot Menu */}
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-medium text-zinc-400">Retention Rate</h3>
          <button
            type="button"
            className="text-zinc-500 hover:text-zinc-300 transition-colors p-1 -mr-1"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>

        {/* Big Percentage Metric + Inline Comparison */}
        <div className="mt-3 flex items-baseline gap-1.5">
          <span className="text-3xl font-semibold text-white font-mono tabular-nums tracking-tight">
            95%
          </span>
          <span className="text-xs font-mono font-medium text-emerald-400 ml-1">12%</span>
          <span className="text-xs text-zinc-500 font-sans">vs last month</span>
        </div>

        {/* Horizontal Legend */}
        <div className="flex flex-wrap items-center gap-4 mt-3 text-[11px] text-zinc-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-[2px] bg-zinc-600 inline-block shrink-0" />
            <span>Enterprises</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-[2px] bg-white inline-block shrink-0" />
            <span>SMEs</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-[2px] bg-zinc-400 inline-block shrink-0" />
            <span>Startups</span>
          </div>
        </div>
      </div>

      {/* Grouped Vertical Thin-Bar Chart */}
      <div className="pt-6">
        <div className="flex items-end justify-between h-32 gap-3 border-b border-white/[0.06] pb-1">
          {buckets.map((b, i) => (
            <div key={i} className="flex items-end gap-1 h-full px-1">
              {/* Bar 1: Enterprises (zinc-600) */}
              <div
                className="w-1.5 bg-zinc-600 rounded-t-sm transition-all duration-500"
                style={{ height: `${b.bars[0]}%` }}
              />
              {/* Bar 2: SMEs (white) */}
              <div
                className="w-1.5 bg-white rounded-t-sm transition-all duration-500"
                style={{ height: `${b.bars[1]}%` }}
              />
              {/* Bar 3: Startups (zinc-400) */}
              <div
                className="w-1.5 bg-zinc-400 rounded-t-sm transition-all duration-500"
                style={{ height: `${b.bars[2]}%` }}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
