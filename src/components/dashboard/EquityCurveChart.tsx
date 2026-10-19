import { useMemo } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/store/useUiStore'
import type { Trade } from '@/types'

type ViewMode = 'pnl' | 'balance' | 'r-multiple'

const VIEW_OPTIONS: { key: ViewMode; label: string }[] = [
  { key: 'pnl', label: 'Cumulative P&L' },
  { key: 'balance', label: 'Account Balance' },
  { key: 'r-multiple', label: 'Cumulative R' },
]

interface EquityCurveChartProps {
  trades: Trade[]
  initialBalance?: number
  viewMode?: ViewMode
  onViewModeChange?: (mode: ViewMode) => void
}

interface DataPoint {
  date: string
  displayDate: string
  pnl: number
  balance: number
  rMultiple: number
}

// Custom tooltip component
function CustomTooltip({ active, payload, label }: {
  active?: boolean
  payload?: Array<{ value: number; dataKey: string }>
  label?: string
}) {
  if (!active || !payload?.length) return null
  const value = payload[0].value
  const dataKey = payload[0].dataKey

  return (
    <div className="rounded-lg border border-border bg-elevated/95 backdrop-blur-sm px-3 py-2 shadow-xl">
      <p className="text-[11px] text-[#A1A1AA] mb-1">{label}</p>
      <p className={cn('font-mono text-sm font-semibold tabular-nums', value >= 0 ? 'text-profit' : 'text-loss')}>
        {dataKey === 'rMultiple'
          ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}R`
          : `${value >= 0 ? '+' : ''}$${Math.abs(value).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
      </p>
    </div>
  )
}

export function EquityCurveChart({
  trades,
  initialBalance = 10000,
  viewMode = 'pnl',
  onViewModeChange,
}: EquityCurveChartProps) {
  const { privacyMode } = useUiStore()

  const data = useMemo<DataPoint[]>(() => {
    if (trades.length === 0) return []

    const sorted = [...trades]
      .filter((t) => t.exit_at && t.pnl !== null)
      .sort((a, b) => new Date(a.exit_at!).getTime() - new Date(b.exit_at!).getTime())

    let cumPnl = 0
    let cumR = 0

    return sorted.map((trade) => {
      cumPnl += trade.pnl ?? 0
      cumR += trade.r_multiple ?? 0
      const date = trade.exit_at!
      return {
        date,
        displayDate: format(parseISO(date), 'MMM d'),
        pnl: cumPnl,
        balance: initialBalance + cumPnl,
        rMultiple: cumR,
      }
    })
  }, [trades, initialBalance])

  const isPositive = data.length === 0 || (data[data.length - 1]?.[viewMode === 'r-multiple' ? 'rMultiple' : viewMode === 'balance' ? 'balance' : 'pnl'] ?? 0) >= (viewMode === 'balance' ? initialBalance : 0)
  const lineColor = isPositive ? '#1DB954' : '#EF4444'
  const dataKey = viewMode === 'r-multiple' ? 'rMultiple' : viewMode === 'balance' ? 'balance' : 'pnl'

  const isEmpty = data.length === 0

  return (
    <div id="equity-curve-chart" className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-[#F4F4F5]">Equity Curve</h2>
        <div className="flex items-center gap-1 rounded-lg border border-border p-0.5 bg-canvas">
          {VIEW_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => onViewModeChange?.(key)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors duration-150',
                viewMode === key
                  ? 'bg-surface text-[#F4F4F5] shadow-sm'
                  : 'text-[#A1A1AA] hover:text-[#F4F4F5]',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {isEmpty ? (
        <div className="flex h-[220px] items-center justify-center text-[#525252] text-sm">
          No closed trades yet — start logging!
        </div>
      ) : (
        <div className={cn('transition-all duration-300', privacyMode && 'blur-md')}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="equity-gradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={lineColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#262626" strokeDasharray="3 3" />
              <XAxis
                dataKey="displayDate"
                tick={{ fill: '#525252', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fill: '#525252', fontSize: 11, fontFamily: 'JetBrains Mono' }}
                axisLine={false}
                tickLine={false}
                width={56}
                tickFormatter={(v) =>
                  viewMode === 'r-multiple'
                    ? `${v.toFixed(1)}R`
                    : `$${(v / 1000).toFixed(1)}k`
                }
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey={dataKey}
                stroke={lineColor}
                strokeWidth={2}
                fill="url(#equity-gradient)"
                dot={false}
                activeDot={{ r: 4, fill: lineColor, stroke: '#121212', strokeWidth: 2 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
