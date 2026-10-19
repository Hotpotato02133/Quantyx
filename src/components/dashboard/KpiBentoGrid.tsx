import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/store/useUiStore'
import type { TradeStats } from '@/types'

// ─── Shared KPI card shell ────────────────────────────────────────────────────

interface KpiCardProps {
  id: string
  label: string
  children: React.ReactNode
  className?: string
  accent?: 'profit' | 'loss' | 'warning' | 'neutral'
}

function KpiCard({ id, label, children, className, accent = 'neutral' }: KpiCardProps) {
  const accentBorder = {
    profit: 'border-profit/20',
    loss: 'border-loss/20',
    warning: 'border-warning/20',
    neutral: 'border-border',
  }[accent]

  return (
    <div
      id={id}
      className={cn(
        'relative flex flex-col gap-2 rounded-xl border bg-surface p-4 overflow-hidden',
        'transition-colors duration-200 hover:bg-[#181818]',
        accentBorder,
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">{label}</p>
      {children}
    </div>
  )
}

// ─── Privacy blur ─────────────────────────────────────────────────────────────

function PrivacyValue({ value, className }: { value: string; className?: string }) {
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

// ─── Net PnL Card ─────────────────────────────────────────────────────────────

function NetPnLCard({ stats }: { stats: TradeStats }) {
  const isPositive = stats.totalPnL >= 0
  const sign = isPositive ? '+' : ''
  const color = isPositive ? 'text-profit' : 'text-loss'
  const TrendIcon = isPositive ? TrendingUp : TrendingDown

  return (
    <KpiCard id="kpi-net-pnl" label="Net PnL" accent={isPositive ? 'profit' : 'loss'} className="col-span-2">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className={cn('font-mono text-3xl font-semibold tabular-nums leading-none', color)}>
            <PrivacyValue value={`${sign}$${Math.abs(stats.totalPnL).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          </div>
          <p className="mt-1.5 text-xs text-[#A1A1AA]">
            {stats.totalTrades} trade{stats.totalTrades !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg', isPositive ? 'bg-profit/10' : 'bg-loss/10')}>
          <TrendIcon className={cn('h-5 w-5', color)} strokeWidth={2} />
        </div>
      </div>

      {/* Mini sparkline placeholder — filled by EquityCurveChart */}
      <div className="h-[2px] w-full rounded-full bg-border overflow-hidden mt-1">
        <div
          className={cn('h-full rounded-full transition-all duration-700', isPositive ? 'bg-profit' : 'bg-loss')}
          style={{ width: `${Math.min(Math.abs(stats.totalPnL) / 100, 100)}%` }}
        />
      </div>
    </KpiCard>
  )
}

// ─── Win Rate Card ────────────────────────────────────────────────────────────

function WinRateCard({ stats }: { stats: TradeStats }) {
  const wins = stats.totalTrades > 0 ? Math.round((stats.winRate / 100) * stats.totalTrades) : 0
  const losses = stats.totalTrades - wins
  const circumference = 2 * Math.PI * 28
  const offset = circumference - (stats.winRate / 100) * circumference

  return (
    <KpiCard id="kpi-win-rate" label="Win Rate">
      <div className="flex items-center gap-4">
        {/* Circular ring */}
        <div className="relative h-16 w-16 shrink-0">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64">
            <circle cx="32" cy="32" r="28" fill="none" stroke="#262626" strokeWidth="5" />
            <circle
              cx="32" cy="32" r="28" fill="none"
              stroke={stats.winRate >= 50 ? '#1DB954' : '#EF4444'}
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-sm font-semibold tabular-nums text-[#F4F4F5]">
              <PrivacyValue value={`${stats.winRate.toFixed(0)}%`} />
            </span>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-profit inline-block" />
            <span className="text-[#A1A1AA]">
              <PrivacyValue value={`${wins} wins`} />
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <span className="h-1.5 w-1.5 rounded-full bg-loss inline-block" />
            <span className="text-[#A1A1AA]">
              <PrivacyValue value={`${losses} losses`} />
            </span>
          </div>
        </div>
      </div>
    </KpiCard>
  )
}

// ─── Profit Factor Card ───────────────────────────────────────────────────────

function ProfitFactorCard({ stats }: { stats: TradeStats }) {
  const pf = stats.profitFactor
  const isMax = pf === Infinity
  const display = isMax ? 'MAX' : pf.toFixed(2)
  const color = pf >= 1.5 ? 'text-profit' : pf >= 1.0 ? 'text-warning' : 'text-loss'
  const accent: 'profit' | 'warning' | 'loss' = pf >= 1.5 ? 'profit' : pf >= 1.0 ? 'warning' : 'loss'
  const barPct = isMax ? 100 : Math.min((pf / 3) * 100, 100)
  const barColor = pf >= 1.5 ? 'bg-profit' : pf >= 1.0 ? 'bg-warning' : 'bg-loss'

  return (
    <KpiCard id="kpi-profit-factor" label="Profit Factor" accent={accent}>
      <div className={cn('font-mono text-3xl font-semibold tabular-nums leading-none', color)}>
        <PrivacyValue value={display} />
      </div>
      {/* Gauge bar */}
      <div className="mt-2 h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-700', barColor)}
          style={{ width: `${barPct}%` }}
        />
      </div>
      <p className="text-[10px] text-[#525252]">
        {pf >= 1.5 ? 'Excellent edge' : pf >= 1.0 ? 'Marginal edge' : 'Negative edge'}
      </p>
    </KpiCard>
  )
}

// ─── Expectancy Card ──────────────────────────────────────────────────────────

function ExpectancyCard({ stats }: { stats: TradeStats }) {
  const isPositive = stats.expectancy >= 0
  const sign = isPositive ? '+' : ''
  const color = isPositive ? 'text-profit' : 'text-loss'

  return (
    <KpiCard id="kpi-expectancy" label="Expectancy / Trade" accent={isPositive ? 'profit' : 'loss'}>
      <div className={cn('font-mono text-3xl font-semibold tabular-nums leading-none', color)}>
        <PrivacyValue value={`${sign}$${Math.abs(stats.expectancy).toFixed(2)}`} />
      </div>
      <p className="text-[10px] text-[#525252]">Expected $ earned per trade</p>
    </KpiCard>
  )
}

// ─── Max Drawdown Card ────────────────────────────────────────────────────────

function MaxDrawdownCard({ stats }: { stats: TradeStats }) {
  const isWarning = stats.maxDrawdownPct > 3
  const isCritical = stats.maxDrawdownPct > 5

  return (
    <KpiCard
      id="kpi-max-drawdown"
      label="Max Drawdown"
      accent={isCritical ? 'loss' : isWarning ? 'warning' : 'neutral'}
    >
      <div className={cn('font-mono text-3xl font-semibold tabular-nums leading-none', isCritical ? 'text-loss' : isWarning ? 'text-warning' : 'text-[#F4F4F5]')}>
        <PrivacyValue value={`-${stats.maxDrawdownPct.toFixed(2)}%`} />
      </div>
      <p className="text-[10px] text-[#525252]">
        <PrivacyValue value={`-$${stats.maxDrawdown.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} /> peak-to-trough
      </p>
      {isCritical && (
        <div className="mt-1 flex items-center gap-1.5 rounded-md bg-loss/10 border border-loss/20 px-2 py-1">
          <span className="h-1.5 w-1.5 rounded-full bg-loss animate-pulse inline-block shrink-0" />
          <span className="text-[10px] text-loss font-medium">Daily limit breach warning</span>
        </div>
      )}
    </KpiCard>
  )
}

// ─── Bento Grid ───────────────────────────────────────────────────────────────

const EMPTY_STATS: TradeStats = {
  totalTrades: 0,
  winRate: 0,
  profitFactor: 0,
  expectancy: 0,
  totalPnL: 0,
  maxDrawdown: 0,
  maxDrawdownPct: 0,
  avgWin: 0,
  avgLoss: 0,
  bestTrade: 0,
  worstTrade: 0,
  avgRMultiple: null,
}

interface KpiBentoGridProps {
  stats?: TradeStats
  isLoading?: boolean
}

export function KpiBentoGrid({ stats = EMPTY_STATS, isLoading }: KpiBentoGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-32 rounded-xl border border-border bg-surface animate-pulse',
              i === 0 && 'col-span-2',
            )}
          />
        ))}
      </div>
    )
  }

  return (
    <div id="kpi-bento-grid" className="grid grid-cols-4 gap-3">
      <NetPnLCard stats={stats} />
      <WinRateCard stats={stats} />
      <ProfitFactorCard stats={stats} />
      <ExpectancyCard stats={stats} />
      <MaxDrawdownCard stats={stats} />
    </div>
  )
}
