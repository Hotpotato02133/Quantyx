import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Spotlight } from '@/components/ui/aceternity/Spotlight'
import {
  Zap,
  TrendingUp,
  Table,
  Command,
  Eye,
  Layers,
  FileSpreadsheet,
  Check,
  ArrowRight,
  Sparkles,
  Sliders,
} from 'lucide-react'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

interface FeatureCard {
  id: string
  title: string
  category: 'sync' | 'risk' | 'grid' | 'accounts'
  icon: typeof Zap
  badge: string
  description: string
  highlight: string
  details: string[]
}

const ALL_FEATURES: FeatureCard[] = [
  {
    id: 'risk-engine',
    title: 'Automated Risk Multiple Math',
    category: 'risk',
    icon: TrendingUp,
    badge: 'Core Engine',
    description:
      'Quantyx computes your exact risk multiple by comparing realized dollar profit against initial cash risk based on your entry and stop loss.',
    highlight: 'Gross and Net Return with fee precision',
    details: [
      'Instant R computation across long and short positions',
      'Automatic commission and exchange fee deductions',
      'Expectancy ratio and average winner to loser sizing',
      'Account equity risk percentage limits audit',
    ],
  },
  {
    id: 'csv-sync',
    title: 'Instant Broker and Prop Firm Import',
    category: 'sync',
    icon: FileSpreadsheet,
    badge: 'Universal Sync',
    description:
      'Import historical trade files from top brokers and prop firm platforms in under two seconds with automated column mapping.',
    highlight: 'Zero manual transcription error',
    details: [
      'Native parsing for Apex, Topstep, FTMO, and Tradovate',
      'NinjaTrader, MetaTrader 5, and TradingView CSV formats',
      'Interactive Brokers and Thinkorswim export support',
      'Automatic duplicate trade detection and reconciliation',
    ],
  },
  {
    id: 'virtualized-grid',
    title: 'Virtualized 60 FPS Trade Grid',
    category: 'grid',
    icon: Table,
    badge: 'Extreme Speed',
    description:
      'Engineered for serious volume. Scroll through tens of thousands of trades with zero lag, instant filtering, and column customization.',
    highlight: 'Sub sixteen millisecond DOM updates',
    details: [
      'Virtualized DOM rendering handles fifty thousand rows',
      'Multi column sorting by date, symbol, PnL, and setup',
      'Fast inline editing with optimistic state updates',
      'Export filtered slices to CSV with one click',
    ],
  },
  {
    id: 'command-palette',
    title: 'Keyboard First Command Palette',
    category: 'grid',
    icon: Command,
    badge: 'Power User',
    description:
      'Press Command K to instantly switch accounts, search historical executions, jump between dates, or activate privacy blur mode.',
    highlight: 'Complete keyboard control',
    details: [
      'Fuzzy search across tags, symbols, and notes',
      'Quick navigation shortcuts for all platform views',
      'Global privacy blur toggle for streaming sessions',
      'Custom keybindings for rapid execution logging',
    ],
  },
  {
    id: 'privacy-shield',
    title: 'Streamer Privacy Shield Mode',
    category: 'grid',
    icon: Eye,
    badge: 'Live Streaming',
    description:
      'One keystroke instantly obscures sensitive financial figures, account balance totals, and broker account IDs during live streams.',
    highlight: 'Stream publicly with zero leak risk',
    details: [
      'Toggle blur across all PnL and cash figures',
      'Preserve visible win rate percentages and R multiples',
      'Mask broker account numbers and personal details',
      'Permanent privacy mode preference per device',
    ],
  },
  {
    id: 'multi-account',
    title: 'Multi Account Portfolio Aggregation',
    category: 'accounts',
    icon: Layers,
    badge: 'Scale Faster',
    description:
      'Manage multiple prop firm evaluations and personal live brokerage accounts in one unified dashboard with segregated analytics.',
    highlight: 'Separate rules for separate capital',
    details: [
      'Switch between evaluation accounts in one click',
      'Group accounts by firm, asset class, or strategy',
      'Aggregated equity curve across all active accounts',
      'Independent drawdown threshold alerts per account',
    ],
  },
]

