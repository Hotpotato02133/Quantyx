import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Spotlight } from '@/components/ui/aceternity/Spotlight'
import {
  Clock,
  ArrowRight,
  Sliders,
  Sparkles,
  Activity,
  CheckCircle2,
  Filter,
} from 'lucide-react'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

interface SessionData {
  id: string
  name: string
  hours: string
  tradesCount: number
  winRate: number
  totalR: number
  profitFactor: number
  avgReturn: string
  status: 'Prime Edge' | 'Consistent' | 'Break Even' | 'Leak'
}

const SESSION_METRICS: SessionData[] = [
  {
    id: 'ny-am',
    name: 'New York Morning Open',
    hours: '09:30 to 11:30 EST',
    tradesCount: 142,
    winRate: 68.3,
    totalR: 34.2,
    profitFactor: 2.84,
    avgReturn: '+$48,200',
    status: 'Prime Edge',
  },
  {
    id: 'london',
    name: 'London Open Expansion',
    hours: '03:00 to 07:00 EST',
    tradesCount: 96,
    winRate: 62.5,
    totalR: 19.8,
    profitFactor: 2.15,
    avgReturn: '+$27,450',
    status: 'Consistent',
  },
  {
    id: 'ny-pm',
    name: 'New York Afternoon Session',
    hours: '13:30 to 16:00 EST',
    tradesCount: 64,
    winRate: 51.6,
    totalR: 4.1,
    profitFactor: 1.22,
    avgReturn: '+$4,320',
    status: 'Break Even',
  },
  {
    id: 'asian',
    name: 'Asian Range Consolidation',
    hours: '20:00 to 01:00 EST',
    tradesCount: 48,
    winRate: 39.5,
    totalR: -9.5,
    profitFactor: 0.74,
    avgReturn: 'Loss $9,120',
    status: 'Leak',
  },
]

interface EquityPoint {
  trade: number
  date: string
  dollar: number
  rMultiple: number
  drawdownPct: number
  session: string
}

const SAMPLE_EQUITY: EquityPoint[] = [
  { trade: 1, date: 'Oct 02', dollar: 1250, rMultiple: 1.25, drawdownPct: 0.0, session: 'London' },
  { trade: 5, date: 'Oct 05', dollar: 4800, rMultiple: 4.8, drawdownPct: 0.0, session: 'NY Morning' },
  { trade: 10, date: 'Oct 08', dollar: 3950, rMultiple: 3.95, drawdownPct: 1.4, session: 'NY Afternoon' },
  { trade: 15, date: 'Oct 11', dollar: 8400, rMultiple: 8.4, drawdownPct: 0.0, session: 'NY Morning' },
  { trade: 20, date: 'Oct 14', dollar: 12200, rMultiple: 12.2, drawdownPct: 0.0, session: 'London' },
  { trade: 25, date: 'Oct 17', dollar: 10800, rMultiple: 10.8, drawdownPct: 2.1, session: 'Asian' },
  { trade: 30, date: 'Oct 20', dollar: 17400, rMultiple: 17.4, drawdownPct: 0.0, session: 'NY Morning' },
  { trade: 35, date: 'Oct 23', dollar: 22600, rMultiple: 22.6, drawdownPct: 0.0, session: 'NY Morning' },
  { trade: 40, date: 'Oct 26', dollar: 20900, rMultiple: 20.9, drawdownPct: 1.8, session: 'NY Afternoon' },
  { trade: 45, date: 'Oct 29', dollar: 28400, rMultiple: 28.4, drawdownPct: 0.0, session: 'London' },
  { trade: 50, date: 'Nov 02', dollar: 35800, rMultiple: 35.8, drawdownPct: 0.0, session: 'NY Morning' },
]

