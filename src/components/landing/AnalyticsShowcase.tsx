import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  Clock,
  Share2,
  ShieldCheck,
} from 'lucide-react'

export function AnalyticsShowcase() {
  const [activeTab, setActiveTab] = useState<'equity' | 'sessions' | 'cards'>('equity')
  const [curveMode, setCurveMode] = useState<'dollar' | 'risk'>('dollar')

  return (
    <section id="analytics" className="py-20 md:py-28 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="max-w-3xl mb-14">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-2 font-mono">
          Advanced Analytics
        </span>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
          Institutional clarity for every trading session
        </h2>
        <p className="mt-4 text-base text-zinc-400 font-normal leading-relaxed">
          Visualize cumulative account growth, compare performance across London and New York market hours, and export verified execution cards for your trading community.
        </p>
      </div>

      {/* Split 2 Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left Column: Tab Selectors */}
        <div className="lg:col-span-5 space-y-3">
          {/* Tab 1 */}
          <button
            onClick={() => setActiveTab('equity')}
            className={`w-full text-left p-5 rounded-2xl border transition-all ${
              activeTab === 'equity'
                ? 'bg-[#181818] border-white/[0.14] shadow-lg ring-1 ring-white/[0.08]'
                : 'bg-[#111111] border-white/[0.04] hover:bg-[#141414] hover:border-white/[0.08]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  activeTab === 'equity'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Cumulative Equity Curve
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Continuous Growth Model
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              Switch effortlessly between dollar return and risk multiple curves with high contrast crosshair inspection.
            </p>
          </button>

          {/* Tab 2 */}
          <button
            onClick={() => setActiveTab('sessions')}
            className={`w-full text-left p-5 rounded-2xl border transition-all ${
              activeTab === 'sessions'
                ? 'bg-[#181818] border-white/[0.14] shadow-lg ring-1 ring-white/[0.08]'
                : 'bg-[#111111] border-white/[0.04] hover:bg-[#141414] hover:border-white/[0.08]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  activeTab === 'sessions'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Plan Compliance & Sessions
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Time of Day Optimization
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              Measure rule adherence week over week and spot which market sessions produce your cleanest winners.
            </p>
          </button>

          {/* Tab 3 */}
          <button
            onClick={() => setActiveTab('cards')}
            className={`w-full text-left p-5 rounded-2xl border transition-all ${
              activeTab === 'cards'
                ? 'bg-[#181818] border-white/[0.14] shadow-lg ring-1 ring-white/[0.08]'
                : 'bg-[#111111] border-white/[0.04] hover:bg-[#141414] hover:border-white/[0.08]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`p-2 rounded-xl ${
                  activeTab === 'cards'
                    ? 'bg-emerald-500/10 text-emerald-400'
                    : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Verified Trade Recap Cards
                </h3>
                <span className="text-[11px] text-zinc-500 font-mono">
                  Social & Review Export
                </span>
              </div>
            </div>
            <p className="mt-3 text-xs text-zinc-400 leading-relaxed">
              Generate sleek dark mode execution snapshots with one click to share on social media or store in your private review vault.
            </p>
          </button>
        </div>

        {/* Right Column: Dynamic Interactive Visualization */}
        <div className="lg:col-span-7">
          <div className="rounded-2xl bg-[#141414] border border-white/[0.08] p-6 shadow-2xl min-h-[460px] flex flex-col justify-between">
            <AnimatePresence mode="wait">
              {activeTab === 'equity' && (
                <motion.div
                  key="equity"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Equity Growth Trajectory
                      </h4>
                      <span className="text-xs text-zinc-400">
                        {curveMode === 'dollar' ? 'Gross and Net PnL ($)' : 'Normalized Risk Multiple (R)'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 bg-[#1C1C1C] p-1 rounded-lg border border-white/[0.06]">
                      <button
                        onClick={() => setCurveMode('dollar')}
                        className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                          curveMode === 'dollar'
                            ? 'bg-[#2A2A2A] text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Dollar Return
                      </button>
                      <button
                        onClick={() => setCurveMode('risk')}
                        className={`text-xs px-2.5 py-1 rounded font-medium transition-colors ${
                          curveMode === 'risk'
                            ? 'bg-[#2A2A2A] text-white'
                            : 'text-zinc-400 hover:text-white'
                        }`}
                      >
                        Risk Multiple
                      </button>
                    </div>
                  </div>

                  {/* Visual Chart Graphic */}
                  <div className="h-64 relative pt-4 flex flex-col justify-between">
                    <svg
                      viewBox="0 0 500 180"
                      className="w-full h-full overflow-visible"
                    >
                      <defs>
                        <linearGradient id="equityGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#1DB954" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#1DB954" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                      <line x1="0" y1="90" x2="500" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                      <line x1="0" y1="140" x2="500" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

                      <polygon
                        points="0,150 40,140 80,145 130,120 180,125 240,95 290,100 350,60 410,70 460,35 500,20 500,175 0,175"
                        fill="url(#equityGrad)"
                      />
                      <polyline
                        fill="none"
                        stroke="#1DB954"
                        strokeWidth="3"
                        strokeLinecap="round"
                        points="0,150 40,140 80,145 130,120 180,125 240,95 290,100 350,60 410,70 460,35 500,20"
                      />
                      <circle cx="350" cy="60" r="4.5" fill="#1DB954" stroke="#ffffff" strokeWidth="2" />
                    </svg>

                    <div className="flex justify-between text-[11px] font-mono text-zinc-500 pt-2 border-t border-white/[0.04]">
                      <span>Jan 02</span>
                      <span>Jan 18</span>
                      <span>Feb 05</span>
                      <span>Feb 24</span>
                      <span>Mar 15</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="bg-[#191919] p-3 rounded-xl border border-white/[0.04]">
                      <span className="text-[11px] text-zinc-400">Total Return</span>
                      <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                        {curveMode === 'dollar' ? '+$38,420.00' : '+24.6R'}
                      </div>
                    </div>
                    <div className="bg-[#191919] p-3 rounded-xl border border-white/[0.04]">
                      <span className="text-[11px] text-zinc-400">Profit Factor</span>
                      <div className="text-lg font-bold font-mono text-white mt-0.5">2.84</div>
                    </div>
                    <div className="bg-[#191919] p-3 rounded-xl border border-white/[0.04]">
                      <span className="text-[11px] text-zinc-400">Max Drawdown</span>
                      <div className="text-lg font-bold font-mono text-amber-400 mt-0.5">3.8%</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'sessions' && (
                <motion.div
                  key="sessions"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Session Expectancy & Volume
                      </h4>
                      <span className="text-xs text-zinc-400">
                        Comparing market hours by net profitability
                      </span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                      London Prime
                    </span>
                  </div>

                  {/* Session Breakdown Bars */}
                  <div className="space-y-4 py-2">
                    <div className="bg-[#181818] p-4 rounded-xl border border-white/[0.04]">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-white font-semibold">London Open (08:00 to 11:30 UTC)</span>
                        <span className="text-emerald-400 font-mono font-bold">+$18,920.00 • 78% Win</span>
                      </div>
                      <div className="h-2 w-full bg-[#242424] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full w-[78%]" />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mt-2 font-mono">
                        <span>42 Executions</span>
                        <span>Avg +2.4R Winner</span>
                      </div>
                    </div>

                    <div className="bg-[#181818] p-4 rounded-xl border border-white/[0.04]">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-white font-semibold">New York Morning (13:30 to 16:00 UTC)</span>
                        <span className="text-emerald-400 font-mono font-bold">+$15,410.00 • 65% Win</span>
                      </div>
                      <div className="h-2 w-full bg-[#242424] rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 rounded-full w-[65%]" />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mt-2 font-mono">
                        <span>58 Executions</span>
                        <span>Avg +1.9R Winner</span>
                      </div>
                    </div>

                    <div className="bg-[#181818] p-4 rounded-xl border border-white/[0.04]">
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-white font-semibold">Asian Session (00:00 to 06:00 UTC)</span>
                        <span className="text-zinc-400 font-mono font-bold">+$4,090.00 • 54% Win</span>
                      </div>
                      <div className="h-2 w-full bg-[#242424] rounded-full overflow-hidden">
                        <div className="h-full bg-zinc-400 rounded-full w-[54%]" />
                      </div>
                      <div className="flex justify-between text-[11px] text-zinc-400 mt-2 font-mono">
                        <span>16 Executions</span>
                        <span>Avg +1.1R Winner</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'cards' && (
                <motion.div
                  key="cards"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
                    <div>
                      <h4 className="text-sm font-semibold text-white">
                        Quantyx Verified Trade Card
                      </h4>
                      <span className="text-xs text-zinc-400">
                        Institutional export with verified trade signature
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-emerald-400">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verified Ledger</span>
                    </div>
                  </div>

                  {/* Rendered Trade Card */}
                  <div className="mx-auto max-w-sm rounded-xl bg-gradient-to-b from-[#1C1C1C] to-[#121212] border border-white/[0.12] p-5 shadow-2xl space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-md bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                          Q
                        </div>
                        <span className="text-xs font-semibold text-white">
                          Quantyx Trade Card
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500">
                        ID 948194
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between border-y border-white/[0.06] py-3">
                      <div>
                        <div className="text-[11px] text-zinc-400 font-medium">NQ Futures 100</div>
                        <div className="text-xs font-bold text-white mt-0.5">Silver Bullet Setup</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold font-mono text-emerald-400">+$2,850.00</div>
                        <div className="text-[11px] font-mono text-emerald-400/80">+3.42R</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-zinc-400">
                      <div>Entry: 21,390.50</div>
                      <div className="text-right">Exit: 21,447.50</div>
                      <div>Duration: 18m 42s</div>
                      <div className="text-right">Risk Multiple: 3.42R</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  )
}