export default function FeaturesPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'sync' | 'risk' | 'grid' | 'accounts'>('all')

  // Interactive Live Calculator state
  const [calcEntry, setCalcEntry] = useState(21400)
  const [calcStop, setCalcStop] = useState(21375)
  const [calcExit, setCalcExit] = useState(21475)
  const [calcContracts, setCalcContracts] = useState(2)

  const riskPerContract = Math.max(1, Math.abs(calcEntry - calcStop))
  const gainPerContract = calcExit - calcEntry
  const totalRiskDollars = riskPerContract * 20 * calcContracts
  const totalReturnDollars = gainPerContract * 20 * calcContracts
  const calculatedR = totalRiskDollars > 0 ? (totalReturnDollars / totalRiskDollars).toFixed(2) : '0.00'

  useEffect(() => {
    document.title = 'Features | Quantyx Precision Trade Journal'
  }, [])

  const filteredFeatures = activeCategory === 'all'
    ? ALL_FEATURES
    : ALL_FEATURES.filter((f) => f.category === activeCategory)

  return (
    <div className="landing-page min-h-screen bg-[#0A0A0A] text-[#FAFAFA] selection:bg-emerald-500/20 selection:text-emerald-300 overflow-x-hidden font-sans cursor-pointer">
      <Navbar />

      <main className="cursor-pointer pt-32 sm:pt-36 pb-20">
        {/* Hero Section */}
        <section className="relative px-4 sm:px-6 max-w-6xl mx-auto text-center cursor-pointer">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />

          <div className="relative z-10 cursor-pointer">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-[#141414]/90 backdrop-blur-md text-xs font-medium text-emerald-400 mb-6 cursor-pointer">
              <Zap className="w-3.5 h-3.5 cursor-pointer" />
              <span className="cursor-pointer">Platform Architecture • Millisecond Precision</span>
            </div>

            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-400 max-w-4xl mx-auto leading-[1.08] cursor-pointer">
              Every tool precision built for institutional trading edge
            </h1>

            <p className="mt-6 text-base sm:text-lg text-zinc-400 text-center max-w-2xl mx-auto font-normal leading-relaxed cursor-pointer">
              From instantaneous broker CSV parsing to automated risk multiple calculations, explore how Quantyx eliminates logging friction and elevates your execution consistency.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8 cursor-pointer">
              {HAS_CLERK ? (
                <>
                  <SignedIn>
                    <Link
                      to="/dashboard"
                      className="relative inline-flex p-[1.5px] overflow-hidden rounded-xl group hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl cursor-pointer"
                    >
                      <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1DB954_0%,#3b82f6_25%,transparent_50%,#1DB954_100%)] cursor-pointer" />
                      <div className="relative z-10 flex items-center gap-2 bg-white px-7 py-3.5 rounded-[10.5px] text-sm font-semibold text-black hover:bg-zinc-100 transition-colors cursor-pointer">
                        <span className="cursor-pointer">Go to Dashboard</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform cursor-pointer" />
                      </div>
                    </Link>
                  </SignedIn>
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="relative inline-flex p-[1.5px] overflow-hidden rounded-xl group hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl cursor-pointer">
                        <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1DB954_0%,#3b82f6_25%,transparent_50%,#1DB954_100%)] cursor-pointer" />
                        <div className="relative z-10 flex items-center gap-2 bg-white px-7 py-3.5 rounded-[10.5px] text-sm font-semibold text-black hover:bg-zinc-100 transition-colors cursor-pointer">
                          <span className="cursor-pointer">Launch Your Journal Free</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform cursor-pointer" />
                        </div>
                      </button>
                    </SignUpButton>
                  </SignedOut>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="relative inline-flex p-[1.5px] overflow-hidden rounded-xl group hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl cursor-pointer"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1DB954_0%,#3b82f6_25%,transparent_50%,#1DB954_100%)] cursor-pointer" />
                  <div className="relative z-10 flex items-center gap-2 bg-white px-7 py-3.5 rounded-[10.5px] text-sm font-semibold text-black hover:bg-zinc-100 transition-colors cursor-pointer">
                    <span className="cursor-pointer">Launch Your Journal Free</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform cursor-pointer" />
                  </div>
                </Link>
              )}

              <Link
                to="/analytics"
                className="inline-flex items-center gap-2 bg-[#141414] hover:bg-[#1C1C1C] text-zinc-200 border border-white/[0.08] hover:border-white/[0.18] px-6 py-3.5 rounded-xl text-sm font-medium transition-all shadow-sm cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-400 cursor-pointer" />
                <span className="cursor-pointer">Explore Analytics Engine</span>
              </Link>
            </div>

            {/* Quick Stat Highlights */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-14 max-w-4xl mx-auto pt-8 border-t border-white/[0.06] cursor-pointer text-left">
              <div className="p-3 rounded-xl bg-[#121212] border border-white/[0.04] cursor-pointer">
                <div className="text-xl font-bold font-mono text-white cursor-pointer">10+ Brokers</div>
                <div className="text-xs text-zinc-400 mt-1 cursor-pointer">Native CSV sync formats</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121212] border border-white/[0.04] cursor-pointer">
                <div className="text-xl font-bold font-mono text-emerald-400 cursor-pointer">16ms Latency</div>
                <div className="text-xs text-zinc-400 mt-1 cursor-pointer">Optimistic local UI state</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121212] border border-white/[0.04] cursor-pointer">
                <div className="text-xl font-bold font-mono text-white cursor-pointer">Row Security</div>
                <div className="text-xs text-zinc-400 mt-1 cursor-pointer">Isolated database storage</div>
              </div>
              <div className="p-3 rounded-xl bg-[#121212] border border-white/[0.04] cursor-pointer">
                <div className="text-xl font-bold font-mono text-white cursor-pointer">100% Free</div>
                <div className="text-xs text-zinc-400 mt-1 cursor-pointer">No credit card required</div>
              </div>
            </div>
          </div>
        </section>

        {/* Interactive Feature Category Tabs */}
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-20 cursor-pointer">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8 cursor-pointer">
            <div className="cursor-pointer">
              <h2 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight cursor-pointer">
                Capabilities Architecture
              </h2>
              <p className="text-xs sm:text-sm text-zinc-400 mt-1 cursor-pointer">
                Filter features by workflow domain or explore the complete system.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 bg-[#141414] p-1.5 rounded-xl border border-white/[0.06] cursor-pointer">
              {[
                { id: 'all', label: 'All Features' },
                { id: 'risk', label: 'Risk Math' },
                { id: 'sync', label: 'Execution Sync' },
                { id: 'grid', label: 'Speed & Grid' },
                { id: 'accounts', label: 'Account Scaling' },
              ].map((tab) => {
                const isActive = activeCategory === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveCategory(tab.id as typeof activeCategory)}
                    className={`text-xs px-3 py-1.5 rounded-lg transition-all cursor-pointer font-medium ${
                      isActive
                        ? 'bg-white text-black font-semibold shadow-sm'
                        : 'text-zinc-400 hover:text-white hover:bg-white/[0.04]'
                    }`}
                  >
                    {tab.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Feature Grid Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 cursor-pointer">
            {filteredFeatures.map((feat) => {
              const Icon = feat.icon
              return (
                <div
                  key={feat.id}
                  className="rounded-2xl bg-[#141414] border border-white/[0.07] hover:border-white/[0.16] p-6 flex flex-col justify-between transition-all duration-200 group cursor-pointer hover:shadow-xl hover:-translate-y-0.5"
                >
                  <div className="cursor-pointer">
                    <div className="flex items-center justify-between mb-4 cursor-pointer">
                      <div className="w-10 h-10 rounded-xl bg-[#1C1C1C] border border-white/[0.06] flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform cursor-pointer">
                        <Icon className="w-5 h-5 cursor-pointer" />
                      </div>
                      <span className="text-[11px] font-mono font-medium text-zinc-400 bg-white/[0.04] px-2.5 py-0.5 rounded-full border border-white/[0.06] cursor-pointer">
                        {feat.badge}
                      </span>
                    </div>

                    <h3 className="text-lg font-semibold text-white tracking-tight cursor-pointer">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-zinc-400 mt-2 leading-relaxed cursor-pointer">
                      {feat.description}
                    </p>

                    <div className="mt-4 p-2.5 rounded-lg bg-[#0F0F0F] border border-white/[0.04] text-[11px] font-mono text-emerald-400 cursor-pointer">
                      {feat.highlight}
                    </div>

                    <ul className="mt-5 space-y-2 text-xs text-zinc-300 cursor-pointer border-t border-white/[0.06] pt-4">
                      {feat.details.map((d) => (
                        <li key={d} className="flex items-start gap-2 cursor-pointer">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5 cursor-pointer" />
                          <span className="cursor-pointer">{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* Live Risk Multiple Simulator Widget */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-24 cursor-pointer">
          <div className="rounded-3xl bg-gradient-to-b from-[#181818] to-[#121212] border border-white/[0.1] p-6 sm:p-10 shadow-2xl cursor-pointer">
            <div className="flex flex-col lg:flex-row gap-8 items-center cursor-pointer">
              <div className="lg:w-1/2 space-y-4 cursor-pointer">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20 cursor-pointer">
                  <Sliders className="w-3.5 h-3.5 cursor-pointer" />
                  <span>Interactive Math Engine</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight cursor-pointer">
                  Test the real time risk multiple calculator
                </h3>
                <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed cursor-pointer">
                  Adjust entry, stop loss, and exit targets. Notice how Quantyx continuously normalizes cash profit into true statistical expectancy.
                </p>

                {/* Input Controls */}
                <div className="space-y-3 pt-2 cursor-pointer font-mono text-xs">
                  <div className="flex justify-between items-center bg-[#1A1A1A] p-2.5 rounded-xl border border-white/[0.06] cursor-pointer">
                    <span className="text-zinc-400 cursor-pointer">Entry Price</span>
                    <input
                      type="number"
                      value={calcEntry}
                      onChange={(e) => setCalcEntry(Number(e.target.value))}
                      className="w-24 bg-[#242424] text-white text-right px-2 py-1 rounded border border-white/[0.08] focus:outline-none focus:border-emerald-400 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-[#1A1A1A] p-2.5 rounded-xl border border-white/[0.06] cursor-pointer">
                    <span className="text-zinc-400 cursor-pointer">Stop Loss</span>
                    <input
                      type="number"
                      value={calcStop}
                      onChange={(e) => setCalcStop(Number(e.target.value))}
                      className="w-24 bg-[#242424] text-white text-right px-2 py-1 rounded border border-white/[0.08] focus:outline-none focus:border-emerald-400 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-[#1A1A1A] p-2.5 rounded-xl border border-white/[0.06] cursor-pointer">
                    <span className="text-zinc-400 cursor-pointer">Exit Target</span>
                    <input
                      type="number"
                      value={calcExit}
                      onChange={(e) => setCalcExit(Number(e.target.value))}
                      className="w-24 bg-[#242424] text-white text-right px-2 py-1 rounded border border-white/[0.08] focus:outline-none focus:border-emerald-400 cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between items-center bg-[#1A1A1A] p-2.5 rounded-xl border border-white/[0.06] cursor-pointer">
                    <span className="text-zinc-400 cursor-pointer">Contracts Size</span>
                    <input
                      type="number"
                      value={calcContracts}
                      onChange={(e) => setCalcContracts(Math.max(1, Number(e.target.value)))}
                      className="w-24 bg-[#242424] text-white text-right px-2 py-1 rounded border border-white/[0.08] focus:outline-none focus:border-emerald-400 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Calculator Output Display */}
              <div className="lg:w-1/2 w-full bg-[#0D0D0D] border border-white/[0.08] rounded-2xl p-6 sm:p-8 flex flex-col justify-between space-y-6 cursor-pointer">
                <div className="flex items-center justify-between border-b border-white/[0.06] pb-3 text-xs cursor-pointer">
                  <span className="text-zinc-400 font-medium cursor-pointer">NQ Futures Calculation</span>
                  <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded cursor-pointer">
                    Normalized
                  </span>
                </div>

                <div className="space-y-4 cursor-pointer">
                  <div className="bg-[#141414] p-4 rounded-xl border border-white/[0.04] cursor-pointer">
                    <span className="text-[11px] text-zinc-400 block cursor-pointer">Calculated Risk Multiple</span>
                    <div className="text-4xl font-bold font-mono text-emerald-400 mt-1 cursor-pointer">
                      +{calculatedR}R
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 cursor-pointer">
                    <div className="bg-[#141414] p-3.5 rounded-xl border border-white/[0.04] cursor-pointer">
                      <span className="text-[11px] text-zinc-400 block cursor-pointer">Total Dollar Risk</span>
                      <div className="text-lg font-bold font-mono text-white mt-0.5 cursor-pointer">
                        ${totalRiskDollars.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-[#141414] p-3.5 rounded-xl border border-white/[0.04] cursor-pointer">
                      <span className="text-[11px] text-zinc-400 block cursor-pointer">Total Dollar Gain</span>
                      <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5 cursor-pointer">
                        +${totalReturnDollars.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-zinc-500 font-mono text-center pt-2 cursor-pointer">
                  Quantyx logs this metric automatically on every execution entry.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mt-24 cursor-pointer">
          <div className="text-center max-w-2xl mx-auto mb-12 cursor-pointer">
            <h2 className="text-2xl sm:text-4xl font-semibold text-white tracking-tight cursor-pointer">
              Why serious traders choose Quantyx
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-zinc-400 cursor-pointer">
              Engineered specifically for the demands of modern prop firm evaluation and funded account scaling.
            </p>
          </div>

          <div className="rounded-2xl bg-[#141414] border border-white/[0.08] overflow-hidden shadow-2xl cursor-pointer">
            <div className="overflow-x-auto cursor-pointer">
              <table className="w-full text-left text-xs cursor-pointer border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.08] bg-[#181818] text-zinc-400 font-medium">
                    <th className="py-4 px-6 text-white font-semibold">Capability</th>
                    <th className="py-4 px-6 text-emerald-400 font-semibold font-mono">Quantyx</th>
                    <th className="py-4 px-6">Generic Spreadsheets</th>
                    <th className="py-4 px-6">Legacy Journals</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] font-mono text-zinc-300">
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6 font-sans text-white font-medium">Broker CSV Parsing Speed</td>
                    <td className="py-3.5 px-6 text-emerald-400 font-bold">&lt; 2 Seconds</td>
                    <td className="py-3.5 px-6 text-zinc-500">Manual copy paste</td>
                    <td className="py-3.5 px-6 text-zinc-500">1 to 2 minutes</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6 font-sans text-white font-medium">Risk Multiple Normalization</td>
                    <td className="py-3.5 px-6 text-emerald-400 font-bold">Native Automatic</td>
                    <td className="py-3.5 px-6 text-zinc-500">Complex custom math</td>
                    <td className="py-3.5 px-6 text-zinc-500">Limited or paid add on</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6 font-sans text-white font-medium">Live Stream Privacy Blur</td>
                    <td className="py-3.5 px-6 text-emerald-400 font-bold">One Key ⌘B</td>
                    <td className="py-3.5 px-6 text-rose-500">None</td>
                    <td className="py-3.5 px-6 text-rose-500">None</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6 font-sans text-white font-medium">UI Latency & Responsiveness</td>
                    <td className="py-3.5 px-6 text-emerald-400 font-bold">16ms Optimistic</td>
                    <td className="py-3.5 px-6 text-zinc-500">Laggy above 1000 rows</td>
                    <td className="py-3.5 px-6 text-zinc-500">Frequent page refreshes</td>
                  </tr>
                  <tr className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-6 font-sans text-white font-medium">Row Level Data Isolation</td>
                    <td className="py-3.5 px-6 text-emerald-400 font-bold">Yes (PostgreSQL RLS)</td>
                    <td className="py-3.5 px-6 text-zinc-500">Unencrypted local file</td>
                    <td className="py-3.5 px-6 text-zinc-500">Varies</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
