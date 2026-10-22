import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  BentoGrid,
  BentoGridItem,
} from '@/components/ui/aceternity/BentoGrid'
import { NumberTicker } from '@/components/ui/aceternity/NumberTicker'
import {
  Zap,
  Command,
  Brain,
  Table,
  CheckCircle2,
  TrendingUp,
  Eye,
  EyeOff,
  Search,
} from 'lucide-react'

export function FeatureBentoGrid() {
  // Card 2: Auto cycling command palette simulation
  const [activeShortcutIndex, setActiveShortcutIndex] = useState(0)
  const shortcuts = [
    { key: '⌘K', label: 'Search accounts and symbols', action: 'Quick Filter' },
    { key: '⌘N', label: 'Log instant execution entry', action: 'New Trade' },
    { key: '⌘B', label: 'Toggle live stream privacy blur', action: 'Privacy Shield' },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveShortcutIndex((prev) => (prev + 1) % shortcuts.length)
    }, 2800)
    return () => clearInterval(timer)
  }, [shortcuts.length])

  // Card 3: Interactive tabs
  const [activeTab, setActiveTab] = useState<'Setups' | 'Psychology' | 'Status'>('Setups')

  // Card 4: Privacy blur toggle simulation
  const [isPrivacyOn, setIsPrivacyOn] = useState(false)

  return (
    <section id="features" className="py-20 md:py-28 relative max-w-6xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-medium text-emerald-400 mb-4">
          <Zap className="w-3.5 h-3.5" />
          <span>Engineered for Speed</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
          Every metric that matters in one unified command center
        </h2>
        <p className="mt-4 text-base text-zinc-400 leading-relaxed font-normal">
          Built with keyboard first navigation and millisecond state updates so you spend less time logging trades and more time refining your best setups.
        </p>
      </div>

      {/* 12-Column Bento Grid */}
      <BentoGrid className="gap-5">
        {/* Card 1 (7 cols): Instant Risk & Expectancy Engine */}
        <BentoGridItem
          className="md:col-span-7 bg-[#141414] min-h-[380px]"
          title="Automated Risk Multiple and PnL Math"
          description="Log your entry, exit, stop loss, and position size. Quantyx automatically computes gross profit, net return after fees, and exact risk multiple precision across long and short positions."
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          header={
            <div className="rounded-xl bg-[#0F0F0F] border border-white/[0.06] p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="font-mono text-emerald-400 font-bold">LONG</span>
                  <span className="font-semibold text-white">NQ Futures 100</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Execution Complete
                </span>
              </div>

              {/* Ticker Metrics Display */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="bg-[#181818] p-3 rounded-lg border border-white/[0.04]">
                  <div className="text-[11px] text-zinc-400 font-medium">Risk Multiple</div>
                  <div className="mt-1 text-xl font-bold font-mono text-emerald-400 flex items-center">
                    <span>+</span>
                    <NumberTicker value={3.42} decimalPlaces={2} />
                    <span>R</span>
                  </div>
                </div>

                <div className="bg-[#181818] p-3 rounded-lg border border-white/[0.04]">
                  <div className="text-[11px] text-zinc-400 font-medium">Net Profit</div>
                  <div className="mt-1 text-xl font-bold font-mono text-white flex items-center">
                    <span>$</span>
                    <NumberTicker value={4280} decimalPlaces={2} />
                  </div>
                </div>

                <div className="bg-[#181818] p-3 rounded-lg border border-white/[0.04]">
                  <div className="text-[11px] text-zinc-400 font-medium">Win Rate</div>
                  <div className="mt-1 text-xl font-bold font-mono text-zinc-200 flex items-center">
                    <NumberTicker value={68} />
                    <span>%</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-zinc-500 font-mono pt-1">
                <span>Entry 21,410.25</span>
                <span>Stop 21,385.00</span>
                <span>Exit 21,496.50</span>
              </div>
            </div>
          }
        />

        {/* Card 2 (5 cols): Command Palette & Keyboard Speed */}
        <BentoGridItem
          className="md:col-span-5 bg-[#141414] min-h-[380px]"
          title="Zero Friction Keyboard Workflow"
          description="Press Command K to filter by symbol, switch between funded accounts, log a quick execution, or activate privacy blur during live stream sessions."
          icon={<Command className="w-5 h-5 text-zinc-300" />}
          header={
            <div className="rounded-xl bg-[#0F0F0F] border border-white/[0.06] p-4 relative overflow-hidden">
              {/* Fake Command Bar Search Input */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#181818] border border-white/[0.08] text-xs text-zinc-400 mb-3">
                <Search className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-zinc-300 font-medium">
                  {shortcuts[activeShortcutIndex].label}
                </span>
                <span className="ml-auto px-1.5 py-0.5 rounded bg-[#242424] text-[10px] font-mono text-zinc-300 border border-white/[0.08]">
                  {shortcuts[activeShortcutIndex].key}
                </span>
              </div>

              {/* Animated Keystroke Cycling List */}
              <div className="space-y-1.5">
                {shortcuts.map((sc, idx) => {
                  const isActive = idx === activeShortcutIndex
                  return (
                    <motion.div
                      key={sc.key}
                      animate={{
                        backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                        borderColor: isActive ? 'rgba(29, 185, 84, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                      }}
                      className="flex items-center justify-between px-3 py-2 rounded-lg border text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#222] text-zinc-300">
                          {sc.key}
                        </span>
                        <span className="text-zinc-300 text-xs font-medium">
                          {sc.action}
                        </span>
                      </div>
                      {isActive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </div>
          }
        />

        {/* Card 3 (5 cols): Playbook & Psychology Auditing */}
        <BentoGridItem
          className="md:col-span-5 bg-[#141414] min-h-[380px]"
          title="Setup Grading and Emotion Tagging"
          description="Discover which playbook setups generate your highest expectancy and isolate costly emotional leaks like FOMO or early exits before they hurt your drawdown."
          icon={<Brain className="w-5 h-5 text-amber-400" />}
          header={
            <div className="rounded-xl bg-[#0F0F0F] border border-white/[0.06] p-4 space-y-3">
              {/* Interactive Tabs */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs">
                {(['Setups', 'Psychology', 'Status'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`pb-1 text-xs font-medium transition-colors ${
                      activeTab === tab
                        ? 'text-white border-b-2 border-emerald-400'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Dynamic Content based on active tab */}
              {activeTab === 'Setups' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-zinc-300">Opening Range Break</span>
                    <span className="text-emerald-400 font-mono font-medium">+4.10R</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1C1C1C] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[82%]" />
                  </div>

                  <div className="flex justify-between text-xs pt-1">
                    <span className="text-zinc-300">Silver Bullet Sweep</span>
                    <span className="text-emerald-400 font-mono font-medium">+2.85R</span>
                  </div>
                  <div className="h-1.5 w-full bg-[#1C1C1C] rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-400 w-[64%]" />
                  </div>
                </div>
              )}

              {activeTab === 'Psychology' && (
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#181818] p-2.5 rounded-lg border border-white/[0.04]">
                    <span className="text-zinc-400 block text-[11px]">Disciplined</span>
                    <span className="text-emerald-400 font-bold font-mono text-sm">92% Win</span>
                  </div>
                  <div className="bg-[#181818] p-2.5 rounded-lg border border-white/[0.04]">
                    <span className="text-zinc-400 block text-[11px]">Chased Entry</span>
                    <span className="text-rose-400 font-bold font-mono text-sm">18% Win</span>
                  </div>
                </div>
              )}

              {activeTab === 'Status' && (
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Risk limits respected 14 days straight</span>
                  </div>
                  <div className="flex items-center gap-2 text-zinc-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Maximum drawdown well below threshold</span>
                  </div>
                </div>
              )}
            </div>
          }
        />

        {/* Card 4 (7 cols): Virtualized High Density Data Grid */}
        <BentoGridItem
          className="md:col-span-7 bg-[#141414] min-h-[380px]"
          title="Ten Thousand Executions with Zero Lag"
          description="Powered by virtualized table rendering and optimistic database mutations. Filter thousands of historical executions by date, direction, setup, or custom tag in under sixteen milliseconds."
          icon={<Table className="w-5 h-5 text-blue-400" />}
          header={
            <div className="rounded-xl bg-[#0F0F0F] border border-white/[0.06] p-4 space-y-2.5">
              {/* Header with Privacy Mode Toggle */}
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-2 text-xs">
                <span className="text-zinc-400 font-medium">Virtualized Table Stream</span>
                <button
                  onClick={() => setIsPrivacyOn(!isPrivacyOn)}
                  className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#1C1C1C] border border-white/[0.06] text-[11px] text-zinc-300 hover:text-white transition-colors"
                >
                  {isPrivacyOn ? <EyeOff className="w-3 h-3 text-amber-400" /> : <Eye className="w-3 h-3 text-zinc-400" />}
                  <span>Privacy Blur</span>
                </button>
              </div>

              {/* Rows */}
              <div className="space-y-1.5 text-xs font-mono">
                <div className="flex items-center justify-between p-2 rounded bg-[#161616] border border-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LONG
                    </span>
                    <span className="text-white font-sans text-xs">NQ Futures</span>
                  </div>
                  <span className={`text-emerald-400 font-bold transition-all ${isPrivacyOn ? 'blur-sm select-none' : ''}`}>
                    +$1,840.00
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#161616] border border-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      SHORT
                    </span>
                    <span className="text-white font-sans text-xs">ES Minis</span>
                  </div>
                  <span className={`text-rose-400 font-bold transition-all ${isPrivacyOn ? 'blur-sm select-none' : ''}`}>
                    ($350.00)
                  </span>
                </div>

                <div className="flex items-center justify-between p-2 rounded bg-[#161616] border border-white/[0.03]">
                  <div className="flex items-center gap-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      LONG
                    </span>
                    <span className="text-white font-sans text-xs">EURUSD Spot</span>
                  </div>
                  <span className={`text-emerald-400 font-bold transition-all ${isPrivacyOn ? 'blur-sm select-none' : ''}`}>
                    +$2,790.00
                  </span>
                </div>
              </div>
            </div>
          }
        />
      </BentoGrid>
    </section>
  )
}
