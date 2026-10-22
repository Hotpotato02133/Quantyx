import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react'
import { Check, Sparkles, ArrowRight } from 'lucide-react'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

const TIER_1_FEATURES = [
  'One active trading account',
  'Up to one hundred logged trades per month',
  'Core equity curve and win rate metrics',
  'Command palette and privacy blur mode',
  'Shareable trade recap cards',
]

const TIER_2_FEATURES = [
  'Unlimited prop firm and personal accounts',
  'Unlimited trade executions and CSV imports',
  'Playbook expectancy and psychology analytics',
  'High resolution chart screenshot storage',
  'Priority feature access and data export',
]

export function PricingSection() {
  return (
    <section id="pricing" className="py-20 md:py-28 max-w-6xl mx-auto px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-16">
        <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-2 font-mono">
          Transparent Pricing
        </span>
        <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight">
          Simple pricing built for serious traders
        </h2>
        <p className="mt-4 text-base text-zinc-400 font-normal leading-relaxed">
          Start journaling on your first account for free and upgrade when you scale across multiple prop firm evaluations.
        </p>
      </div>

      {/* 2 Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
        {/* Tier 1: Core Trader */}
        <div className="rounded-3xl bg-[#141414] border border-white/[0.08] p-8 flex flex-col justify-between shadow-xl transition-all hover:border-white/[0.14]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Core Trader
              </h3>
              <span className="text-xs font-mono font-medium text-zinc-400 bg-white/[0.05] px-2.5 py-1 rounded-full border border-white/[0.06]">
                Starter Tier
              </span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed min-h-[36px]">
              Everything you need to build consistent journaling habits on a single trading account.
            </p>

            <div className="mt-6 mb-8 flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tight">
                $0
              </span>
              <span className="text-xs text-zinc-400 font-mono">
                / forever
              </span>
            </div>

            {/* Feature Checklist */}
            <div className="space-y-3 pt-6 border-t border-white/[0.06]">
              {TIER_1_FEATURES.map((feat) => (
                <div key={feat} className="flex items-start gap-2.5 text-xs text-zinc-300">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-white/[0.06]">
            {HAS_CLERK ? (
              <>
                <SignedIn>
                  <Link
                    to="/dashboard"
                    className="w-full text-center block bg-[#202020] hover:bg-[#262626] text-white text-xs font-semibold py-3 rounded-xl transition-all border border-white/[0.08]"
                  >
                    Go to Dashboard
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignUpButton mode="modal">
                    <button className="w-full bg-[#202020] hover:bg-[#262626] text-white text-xs font-semibold py-3 rounded-xl transition-all border border-white/[0.08] cursor-pointer">
                      Start Free Forever
                    </button>
                  </SignUpButton>
                </SignedOut>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="w-full text-center block bg-[#202020] hover:bg-[#262626] text-white text-xs font-semibold py-3 rounded-xl transition-all border border-white/[0.08]"
              >
                Start Free Forever
              </Link>
            )}
          </div>
        </div>

        {/* Tier 2: Pro Quantitative with Animated Border Beam */}
        <div className="relative rounded-3xl p-[1.5px] overflow-hidden shadow-2xl transition-all hover:shadow-[0_0_50px_-10px_rgba(29,185,84,0.25)] flex flex-col justify-between">
          <span className="absolute inset-[-1000%] animate-[spin_6s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#1DB954_25%,#3b82f6_40%,transparent_60%)]" />

          <div className="relative z-10 w-full h-full rounded-[22px] bg-[#141414] border border-white/[0.08] p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-white">
                    Pro Quantitative
                  </h3>
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                </div>
                <span className="text-xs font-mono font-medium text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                  Most Popular
                </span>
              </div>

              <p className="text-xs text-zinc-400 leading-relaxed min-h-[36px]">
                Unlimited multi account analytics, playbook grading, and bulk CSV automation for funded traders.
              </p>

              <div className="mt-6 mb-8 flex items-baseline gap-2">
                <span className="text-4xl sm:text-5xl font-bold font-mono text-white tracking-tight">
                  $19
                </span>
                <span className="text-xs text-zinc-400 font-mono">
                  / month
                </span>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-6 border-t border-white/[0.06]">
                {TIER_2_FEATURES.map((feat) => (
                  <div key={feat} className="flex items-start gap-2.5 text-xs text-zinc-200">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="font-medium">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-8 mt-8 border-t border-white/[0.06]">
              {HAS_CLERK ? (
                <>
                  <SignedIn>
                    <Link
                      to="/dashboard"
                      className="w-full text-center flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 text-xs font-semibold py-3 rounded-xl transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                    >
                      <span>Unlock Pro Analytics</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </SignedIn>
                  <SignedOut>
                    <SignUpButton mode="modal">
                      <button className="w-full flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 text-xs font-semibold py-3 rounded-xl transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
                        <span>Unlock Pro Analytics</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </SignUpButton>
                  </SignedOut>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="w-full text-center flex items-center justify-center gap-2 bg-white text-black hover:bg-zinc-200 text-xs font-semibold py-3 rounded-xl transition-all shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                >
                  <span>Unlock Pro Analytics</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
