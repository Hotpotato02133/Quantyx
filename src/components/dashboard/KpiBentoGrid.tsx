import React from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/store/useUiStore'
import type { TradeStats } from '@/types'

// ─── Shared KPI Card Shell ───────────────────────────────────────────────────

interface KpiCardProps {
  id: string
  label: string
  children: React.ReactNode
  className?: string
  accent?: 'profit' | 'loss' | 'warning' | 'neutral'
}

function KpiCard({ id, label, children, className, accent = 'neutral' }: KpiCardProps) {
  const accentBorder = {
    profit: 'border-[#1DB954]/25 hover:border-[#1DB954]/40',
    loss: 'border-[#EF4444]/25 hover:border-[#EF4444]/40',
    warning: 'border-[#FF8C43]/25 hover:border-[#FF8C43]/40',
    neutral: 'border-border hover:border-white/[0.15]',
  }[accent]

  return (
    <div
      id={id}
      className={cn(
        'relative flex flex-col justify-between rounded-xl border bg-surface p-4 overflow-hidden',
        'transition-all duration-200 shadow-lg',
        accentBorder,
        className,
      )}
    >
      <div className="flex items-center justify-between pb-1">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">{label}</p>
      </div>
      {children}
    </div>
  )
}

// ─── Privacy Blur Value ──────────────────────────────────────────────────────

function PrivacyValue({ value, className }: { value: string | React.ReactNode; className?: string }) {
  const { privacyMode } = useUiStore()
  return (
    <span
      className={cn(
        'transition-all duration-300',
        privacyMode && 'blur-md select-none',
        className,
      )}
    >
      {value}
    </span>
  )
}

// ─── Mini SVG Sparkline Component ───────────────────────────────────────────

