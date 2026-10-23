import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Spotlight } from '@/components/ui/aceternity/Spotlight'
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Sliders,
  Target,
  Brain,
  Award,
  ChevronRight,
} from 'lucide-react'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

interface PlaybookCard {
  id: string
  title: string
  category: 'sweep' | 'breakout' | 'fvg' | 'trend'
  market: string
  winRate: number
  avgR: string
  tradesCount: number
  description: string
  rules: string[]
  invalidation: string
}

const PLAYBOOKS_DATA: PlaybookCard[] = [
  {
    id: 'london-sweep',
    title: 'London Session Liquidity Sweep',
    category: 'sweep',
    market: 'EURUSD / NQ Futures',
    winRate: 71.4,
    avgR: '+3.20 R',
    tradesCount: 88,
    description:
      'Sweep of Asian session high or low during the London open session expansion, followed by immediate market structure shift on the five minute timeframe.',
    rules: [
      'Asian session high or low breached between 02:30 and 04:00 EST',
      'Five minute displacement candle closes back inside the range',
      'Entry on fair value gap retest with stop at the swing extreme',
      'First scale at 2R and runner targeting opposing session liquidity',
    ],
    invalidation: 'Five minute candle close beyond the sweep wick extreme',
  },
  {
    id: 'silver-bullet',
    title: 'Silver Bullet Fair Value Gap',
    category: 'fvg',
    market: 'NQ / ES Futures',
    winRate: 69.2,
    avgR: '+3.50 R',
    tradesCount: 114,
    description:
      'High momentum institutional delivery window between 10:00 and 11:00 EST. Targets clear liquidity pools created in the early morning session.',
    rules: [
      'Time window strictly between 10:00 and 11:00 EST',
      'Previous hourly high or low swept with aggressive displacement',
      'Clean three candle imbalance formed on one minute or two minute chart',
      'Limit order placed at fifty percent equilibrium of the imbalance',
    ],
    invalidation: 'Price prints clean close beyond opposing swing structure',
  },
  {
    id: 'orb-retest',
    title: 'Opening Range Breakout Retest',
    category: 'breakout',
    market: 'SPY / QQQ / Tech Equities',
    winRate: 64.8,
    avgR: '+2.85 R',
    tradesCount: 96,
    description:
      'Fifteen minute opening range established after the cash open. Trade the first confirmed pullback after an initial impulsive breakout.',
    rules: [
      'Define high and low between 09:30 and 09:45 EST',
      'Impulsive fifteen minute candle close outside the opening range',
      'Wait for low volume retest of the broken level',
      'Stop loss placed at midpoint of the breakout candle',
    ],
    invalidation: 'Acceptance back inside the original fifteen minute range',
  },
  {
    id: 'trend-pullback',
    title: 'Higher Timeframe Trend Continuation',
    category: 'trend',
    market: 'Forex / Indices / Crypto',
    winRate: 62.0,
    avgR: '+3.90 R',
    tradesCount: 76,
    description:
      'Aligning with the four hour directional bias and entering on fifteen minute order block mitigation inside a premium discount zone.',
    rules: [
      'Four hour trend direction confirmed by consecutive higher highs or lows',
      'Price retraces into deep discount or premium below fifty percent fib',
      'Fifteen minute change of character with expanding volume',
      'Minimum three to one reward to risk profile before entry approval',
    ],
    invalidation: 'Break of four hour key structural swing point',
  },
]

