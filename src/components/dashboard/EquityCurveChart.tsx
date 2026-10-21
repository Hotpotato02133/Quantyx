import { useEffect, useRef, useState, useMemo } from 'react'
import {
  createChart,
  AreaSeries,
  ColorType,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, parseISO } from 'date-fns'
import { DollarSign, Percent, TrendingUp, Layers, Info } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/store/useUiStore'
import type { Trade } from '@/types'

export type EquityViewMode = 'pnl' | 'balance' | 'r-multiple'

interface EquityCurveChartProps {
  trades: Trade[]
  initialBalance?: number
  viewMode?: EquityViewMode
  onViewModeChange?: (mode: EquityViewMode) => void
}

interface DataPoint {
  time: UTCTimestamp
  dateStr: string
  displayDate: string
  pnl: number
  balance: number
  rMultiple: number
}

const VIEW_OPTIONS: { key: EquityViewMode; label: string; icon: typeof DollarSign }[] = [
  { key: 'pnl', label: 'Cumulative P&L ($)', icon: DollarSign },
  { key: 'balance', label: 'Account Balance ($)', icon: Layers },
  { key: 'r-multiple', label: 'Cumulative R (R)', icon: Percent },
]

export function EquityCurveChart({
  trades,
  initialBalance = 10000,
  viewMode: controlledMode,
  onViewModeChange,
}: EquityCurveChartProps) {
  const { privacyMode } = useUiStore()
  const [internalMode, setInternalMode] = useState<EquityViewMode>('pnl')
  const activeMode = controlledMode ?? internalMode

  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartInstanceRef = useRef<IChartApi | null>(null)
  const seriesInstanceRef = useRef<ISeriesApi<'Area'> | null>(null)

  const [hoverData, setHoverData] = useState<{
    value: number
    date: string
  } | null>(null)

  // Check if browser environment supports 2D Canvas (false in JSDOM tests)
  const [supportsCanvas, setSupportsCanvas] = useState(false)

  useEffect(() => {
    try {
      if (typeof window === 'undefined' || (typeof process !== 'undefined' && process.env?.NODE_ENV === 'test')) {
        setSupportsCanvas(false)
        return
      }
      const c = document.createElement('canvas')
      const ctx = c.getContext ? c.getContext('2d') : null
      if (ctx && typeof ctx.measureText === 'function') {
        const metrics = ctx.measureText('M')
        if (metrics && metrics.width > 0) {
          setSupportsCanvas(true)
          return
        }
      }
      setSupportsCanvas(false)
    } catch {
      setSupportsCanvas(false)
    }
  }, [])

  const handleModeChange = (mode: EquityViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode)
    } else {
      setInternalMode(mode)
    }
  }

  // 1. Transform trades into chronologically sorted data points
  const sortedData = useMemo<DataPoint[]>(() => {
    if (trades.length === 0) return []

    const validTrades = [...trades]
      .filter((t) => t.status === 'closed' && t.exit_at && t.pnl !== null)
      .sort((a, b) => new Date(a.exit_at!).getTime() - new Date(b.exit_at!).getTime())

    let cumPnl = 0
    let cumR = 0
    let lastTimestamp = 0

    return validTrades.map((trade) => {
      cumPnl += trade.pnl ?? 0
      cumR += trade.r_multiple ?? 0

      // Ensure strictly increasing timestamp for Lightweight Charts
      let rawSec = Math.floor(new Date(trade.exit_at!).getTime() / 1000)
      if (rawSec <= lastTimestamp) {
        rawSec = lastTimestamp + 1
      }
      lastTimestamp = rawSec

      return {
        time: rawSec as UTCTimestamp,
        dateStr: trade.exit_at!,
        displayDate: format(parseISO(trade.exit_at!), 'MMM d, yyyy HH:mm'),
        pnl: Math.round(cumPnl * 100) / 100,
        balance: Math.round((initialBalance + cumPnl) * 100) / 100,
        rMultiple: Math.round(cumR * 100) / 100,
      }
    })
  }, [trades, initialBalance])

  // Current values
  const latestValue = useMemo(() => {
    if (sortedData.length === 0) return activeMode === 'balance' ? initialBalance : 0
    const last = sortedData[sortedData.length - 1]
    return activeMode === 'balance' ? last.balance : activeMode === 'r-multiple' ? last.rMultiple : last.pnl
  }, [sortedData, activeMode, initialBalance])

  const isNetPositive = activeMode === 'balance' ? latestValue >= initialBalance : latestValue >= 0

  // 2. Initialize TradingView Lightweight Chart
  useEffect(() => {
    if (!supportsCanvas || !chartContainerRef.current || sortedData.length === 0) return

    // Clean up any existing chart
    if (chartInstanceRef.current) {
      chartInstanceRef.current.remove()
      chartInstanceRef.current = null
      seriesInstanceRef.current = null
    }

    const container = chartContainerRef.current
    const chart = createChart(container, {
      width: container.clientWidth,
      height: 320,
      layout: {
        background: { type: ColorType.Solid, color: '#141414' },
        textColor: '#A1A1AA',
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11,
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.04)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.04)' },
      },
      crosshair: {
        vertLine: {
          color: '#FF8C43',
          width: 1,
          style: 3,
          labelBackgroundColor: '#18181B',
        },
        horzLine: {
          color: '#FF8C43',
          width: 1,
          style: 3,
          labelBackgroundColor: '#18181B',
        },
      },
      rightPriceScale: {
        borderColor: '#262626',
        scaleMargins: {
          top: 0.15,
          bottom: 0.15,
        },
      },
      timeScale: {
        borderColor: '#262626',
        timeVisible: true,
        secondsVisible: false,
      },
    })

    const strokeColor = isNetPositive ? '#1DB954' : '#EF4444'
    const topFillColor = isNetPositive ? 'rgba(29, 185, 84, 0.32)' : 'rgba(239, 68, 68, 0.32)'
    const bottomFillColor = isNetPositive ? 'rgba(29, 185, 84, 0.0)' : 'rgba(239, 68, 68, 0.0)'

    const areaSeries = chart.addSeries(AreaSeries, {
      lineColor: strokeColor,
      topColor: topFillColor,
      bottomColor: bottomFillColor,
      lineWidth: 2,
      priceFormat: {
        type: 'custom',
        formatter: (price: number) => {
          if (activeMode === 'r-multiple') {
            return `${price >= 0 ? '+' : ''}${price.toFixed(2)}R`
          }
          return `${price >= 0 ? '+' : '-'}$${Math.abs(price).toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`
        },
      },
    })

    // Map data for series
    const seriesData = sortedData.map((d) => ({
      time: d.time,
      value: activeMode === 'balance' ? d.balance : activeMode === 'r-multiple' ? d.rMultiple : d.pnl,
    }))

    areaSeries.setData(seriesData)
    chart.timeScale().fitContent()

    // Crosshair move subscription for live tooltip readout
    chart.subscribeCrosshairMove((param) => {
      if (!param.time || !param.seriesData.get(areaSeries)) {
        setHoverData(null)
        return
      }
      const dataPoint = param.seriesData.get(areaSeries) as { value: number } | undefined
      if (dataPoint) {
        const matched = sortedData.find((d) => d.time === param.time)
        setHoverData({
          value: dataPoint.value,
          date: matched ? matched.displayDate : '',
        })
      }
    })

    // Responsive resize listener
    const resizeObserver = new ResizeObserver((entries) => {
      if (entries.length > 0 && chartInstanceRef.current) {
        const { width } = entries[0].contentRect
        chartInstanceRef.current.applyOptions({ width })
      }
    })
    resizeObserver.observe(container)

    chartInstanceRef.current = chart
    seriesInstanceRef.current = areaSeries

    return () => {
      resizeObserver.disconnect()
      chart.remove()
      chartInstanceRef.current = null
      seriesInstanceRef.current = null
    }
  }, [sortedData, activeMode, isNetPositive, supportsCanvas])

  return (
    <div
      id="equity-curve-chart"
      className="bg-[#141414] border border-white/[0.06] rounded-2xl p-6 shadow-sm select-none"
    >
      {/* ─── Top Header & Controls ────────────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4">
        <div>
          {/* Title row */}
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
              <span>Revenue over time</span>
              <Info className="w-3.5 h-3.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer" />
            </h2>
            <span className="sr-only">Institutional Equity Curve</span>
          </div>

          {/* Big Headline Value */}
          <div className="mt-1 flex items-baseline gap-2">
            <span
              className={cn(
                'text-3xl font-semibold text-white font-mono tabular-nums tracking-tight',
                privacyMode && 'blur-md select-none',
              )}
            >
              {hoverData
                ? activeMode === 'r-multiple'
                  ? `${hoverData.value >= 0 ? '+' : ''}${hoverData.value.toFixed(2)}R`
                  : `$${Math.abs(hoverData.value).toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2,
                    })}`
                : activeMode === 'r-multiple'
                ? `${latestValue >= 0 ? '+' : ''}${latestValue.toFixed(2)}R`
                : `$${Math.abs(latestValue || 30240).toLocaleString('en-US', {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}`}
            </span>
          </div>
        </div>

        {/* Right Controls: Trend badge + View Mode Segmented Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Trend Badge */}
          <span className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>7.5% vs last month</span>
          </span>

          {/* Segmented View Mode Controls */}
          <div className="flex items-center rounded-xl border border-white/[0.06] bg-[#161616] p-1 text-xs">
            {VIEW_OPTIONS.map((opt) => {
              const isSelected = activeMode === opt.key
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => handleModeChange(opt.key)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150',
                    isSelected
                      ? 'bg-[#222222] text-profit font-semibold shadow-sm'
                      : 'text-zinc-500 hover:text-zinc-300',
                  )}
                >
                  <span>{opt.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ─── Main Chart Canvas ────────────────────────────────────────────── */}
      <div className="pt-2 min-h-[300px]">
        {sortedData.length === 0 ? (
          <div className="flex h-72 flex-col items-center justify-center text-center text-zinc-500">
            <TrendingUp className="h-8 w-8 mb-2 opacity-30 text-zinc-400" />
            <p className="text-sm font-medium text-zinc-300">No closed executions found</p>
            <p className="text-xs text-zinc-500 mt-0.5">
              Log trades or import CSV to generate your performance curve
            </p>
          </div>
        ) : (
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart
                data={sortedData}
                margin={{ top: 15, right: 10, left: -15, bottom: 0 }}
                onMouseMove={(state: any) => {
                  if (state && state.activePayload && state.activePayload.length > 0) {
                    const d = state.activePayload[0].payload as DataPoint
                    const val = state.activePayload[0].value as number
                    setHoverData({ value: val, date: d.displayDate })
                  }
                }}
                onMouseLeave={() => setHoverData(null)}
              >
                <defs>
                  <linearGradient id="monochromeEquityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#FFFFFF" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                {/* Horizontal dashed hairline grid lines only */}
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255, 255, 255, 0.05)"
                  vertical={false}
                />
                <XAxis
                  dataKey="displayDate"
                  tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'monospace' }}
                  axisLine={{ stroke: 'rgba(255, 255, 255, 0.06)' }}
                  tickLine={false}
                  dy={6}
                />
                <YAxis
                  tick={{ fill: '#71717A', fontSize: 11, fontFamily: 'monospace' }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => {
                    if (activeMode === 'r-multiple') return `${v}R`
                    if (Math.abs(v) >= 1000) return `${Math.round(v / 1000)}k`
                    return `${v}`
                  }}
                  dx={-4}
                />
                <RechartsTooltip
                  cursor={{
                    stroke: 'rgba(255, 255, 255, 0.35)',
                    strokeWidth: 1,
                    strokeDasharray: '3 3',
                  }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const d = payload[0].payload as DataPoint
                    const val = payload[0].value as number
                    return (
                      <div className="flex flex-col items-center animate-in fade-in-0 zoom-in-95 pointer-events-none">
                        <span className="text-[11px] font-mono text-zinc-400 mb-1">
                          {d.displayDate}
                        </span>
                        <div className="bg-[#0A0A0A]/95 border border-white/[0.12] rounded-xl px-3.5 py-1.5 shadow-2xl flex items-center gap-2.5 backdrop-blur-xl">
                          <span className="w-2 h-2 rounded-full bg-white shrink-0" />
                          <span className="text-xs text-zinc-400">Revenue</span>
                          <span className="text-xs font-mono font-semibold text-white">
                            {activeMode === 'r-multiple'
                              ? `${val >= 0 ? '+' : ''}${val.toFixed(2)}R`
                              : `$${Math.abs(val).toLocaleString('en-US', {
                                  minimumFractionDigits: 0,
                                  maximumFractionDigits: 2,
                                })}`}
                          </span>
                        </div>
                      </div>
                    )
                  }}
                />
                <Area
                  type="monotone"
                  dataKey={
                    activeMode === 'balance'
                      ? 'balance'
                      : activeMode === 'r-multiple'
                      ? 'rMultiple'
                      : 'pnl'
                  }
                  stroke="#FFFFFF"
                  strokeWidth={2}
                  fill="url(#monochromeEquityGradient)"
                  activeDot={{
                    r: 4.5,
                    fill: '#FFFFFF',
                    stroke: '#0A0A0A',
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}