function MiniSparkline({ data, isPositive }: { data?: number[]; isPositive: boolean }) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min === 0 ? 1 : max - min

  const width = 160
  const height = 36
  const padding = 2

  const points = data
    .map((val, idx) => {
      const x = padding + (idx / (data.length - 1)) * (width - padding * 2)
      const y = height - padding - ((val - min) / range) * (height - padding * 2)
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')

  const strokeColor = isPositive ? '#1DB954' : '#EF4444'

  // Area under curve
  const firstX = padding
  const lastX = width - padding
  const areaPath = `M ${firstX},${height} L ${points.split(' ')[0]} ${points.split(' ').map((p) => `L ${p}`).join(' ')} L ${lastX},${height} Z`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-grad-${isPositive ? 'pos' : 'neg'}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#sparkline-grad-${isPositive ? 'pos' : 'neg'})`} />
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
}

// ─── 1. Net PnL Card ($ and % return with mini sparkline) ─────────────────────

function NetPnLCard({ stats }: { stats: TradeStats }) {
  const isPositive = stats.totalPnL >= 0
  const sign = isPositive ? '+' : '-'
  const color = isPositive ? 'text-profit' : 'text-loss'
  const pnlPct = stats.pnlPct ?? 0
  const pctSign = pnlPct >= 0 ? '+' : ''

  return (
    <KpiCard id="kpi-net-pnl" label="Net Realized PnL" accent={isPositive ? 'profit' : 'loss'} className="col-span-2">
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className={cn('font-mono text-3xl font-bold tabular-nums leading-none tracking-tight', color)}>
            <PrivacyValue
              value={`${sign}$${Math.abs(stats.totalPnL).toLocaleString('en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`}
            />
          </div>

          <div className="mt-2 flex items-center gap-2 text-xs">
            <span
              className={cn(
                'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[11px] font-semibold tabular-nums',
                isPositive ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss',
              )}
            >
              <PrivacyValue value={`${pctSign}${pnlPct.toFixed(2)}%`} />
            </span>
            <span className="text-[#A1A1AA]">
              {stats.totalTrades} trade{stats.totalTrades !== 1 ? 's' : ''} total
            </span>
          </div>
        </div>

        {/* Mini sparkline curve */}
        <div className="flex flex-col items-end justify-center">
          <MiniSparkline data={stats.sparklineData} isPositive={isPositive} />
        </div>
      </div>
    </KpiCard>
  )
}

// ─── 2. Win Rate Card (Circular Ring + Wins / Losses / BE Count) ──────────────

function WinRateCard({ stats }: { stats: TradeStats }) {
  const wins = stats.winsCount ?? (stats.totalTrades > 0 ? Math.round((stats.winRate / 100) * stats.totalTrades) : 0)
  const breakevens = stats.breakevenCount ?? 0
  const losses = stats.lossesCount ?? Math.max(0, stats.totalTrades - wins - breakevens)

  const circumference = 2 * Math.PI * 26
  const offset = circumference - (stats.winRate / 100) * circumference
  const isHealthy = stats.winRate >= 50

  return (
    <KpiCard id="kpi-win-rate" label="Win Rate" accent={isHealthy ? 'profit' : 'loss'}>
      <div className="flex items-center justify-between gap-3">
        {/* Circular Progress Ring */}
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="26" fill="none" stroke="#262626" strokeWidth="5" />
            <circle
              cx="30"
              cy="30"
              r="26"
              fill="none"
              stroke={isHealthy ? '#1DB954' : '#EF4444'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-xs font-bold tabular-nums text-[#F4F4F5]">
              <PrivacyValue value={`${stats.winRate.toFixed(1)}%`} />
            </span>
          </div>
        </div>

        {/* Wins / Losses / BE count */}
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-profit inline-block" />
            <span className="text-[#A1A1AA] font-mono">
              <PrivacyValue value={`${wins} W`} />
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-loss inline-block" />
            <span className="text-[#A1A1AA] font-mono">
              <PrivacyValue value={`${losses} L`} />
            </span>
          </div>
          {breakevens > 0 && (
            <div className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-warning inline-block" />
              <span className="text-[#A1A1AA] font-mono">
                <PrivacyValue value={`${breakevens} BE`} />
              </span>
            </div>
          )}
        </div>
      </div>
    </KpiCard>
  )
}

// ─── 3. Profit Factor Card (Gauge >1.5 Green, 1.0–1.5 Orange, <1.0 Red) ───────

function ProfitFactorCard({ stats }: { stats: TradeStats }) {
  const pf = stats.profitFactor
  const isMax = pf === Infinity
  const display = isMax ? 'MAX' : pf.toFixed(2)

  // Color tokens: > 1.5 green, 1.0–1.5 orange #FF8C43, < 1.0 red #EF4444
  const isGreen = pf >= 1.5
  const isOrange = pf >= 1.0 && pf < 1.5
  const color = isGreen ? 'text-[#1DB954]' : isOrange ? 'text-[#FF8C43]' : 'text-[#EF4444]'
  const accent: 'profit' | 'warning' | 'loss' = isGreen ? 'profit' : isOrange ? 'warning' : 'loss'
  const barColor = isGreen ? 'bg-[#1DB954]' : isOrange ? 'bg-[#FF8C43]' : 'bg-[#EF4444]'
  const barPct = isMax ? 100 : Math.min((pf / 3) * 100, 100)

  return (
    <KpiCard id="kpi-profit-factor" label="Profit Factor" accent={accent}>
      <div className={cn('font-mono text-3xl font-bold tabular-nums leading-none tracking-tight', color)}>
        <PrivacyValue value={display} />
      </div>

      {/* Styled Color Gauge Bar */}
      <div className="mt-2.5 h-1.5 w-full rounded-full bg-[#262626] overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${barPct}%` }}
        />
      </div>

      <p className="mt-1.5 text-[10px] text-[#A1A1AA]">
        {isGreen ? 'High institutional edge (>1.5)' : isOrange ? 'Moderate edge (1.0–1.5)' : 'Negative edge (<1.0)'}
      </p>
    </KpiCard>
  )
}

// ─── 4. Expectancy Card ($ and R per trade) ───────────────────────────────────

function ExpectancyCard({ stats }: { stats: TradeStats }) {
  const isPositive = stats.expectancy >= 0
  const sign = isPositive ? '+' : '-'
  const color = isPositive ? 'text-profit' : 'text-loss'
  const rExp = stats.rExpectancy ?? (stats.avgRMultiple ? stats.avgRMultiple * (stats.winRate / 100) : null)

  return (
    <KpiCard id="kpi-expectancy" label="Expectancy / Trade" accent={isPositive ? 'profit' : 'loss'}>
      <div className="flex items-baseline justify-between">
        <div className={cn('font-mono text-3xl font-bold tabular-nums leading-none tracking-tight', color)}>
          <PrivacyValue value={`${sign}$${Math.abs(stats.expectancy).toFixed(2)}`} />
        </div>
        {rExp !== null && (
          <span className={cn('font-mono text-sm font-semibold tabular-nums', color)}>
            <PrivacyValue value={`${rExp >= 0 ? '+' : ''}${rExp.toFixed(2)}R`} />
          </span>
        )}
      </div>

      <p className="mt-2 text-[10px] text-[#A1A1AA]">
        Projected statistical edge per execution
      </p>
    </KpiCard>
  )
}

// ─── 5. Max & Current Drawdown Card with Warning Banner ───────────────────────

function MaxDrawdownCard({ stats }: { stats: TradeStats }) {
  const maxLimitPct = stats.maxDailyDrawdownPct ?? 5.0
  const maxDd = stats.maxDrawdownPct
  const currentDd = stats.currentDrawdownPct ?? maxDd

  const isApproachingLimit = currentDd >= maxLimitPct * 0.8
  const isBreached = currentDd >= maxLimitPct

  const accent: 'loss' | 'warning' | 'neutral' = isBreached ? 'loss' : isApproachingLimit ? 'warning' : 'neutral'
  const statusColor = isBreached ? 'text-loss' : isApproachingLimit ? 'text-warning' : 'text-[#F4F4F5]'

  return (
    <KpiCard id="kpi-max-drawdown" label="Drawdown & Risk Limit" accent={accent}>
      <div className="flex items-baseline justify-between">
        <div>
          <span className="text-[10px] text-[#71717A] uppercase font-semibold">Max DD:</span>
          <div className={cn('font-mono text-2xl font-bold tabular-nums leading-none', statusColor)}>
            <PrivacyValue value={`-${maxDd.toFixed(2)}%`} />
          </div>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-[#71717A] uppercase font-semibold">Dollar Peak-Trough:</span>
          <p className="font-mono text-xs text-[#A1A1AA]">
            <PrivacyValue value={`-$${stats.maxDrawdown.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} />
          </p>
        </div>
      </div>

      {/* Warning Banner if approaching or breaching account's max_daily_drawdown_pct */}
      {isBreached ? (
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-loss/15 border border-loss/30 px-2 py-1 text-loss">
          <AlertTriangle className="h-3 w-3 shrink-0 animate-bounce" />
          <span className="text-[10px] font-semibold">
            Max Daily Drawdown ({maxLimitPct}%) Breached!
          </span>
        </div>
      ) : isApproachingLimit ? (
        <div className="mt-2 flex items-center gap-1.5 rounded-md bg-warning/15 border border-warning/30 px-2 py-1 text-warning">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span className="text-[10px] font-semibold">
            Warning: Approaching {maxLimitPct}% Risk Limit
          </span>
        </div>
      ) : (
        <div className="mt-2 flex items-center justify-between text-[10px] text-[#71717A]">
          <span>Max Allowed: {maxLimitPct}%</span>
          <span className="text-profit font-medium">Safe Margin</span>
        </div>
      )}
    </KpiCard>
  )
}

// ─── Bento Grid Root ─────────────────────────────────────────────────────────

const EMPTY_STATS: TradeStats = {
  totalTrades: 0,
  winsCount: 0,
  lossesCount: 0,
  breakevenCount: 0,
  winRate: 0,
  profitFactor: 0,
  expectancy: 0,
  rExpectancy: 0,
  totalPnL: 0,
  pnlPct: 0,
  maxDrawdown: 0,
  maxDrawdownPct: 0,
  currentDrawdownPct: 0,
  maxDailyDrawdownPct: 5.0,
  avgWin: 0,
  avgLoss: 0,
  bestTrade: 0,
  worstTrade: 0,
  avgRMultiple: null,
  sparklineData: [],
}

interface KpiBentoGridProps {
  stats?: TradeStats
  isLoading?: boolean
}

export function KpiBentoGrid({ stats = EMPTY_STATS, isLoading }: KpiBentoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-36 rounded-xl border border-border bg-surface animate-pulse',
              i === 0 && 'col-span-1 md:col-span-2',
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div id="kpi-bento-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
      <NetPnLCard stats={stats} />
      <WinRateCard stats={stats} />
      <ProfitFactorCard stats={stats} />
      <ExpectancyCard stats={stats} />
      <MaxDrawdownCard stats={stats} />
    </div>
  )
}