export default function PublicAnalyticsPage() {
  const [metricMode, setMetricMode] = useState<'dollar' | 'rMultiple'>('rMultiple')
  const [hoveredIndex, setHoveredIndex] = useState<number>(SAMPLE_EQUITY.length - 1)
  const [hideAsianLeak, setHideAsianLeak] = useState<boolean>(false)

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const currentPoint = SAMPLE_EQUITY[hoveredIndex] || SAMPLE_EQUITY[SAMPLE_EQUITY.length - 1]

  const totalReturnDisplay = hideAsianLeak ? '+$44,920' : '+$35,800'
  const totalRDisplay = hideAsianLeak ? '+45.3 R' : '+35.8 R'
  const winRateDisplay = hideAsianLeak ? '65.8%' : '59.2%'
  const profitFactorDisplay = hideAsianLeak ? '2.54' : '2.18'

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 selection:bg-[#1DB954]/20 selection:text-[#1DB954] cursor-pointer">
      <Navbar />

      <main className="cursor-pointer">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden cursor-pointer">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#1DB954" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 cursor-pointer">
            <div className="text-center max-w-4xl mx-auto cursor-pointer">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 text-[#1DB954] text-xs font-semibold tracking-wide uppercase mb-6 cursor-pointer hover:bg-[#1DB954]/20 transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                Edge Quantification Engine
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight cursor-pointer">
                Institutional Analytics For{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DB954] to-emerald-300">
                  Precision Traders
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed cursor-pointer">
                Stop guessing your true edge. Deconstruct every trade by session timing, risk multiple distribution, drawdown velocity, and setup expectancy with institutional rigor.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 cursor-pointer">
                {HAS_CLERK ? (
                  <>
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <button
                          type="button"
                          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                        >
                          Explore Live Analytics
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <Link
                        to="/app/analytics"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Open In App Analytics
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </SignedIn>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    Launch Trading Terminal
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
                <a
                  href="#simulator"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#1DB954]" />
                  Interactive Curve Simulator
                </a>
              </div>
            </div>

            {/* Quick Metrics Strip */}
            <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto cursor-pointer">
              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#141414]/90 backdrop-blur-sm cursor-pointer hover:border-zinc-700 transition-colors">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                  Average Risk Multiple
                </span>
                <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                  <span>+2.45 R</span>
                  <span className="text-xs font-semibold text-[#1DB954]">Top 5%</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Measured across verified fills</p>
              </div>

              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#141414]/90 backdrop-blur-sm cursor-pointer hover:border-zinc-700 transition-colors">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                  Profit Factor
                </span>
                <div className="text-2xl font-bold text-[#1DB954] flex items-baseline gap-2">
                  <span>2.84</span>
                  <span className="text-xs font-semibold text-zinc-400">NY Open</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Gross wins divided by losses</p>
              </div>

              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#141414]/90 backdrop-blur-sm cursor-pointer hover:border-zinc-700 transition-colors">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                  Peak Drawdown
                </span>
                <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                  <span>2.1%</span>
                  <span className="text-xs font-semibold text-emerald-400">Controlled</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Protected under strict stops</p>
              </div>

              <div className="p-5 rounded-2xl border border-zinc-800/80 bg-[#141414]/90 backdrop-blur-sm cursor-pointer hover:border-zinc-700 transition-colors">
                <span className="text-xs uppercase tracking-wider text-zinc-500 font-semibold block mb-1">
                  Win Rate Consistency
                </span>
                <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                  <span>64.2%</span>
                  <span className="text-xs font-semibold text-[#1DB954]">Edge Intact</span>
                </div>
                <p className="text-xs text-zinc-400 mt-2">Across 350 executed trades</p>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Equity Simulator */}
        <section id="simulator" className="py-20 border-t border-zinc-900 bg-[#0E0E0E] relative cursor-pointer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 cursor-pointer">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1DB954] block mb-2">
                  Interactive Equity Simulator
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight cursor-pointer">
                  See Your Pure Edge Without Distortions
                </h2>
                <p className="text-zinc-400 mt-2 max-w-xl text-sm sm:text-base">
                  Toggle between Cash PnL and Normalized Risk Multiple to verify whether your account growth comes from genuine statistical edge or position sizing spikes.
                </p>
              </div>

              {/* Mode Controls */}
              <div className="flex flex-wrap items-center gap-3 cursor-pointer">
                <div className="inline-flex p-1 rounded-xl bg-zinc-900 border border-zinc-800 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setMetricMode('rMultiple')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      metricMode === 'rMultiple'
                        ? 'bg-[#1DB954] text-black shadow-md shadow-[#1DB954]/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Risk Multiple (R)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMetricMode('dollar')}
                    className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      metricMode === 'dollar'
                        ? 'bg-[#1DB954] text-black shadow-md shadow-[#1DB954]/20'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    Cash Realized ($)
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setHideAsianLeak(!hideAsianLeak)}
                  className={`px-4 py-2 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                    hideAsianLeak
                      ? 'border-[#1DB954] bg-[#1DB954]/10 text-[#1DB954]'
                      : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Filter className="w-3.5 h-3.5" />
                  {hideAsianLeak ? 'Asian Leak Filtered' : 'Filter Asian Session Leak'}
                </button>
              </div>
            </div>

            {/* Main Interactive Chart Card */}
            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-[#141414] shadow-2xl relative overflow-hidden cursor-pointer">
              {/* Header inside Chart */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-zinc-800/80 mb-6 cursor-pointer">
                <div className="flex items-center gap-6">
                  <div>
                    <span className="text-xs text-zinc-500 font-medium block">Total Performance</span>
                    <div className="text-2xl font-bold text-white mt-0.5">
                      {metricMode === 'rMultiple' ? totalRDisplay : totalReturnDisplay}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-zinc-800" />
                  <div>
                    <span className="text-xs text-zinc-500 font-medium block">Win Rate</span>
                    <div className="text-2xl font-bold text-[#1DB954] mt-0.5">{winRateDisplay}</div>
                  </div>
                  <div className="h-8 w-px bg-zinc-800" />
                  <div>
                    <span className="text-xs text-zinc-500 font-medium block">Profit Factor</span>
                    <div className="text-2xl font-bold text-white mt-0.5">{profitFactorDisplay}</div>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-lg border border-zinc-800 flex items-center gap-2">
                  <Activity className="w-3.5 h-3.5 text-[#1DB954]" />
                  Hover over bars to inspect trade execution details
                </div>
              </div>

              {/* Synthetic Visual Chart Bars */}
              <div className="h-64 sm:h-72 w-full flex items-end gap-2 sm:gap-3 pt-8 pb-4 relative cursor-pointer">
                {SAMPLE_EQUITY.map((pt, idx) => {
                  const maxR = 40
                  const heightPercent = Math.max(12, Math.min(100, (pt.rMultiple / maxR) * 100))
                  const isHovered = hoveredIndex === idx
                  const isLeak = pt.session === 'Asian' && hideAsianLeak

                  return (
                    <div
                      key={pt.trade}
                      onMouseEnter={() => setHoveredIndex(idx)}
                      className="flex-1 flex flex-col items-center h-full justify-end group relative cursor-pointer"
                    >
                      {/* Bar */}
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-200 cursor-pointer ${
                          isLeak
                            ? 'opacity-20 bg-zinc-700'
                            : isHovered
                            ? 'bg-[#1DB954] shadow-lg shadow-[#1DB954]/40 scale-105'
                            : 'bg-zinc-700/80 hover:bg-zinc-500'
                        }`}
                      />

                      {/* X label */}
                      <span className="text-[10px] text-zinc-500 mt-2 truncate w-full text-center">
                        T{pt.trade}
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Floating Inspection Card */}
              <div className="mt-6 p-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 grid grid-cols-2 sm:grid-cols-5 gap-3 cursor-pointer">
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase font-semibold block">Date</span>
                  <span className="text-sm font-bold text-white">{currentPoint.date}</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase font-semibold block">Session</span>
                  <span className="text-sm font-bold text-[#1DB954]">{currentPoint.session}</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase font-semibold block">Risk Multiple</span>
                  <span className="text-sm font-bold text-white">+{currentPoint.rMultiple.toFixed(2)} R</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase font-semibold block">Cash PnL</span>
                  <span className="text-sm font-bold text-white">+${currentPoint.dollar.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[11px] text-zinc-500 uppercase font-semibold block">Drawdown</span>
                  <span className="text-sm font-bold text-zinc-300">
                    {currentPoint.drawdownPct === 0 ? 'Peak New High' : `${currentPoint.drawdownPct}% Pullback`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Market Session Performance Grid */}
        <section className="py-20 bg-[#0A0A0A] cursor-pointer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <div className="text-center max-w-3xl mx-auto mb-16 cursor-pointer">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1DB954] block mb-2">
                Session Edge Analysis
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight cursor-pointer">
                Discover Exactly When Your Edge Is Active
              </h2>
              <p className="text-zinc-400 mt-3 text-sm sm:text-base">
                Most traders lose money not because of bad setups, but because they trade outside their golden hours. Quantyx isolates your highest expectancy sessions automatically.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cursor-pointer">
              {SESSION_METRICS.map((session) => {
                const isPrime = session.status === 'Prime Edge'
                const isLeak = session.status === 'Leak'

                return (
                  <div
                    key={session.id}
                    className={`p-6 sm:p-8 rounded-3xl border transition-all cursor-pointer ${
                      isPrime
                        ? 'border-[#1DB954]/50 bg-gradient-to-br from-[#1DB954]/5 via-[#141414] to-[#141414] shadow-xl shadow-[#1DB954]/5'
                        : isLeak
                        ? 'border-red-900/40 bg-[#141414] hover:border-red-800/60'
                        : 'border-zinc-800 bg-[#141414] hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4 mb-6 cursor-pointer">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Clock className={`w-4 h-4 ${isPrime ? 'text-[#1DB954]' : 'text-zinc-400'}`} />
                          <span className="text-xs text-zinc-400 font-medium">{session.hours}</span>
                        </div>
                        <h3 className="text-xl font-bold text-white cursor-pointer">{session.name}</h3>
                      </div>

                      <span
                        className={`text-xs px-3 py-1 rounded-full font-semibold cursor-pointer ${
                          isPrime
                            ? 'bg-[#1DB954]/20 text-[#1DB954] border border-[#1DB954]/30'
                            : isLeak
                            ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                            : 'bg-zinc-800 text-zinc-300'
                        }`}
                      >
                        {session.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-zinc-800/70 mb-4 cursor-pointer">
                      <div>
                        <span className="text-xs text-zinc-500 block">Total R</span>
                        <span className={`text-lg font-bold ${session.totalR > 0 ? 'text-[#1DB954]' : 'text-red-400'}`}>
                          {session.totalR > 0 ? `+${session.totalR} R` : `${session.totalR} R`}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500 block">Win Rate</span>
                        <span className="text-lg font-bold text-white">{session.winRate}%</span>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500 block">Profit Factor</span>
                        <span className="text-lg font-bold text-white">{session.profitFactor}</span>
                      </div>
                      <div>
                        <span className="text-xs text-zinc-500 block">Executions</span>
                        <span className="text-lg font-bold text-zinc-300">{session.tradesCount}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-zinc-400 pt-2 cursor-pointer">
                      <span>Realized Return: <strong className="text-white">{session.avgReturn}</strong></span>
                      <span className="flex items-center gap-1 text-[#1DB954]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Verified Data
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Heatmap Section */}
        <section className="py-20 border-t border-zinc-900 bg-[#0E0E0E] cursor-pointer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <div className="text-center max-w-3xl mx-auto mb-16 cursor-pointer">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1DB954] block mb-2">
                Execution Matrix
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight cursor-pointer">
                Day of Week And Hourly PnL Heatmap
              </h2>
              <p className="text-zinc-400 mt-3 text-sm sm:text-base">
                Spot recurring behavioral leaks and peak focus windows. Understand which weekdays compound your gains and which ones bleed mental capital.
              </p>
            </div>

            <div className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-[#141414] overflow-x-auto cursor-pointer">
              <div className="min-w-[640px] cursor-pointer">
                {/* Day rows */}
                <div className="grid grid-cols-6 gap-3 mb-3 text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center cursor-pointer">
                  <div className="text-left pl-2">Session Hour</div>
                  <div>Monday</div>
                  <div>Tuesday</div>
                  <div>Wednesday</div>
                  <div>Thursday</div>
                  <div>Friday</div>
                </div>

                {/* Rows */}
                {[
                  { hour: '09:00 to 10:00 EST', mon: '+4.2 R', tue: '+6.1 R', wed: '+8.4 R', thu: '+5.3 R', fri: '+3.1 R', hot: true },
                  { hour: '10:00 to 11:00 EST', mon: '+3.8 R', tue: '+4.5 R', wed: '+7.2 R', thu: '+6.0 R', fri: '+1.4 R', hot: true },
                  { hour: '11:00 to 12:00 EST', mon: '+0.5 R', tue: 'Break Even', wed: '+1.2 R', thu: 'Break Even', fri: 'Down 0.8 R', hot: false },
                  { hour: '13:00 to 14:00 EST', mon: 'Down 1.2 R', tue: '+0.8 R', wed: '+2.1 R', thu: 'Down 0.4 R', fri: 'Down 1.5 R', hot: false },
                  { hour: '14:00 to 15:30 EST', mon: '+1.5 R', tue: '+2.4 R', wed: '+3.0 R', thu: '+2.1 R', fri: '+0.2 R', hot: true },
                ].map((row, idx) => (
                  <div key={idx} className="grid grid-cols-6 gap-3 py-2 text-xs items-center text-center cursor-pointer">
                    <div className="text-left text-zinc-400 font-medium pl-2">{row.hour}</div>
                    {[row.mon, row.tue, row.wed, row.thu, row.fri].map((cell, cIdx) => {
                      const isLoss = cell.includes('Down')
                      const isEven = cell === 'Break Even'
                      return (
                        <div
                          key={cIdx}
                          className={`py-3 px-2 rounded-xl font-semibold border transition-all cursor-pointer ${
                            isLoss
                              ? 'bg-red-950/30 border-red-900/40 text-red-400 hover:border-red-700'
                              : isEven
                              ? 'bg-zinc-900/60 border-zinc-800 text-zinc-500'
                              : 'bg-[#1DB954]/15 border-[#1DB954]/30 text-[#1DB954] hover:bg-[#1DB954]/25'
                          }`}
                        >
                          {cell}
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Verified Social Shareable Trade Recap Card Generator Preview */}
        <section className="py-20 bg-[#0A0A0A] cursor-pointer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center cursor-pointer">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1DB954] block mb-2">
                  Social Proof And Transparency
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight mb-4 cursor-pointer">
                  Export Verified Trade Cards In One Click
                </h2>
                <p className="text-zinc-400 text-base leading-relaxed mb-6 cursor-pointer">
                  Share your wins and losses with genuine credibility. Quantyx watermarks verified executions with trade duration, exact risk multiple, and rule discipline badges so you can build authentic trust.
                </p>

                <div className="space-y-3 cursor-pointer">
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-[#1DB954] shrink-0" />
                    <span>Option to mask dollar balances while displaying precise R Multiple</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-[#1DB954] shrink-0" />
                    <span>Automatic execution grade and discipline checklist watermark</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-300">
                    <CheckCircle2 className="w-5 h-5 text-[#1DB954] shrink-0" />
                    <span>Direct high resolution export formatted for Twitter and Discord</span>
                  </div>
                </div>
              </div>

              {/* Sample Verified Card */}
              <div className="p-6 sm:p-8 rounded-3xl border border-[#1DB954]/40 bg-gradient-to-b from-[#181818] to-[#101010] shadow-2xl relative cursor-pointer hover:border-[#1DB954]/70 transition-all">
                <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[#1DB954]/20 border border-[#1DB954]/40 flex items-center justify-center font-bold text-[#1DB954] text-xs">
                      QX
                    </div>
                    <div>
                      <span className="text-sm font-bold text-white block">NQ Futures Long</span>
                      <span className="text-xs text-zinc-400">Oct 23 London Sweep</span>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full bg-[#1DB954]/20 border border-[#1DB954]/40 text-[#1DB954] text-xs font-semibold">
                    Verified Execution
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-6 cursor-pointer">
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Return</span>
                    <span className="text-xl font-bold text-[#1DB954]">+3.84 R</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Discipline</span>
                    <span className="text-xl font-bold text-white">Grade A</span>
                  </div>
                  <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800/80">
                    <span className="text-[11px] text-zinc-500 uppercase block font-semibold">Hold Time</span>
                    <span className="text-xl font-bold text-zinc-300">42 Min</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#141414] border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                  <span>Entry: 20450.50</span>
                  <span>Stop: 20435.00</span>
                  <span>Exit: 20510.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 border-t border-zinc-900 bg-gradient-to-b from-[#0A0A0A] to-[#121212] text-center cursor-pointer">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 cursor-pointer">
              Quantify Your True Trading Edge Today
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto cursor-pointer">
              Join elite traders who rely on mathematical precision rather than emotions. Start logging and analyzing your execution today.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 cursor-pointer">
              {HAS_CLERK ? (
                <>
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button
                        type="button"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Start Free Trial
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      to="/app/analytics"
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Access Analytics Dashboard
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Access Analytics Terminal
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                to="/features"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Explore All Platform Features
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