export default function PublicPlaybooksPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [checklist, setChecklist] = useState<Record<string, boolean>>({
    rule1: true,
    rule2: true,
    rule3: true,
    rule4: false,
    rule5: true,
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const toggleCheck = (key: string) => {
    setChecklist((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const checkedCount = Object.values(checklist).filter(Boolean).length
  const complianceScore = Math.round((checkedCount / 5) * 100)

  let gradeText = 'Grade A Setup'
  let gradeColor = 'text-[#1DB954]'
  let expectancyText = '+3.40 R Expectancy'
  let badgeColor = 'bg-[#1DB954]/20 border-[#1DB954]/40 text-[#1DB954]'

  if (complianceScore < 60) {
    gradeText = 'Grade F Execution'
    gradeColor = 'text-red-400'
    expectancyText = 'Negative 1.80 R Expectancy'
    badgeColor = 'bg-red-500/20 border-red-500/40 text-red-400'
  } else if (complianceScore < 80) {
    gradeText = 'Grade C Setup'
    gradeColor = 'text-amber-400'
    expectancyText = '+0.80 R Expectancy'
    badgeColor = 'bg-amber-500/20 border-amber-500/40 text-amber-400'
  }

  const filteredPlaybooks =
    selectedCategory === 'all'
      ? PLAYBOOKS_DATA
      : PLAYBOOKS_DATA.filter((p) => p.category === selectedCategory)

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
                Systematic Strategy Engine
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight cursor-pointer">
                Turn Random Trading Into{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DB954] to-emerald-300">
                  Systematic Edge Execution
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed cursor-pointer">
                Document your setups with exact entry conditions, stop criteria, and target logic. Track compliance grades and eliminate psychological leaks before they cost you capital.
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
                          Build Your Playbook Free
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </SignUpButton>
                    </SignedOut>
                    <SignedIn>
                      <Link
                        to="/app/playbooks"
                        className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                      >
                        Open In App Playbooks
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
                  href="#auditor"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sliders className="w-4 h-4 text-[#1DB954]" />
                  Try Rule Compliance Auditor
                </a>
              </div>
            </div>

            {/* Value Pillars */}
            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto cursor-pointer">
              <div className="p-6 rounded-2xl border border-zinc-800 bg-[#141414] cursor-pointer hover:border-zinc-700 transition-colors">
                <Target className="w-8 h-8 text-[#1DB954] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 cursor-pointer">Strict Entry Criteria</h3>
                <p className="text-sm text-zinc-400 leading-relaxed cursor-pointer">
                  Never enter on impulse again. Codify your setups with required timeframe confluence, liquidity prerequisites, and execution triggers.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-800 bg-[#141414] cursor-pointer hover:border-zinc-700 transition-colors">
                <Award className="w-8 h-8 text-[#1DB954] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 cursor-pointer">Execution Quality Grades</h3>
                <p className="text-sm text-zinc-400 leading-relaxed cursor-pointer">
                  Quantyx scores every closed position on how well you followed your rules rather than whether the trade won or lost money.
                </p>
              </div>

              <div className="p-6 rounded-2xl border border-zinc-800 bg-[#141414] cursor-pointer hover:border-zinc-700 transition-colors">
                <Brain className="w-8 h-8 text-[#1DB954] mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 cursor-pointer">Psychological Leak Isolation</h3>
                <p className="text-sm text-zinc-400 leading-relaxed cursor-pointer">
                  Measure the exact dollar and risk multiple cost of FOMO entries, premature profit taking, and expanding stop losses.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Strategy Library Showcase */}
        <section className="py-20 border-t border-zinc-900 bg-[#0E0E0E] cursor-pointer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 cursor-pointer">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#1DB954] block mb-2">
                  Strategy Library
                </span>
                <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight cursor-pointer">
                  Battle Tested Setup Blueprints
                </h2>
                <p className="text-zinc-400 mt-2 max-w-xl text-sm sm:text-base cursor-pointer">
                  Explore how top performing traders structure their setups inside Quantyx. Select any category to view verified rules and expectancy stats.
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 cursor-pointer">
                {[
                  { id: 'all', label: 'All Setups' },
                  { id: 'sweep', label: 'Liquidity Sweep' },
                  { id: 'fvg', label: 'Fair Value Gap' },
                  { id: 'breakout', label: 'Opening Range' },
                  { id: 'trend', label: 'Trend Pullback' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat.id
                        ? 'bg-[#1DB954] text-black shadow-md shadow-[#1DB954]/20'
                        : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Playbook Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 cursor-pointer">
              {filteredPlaybooks.map((playbook) => (
                <div
                  key={playbook.id}
                  className="p-6 sm:p-8 rounded-3xl border border-zinc-800 bg-[#141414] hover:border-zinc-700 transition-all cursor-pointer flex flex-col justify-between"
                >
                  <div className="cursor-pointer">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider block mb-1">
                          {playbook.market}
                        </span>
                        <h3 className="text-xl font-bold text-white cursor-pointer">{playbook.title}</h3>
                      </div>
                      <span className="px-3 py-1 rounded-full bg-[#1DB954]/15 border border-[#1DB954]/30 text-[#1DB954] text-xs font-semibold shrink-0">
                        {playbook.avgR}
                      </span>
                    </div>

                    <p className="text-sm text-zinc-400 mb-6 leading-relaxed cursor-pointer">
                      {playbook.description}
                    </p>

                    {/* Stats strip */}
                    <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 mb-6 cursor-pointer">
                      <div>
                        <span className="text-[11px] text-zinc-500 block uppercase font-semibold">Win Rate</span>
                        <span className="text-base font-bold text-[#1DB954]">{playbook.winRate}%</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-500 block uppercase font-semibold">Executions</span>
                        <span className="text-base font-bold text-white">{playbook.tradesCount}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-zinc-500 block uppercase font-semibold">Edge Quality</span>
                        <span className="text-base font-bold text-white">Elite</span>
                      </div>
                    </div>

                    {/* Checklist rules preview */}
                    <div className="space-y-2 mb-6 cursor-pointer">
                      <span className="text-xs uppercase tracking-wider font-semibold text-zinc-500 block mb-2">
                        Execution Checklist
                      </span>
                      {playbook.rules.map((rule, rIdx) => (
                        <div key={rIdx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                          <CheckCircle2 className="w-4 h-4 text-[#1DB954] shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t border-zinc-800 text-xs text-zinc-400 flex items-center justify-between cursor-pointer">
                    <span className="text-zinc-500">
                      Invalidation: <strong className="text-zinc-300 font-medium">{playbook.invalidation}</strong>
                    </span>
                    <ChevronRight className="w-4 h-4 text-zinc-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Interactive Discipline Score Auditor */}
        <section id="auditor" className="py-20 bg-[#0A0A0A] cursor-pointer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <div className="text-center max-w-3xl mx-auto mb-16 cursor-pointer">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1DB954] block mb-2">
                Live Audit Simulation
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight cursor-pointer">
                Interactive Rule Compliance Auditor
              </h2>
              <p className="text-zinc-400 mt-3 text-sm sm:text-base cursor-pointer">
                Test how discipline directly influences your statistical expectancy. Toggle rules on and off below to see your execution grade and projected return update instantly.
              </p>
            </div>

            <div className="max-w-4xl mx-auto p-6 sm:p-10 rounded-3xl border border-zinc-800 bg-[#141414] shadow-2xl cursor-pointer">
              {/* Score header */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-800 cursor-pointer">
                <div>
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1">
                    Calculated Execution Quality
                  </span>
                  <div className="flex items-center gap-3">
                    <span className={`text-3xl sm:text-4xl font-bold ${gradeColor}`}>{gradeText}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badgeColor}`}>
                      {complianceScore}% Compliance
                    </span>
                  </div>
                </div>

                <div className="text-right sm:text-right w-full sm:w-auto">
                  <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider block mb-1">
                    Projected Mathematical Edge
                  </span>
                  <span className="text-2xl font-bold text-white block">{expectancyText}</span>
                </div>
              </div>

              {/* Toggable checklist */}
              <div className="mt-8 space-y-3 cursor-pointer">
                {[
                  { key: 'rule1', label: 'Waited for confirmed higher timeframe candle close before entry' },
                  { key: 'rule2', label: 'Stop loss placed strictly at structural invalidation level' },
                  { key: 'rule3', label: 'Target set to minimum two to one reward to risk ratio' },
                  { key: 'rule4', label: 'Zero contracts added while position was in unrealized drawdown' },
                  { key: 'rule5', label: 'Zero revenge trades initiated within sixty minutes of a stop out' },
                ].map((item) => {
                  const isChecked = checklist[item.key]
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleCheck(item.key)}
                      className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 cursor-pointer ${
                        isChecked
                          ? 'border-[#1DB954]/40 bg-[#1DB954]/5 text-white'
                          : 'border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center gap-3 cursor-pointer">
                        <div
                          className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                            isChecked ? 'bg-[#1DB954] text-black' : 'border border-zinc-700 bg-zinc-800'
                          }`}
                        >
                          {isChecked && <CheckCircle2 className="w-4 h-4" />}
                        </div>
                        <span className="text-sm font-medium">{item.label}</span>
                      </div>

                      <span className="text-xs font-semibold text-zinc-500">
                        {isChecked ? '+20 Pts' : '0 Pts'}
                      </span>
                    </div>
                  )
                })}
              </div>

              <div className="mt-8 p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 flex items-center justify-between">
                <span>Rule based trading separates professionals from gamblers.</span>
                <span className="text-[#1DB954] font-semibold">Active Quantyx Audit Engine</span>
              </div>
            </div>
          </div>
        </section>

        {/* Psychology Leak Detector */}
        <section className="py-20 border-t border-zinc-900 bg-[#0E0E0E] cursor-pointer">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <div className="text-center max-w-3xl mx-auto mb-16 cursor-pointer">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1DB954] block mb-2">
                Psychological Leak Detector
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight cursor-pointer">
                The True Cost Of Emotional Trading
              </h2>
              <p className="text-zinc-400 mt-3 text-sm sm:text-base cursor-pointer">
                Quantyx detects when emotional lapses distort your edge. Quantify how much capital you save by adhering strictly to your rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 cursor-pointer">
              <div className="p-6 rounded-3xl border border-zinc-800 bg-[#141414] cursor-pointer hover:border-zinc-700 transition-colors">
                <AlertTriangle className="w-6 h-6 text-amber-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Premature Profit Taking</h3>
                <span className="text-xs text-red-400 font-semibold block mb-2">Loss of 1.6 R per winner</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Closing winning runners too early out of fear caps your upside and destroys your overall reward to risk ratio.
                </p>
              </div>

              <div className="p-6 rounded-3xl border border-zinc-800 bg-[#141414] cursor-pointer hover:border-zinc-700 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Moving Stop Losses</h3>
                <span className="text-xs text-red-400 font-semibold block mb-2">Loss of 2.4 R on average</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Widening a stop loss when price nears invalidation turns a planned one R loss into an account damaging catastrophe.
                </p>
              </div>

              <div className="p-6 rounded-3xl border border-zinc-800 bg-[#141414] cursor-pointer hover:border-zinc-700 transition-colors">
                <AlertTriangle className="w-6 h-6 text-amber-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">Revenge Sizing</h3>
                <span className="text-xs text-red-400 font-semibold block mb-2">78% loss probability</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Entering immediate re entries with increased leverage right after a loss is the number one cause of blown prop evaluations.
                </p>
              </div>

              <div className="p-6 rounded-3xl border border-zinc-800 bg-[#141414] cursor-pointer hover:border-zinc-700 transition-colors">
                <AlertTriangle className="w-6 h-6 text-red-400 mb-3" />
                <h3 className="text-base font-bold text-white mb-1">FOMO Chasing</h3>
                <span className="text-xs text-red-400 font-semibold block mb-2">Sub optimal risk ratio</span>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Buying candles that have already expanded forty points forces an excessive stop size and eliminates any positive edge.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 border-t border-zinc-900 bg-gradient-to-b from-[#0A0A0A] to-[#121212] text-center cursor-pointer">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 cursor-pointer">
              Build Your Professional Playbook Today
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto cursor-pointer">
              Stop entering trades without a documented plan. Create your custom strategy playbook and elevate your execution consistency.
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
                        Start Documenting Setups
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </SignUpButton>
                  </SignedOut>
                  <SignedIn>
                    <Link
                      to="/app/playbooks"
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Access Playbook Terminal
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Access Playbook Terminal
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
