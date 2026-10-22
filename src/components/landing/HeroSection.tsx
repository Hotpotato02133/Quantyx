import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react'
import {
  ArrowRight,
  Play,
} from 'lucide-react'
import { Spotlight } from '@/components/ui/aceternity/Spotlight'
import { ContainerScroll } from '@/components/ui/aceternity/ContainerScroll'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

export function HeroSection() {
  const [activeRange, setActiveRange] = useState<'30D' | '90D' | 'ALL'>('90D')

  return (
    <section className="relative pt-32 sm:pt-36 pb-16 md:pb-24 overflow-hidden">
      {/* Background Spotlight Beam */}
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
        fill="white"
      />

      {/* Radial Dot Grid Background with Subtle Fade */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_30%,#000_70%,transparent_100%)]" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 text-center">
        {/* Shimmer Announcement Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-[#141414]/90 backdrop-blur-md shadow-inner text-xs font-medium text-zinc-300 hover:border-white/[0.18] transition-all cursor-pointer group">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="bg-gradient-to-r from-zinc-200 via-white to-zinc-400 bg-clip-text text-transparent">
            Quantyx 2.0 is live with instant broker CSV sync
          </span>
          <ArrowRight className="w-3 h-3 text-zinc-400 group-hover:translate-x-0.5 transition-transform" />
        </div>

        {/* Main Headline */}
        <h1 className="mt-8 text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500 max-w-4xl mx-auto leading-[1.08]">
          Precision trade journaling for relentless market edge
        </h1>

        {/* Subheadline */}
        <p className="mt-6 text-base sm:text-lg text-zinc-400 text-center max-w-2xl mx-auto font-normal leading-relaxed">
          Turn raw executions into institutional analytics. Track your risk multiple, audit your trading psychology, and scale every funded account from one ultra fast workspace.
        </p>

        {/* CTA Row */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
          {/* Primary CTA with Glowing Shimmer Border */}
          {HAS_CLERK ? (
            <>
              <SignedIn>
                <Link
                  to="/dashboard"
                  className="relative inline-flex p-[1.5px] overflow-hidden rounded-xl group hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl"
                >
                  <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1DB954_0%,#3b82f6_25%,transparent_50%,#1DB954_100%)]" />
                  <div className="relative z-10 flex items-center gap-2 bg-white px-7 py-3.5 rounded-[10.5px] text-sm font-semibold text-black hover:bg-zinc-100 transition-colors">
                    <span>Go to Dashboard</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </Link>
              </SignedIn>
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="relative inline-flex p-[1.5px] overflow-hidden rounded-xl group hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl cursor-pointer">
                    <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1DB954_0%,#3b82f6_25%,transparent_50%,#1DB954_100%)]" />
                    <div className="relative z-10 flex items-center gap-2 bg-white px-7 py-3.5 rounded-[10.5px] text-sm font-semibold text-black hover:bg-zinc-100 transition-colors">
                      <span>Launch Your Journal Free</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                </SignUpButton>
              </SignedOut>
            </>
          ) : (
            <Link
              to="/dashboard"
              className="relative inline-flex p-[1.5px] overflow-hidden rounded-xl group hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl"
            >
              <span className="absolute inset-[-1000%] animate-[spin_4s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#1DB954_0%,#3b82f6_25%,transparent_50%,#1DB954_100%)]" />
              <div className="relative z-10 flex items-center gap-2 bg-white px-7 py-3.5 rounded-[10.5px] text-sm font-semibold text-black hover:bg-zinc-100 transition-colors">
                <span>Launch Your Journal Free</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Link>
          )}

          {/* Secondary CTA */}
          <a
            href="#features"
            className="inline-flex items-center gap-2 bg-[#141414] hover:bg-[#1C1C1C] text-zinc-200 border border-white/[0.08] hover:border-white/[0.18] px-6 py-3.5 rounded-xl text-sm font-medium transition-all shadow-sm"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
            <span>Explore Live Demo</span>
          </a>
        </div>
      </div>

      {/* 3D Scroll Showcase with Revamped Dashboard Mockup */}
      <ContainerScroll>
        <div className="relative w-full p-[1px] rounded-2xl overflow-hidden shadow-[0_0_60px_-15px_rgba(29,185,84,0.2)]">
          <div className="absolute inset-[-1000%] animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#1DB954_25%,#3b82f6_35%,transparent_50%)] opacity-70" />
          <div className="relative w-full rounded-[15px] overflow-hidden bg-[#0D0D0D] border border-white/[0.08] shadow-2xl">

          {/* Mockup Top Window Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#111111] border-b border-white/[0.06] text-xs">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
              </div>
              <span className="text-zinc-500 font-mono text-[11px] ml-2">
                quantyx.app/dashboard
              </span>
            </div>
            <div className="flex items-center gap-2 text-zinc-400">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#181818] border border-white/[0.06] text-[11px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Apex 150K Funded</span>
              </div>
            </div>
          </div>

          {/* Mockup Dashboard Content */}
          <div className="p-4 sm:p-6 space-y-5">
            {/* 3 KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {/* Card 1: Net Cumulative PnL */}
              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span>Net Cumulative PnL</span>
                  <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    +18.4%
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-white">
                    $42,850.00
                  </span>
                  <span className="text-xs font-mono text-emerald-400">+$6,420</span>
                </div>
              </div>

              {/* Card 2: Expectancy Ratio */}
              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span>Expectancy Ratio</span>
                  <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    +0.35R
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-white">
                    2.41R
                  </span>
                  <span className="text-xs font-mono text-zinc-500">vs 1.80R target</span>
                </div>
              </div>

              {/* Card 3: Win Rate */}
              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-4 flex flex-col justify-between">
                <div className="flex items-center justify-between text-xs text-zinc-400 font-medium">
                  <span>Win Rate</span>
                  <span className="text-emerald-400 font-mono text-[11px] bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
                    48 of 70
                  </span>
                </div>
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-2xl font-bold font-mono tabular-nums text-white">
                    68.4%
                  </span>
                  <span className="text-xs font-mono text-emerald-400">+4.2%</span>
                </div>
              </div>
            </div>

            {/* Monochrome Area Chart Mockup with Floating Tooltip */}
            <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-5 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div>
                  <h3 className="text-sm font-semibold text-white tracking-tight">
                    Net PnL over time
                  </h3>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Cumulative performance across all active accounts
                  </p>
                </div>
                <div className="flex items-center gap-1 bg-[#1A1A1A] p-0.5 rounded-lg border border-white/[0.06] self-start">
                  {(['30D', '90D', 'ALL'] as const).map((r) => (
                    <button
                      key={r}
                      onClick={() => setActiveRange(r)}
                      className={`text-xs font-mono px-2.5 py-1 rounded-md transition-colors ${
                        activeRange === r
                          ? 'bg-[#262626] text-white'
                          : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Chart SVG Representation */}
              <div className="relative h-44 sm:h-56 w-full pt-4">
                <svg
                  viewBox="0 0 700 200"
                  className="w-full h-full overflow-visible"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1DB954" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#1DB954" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Horizontal Gridlines */}
                  <line x1="0" y1="40" x2="700" y2="40" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <line x1="0" y1="90" x2="700" y2="90" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
                  <line x1="0" y1="140" x2="700" y2="140" stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />

                  {/* Area Fill */}
                  <polygon
                    points="0,170 45,155 90,160 140,135 190,140 240,110 300,115 360,85 420,90 480,55 540,65 600,30 650,45 700,20 700,195 0,195"
                    fill="url(#chartGradient)"
                  />

                  {/* High Contrast Line */}
                  <polyline
                    fill="none"
                    stroke="#1DB954"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points="0,170 45,155 90,160 140,135 190,140 240,110 300,115 360,85 420,90 480,55 540,65 600,30 650,45 700,20"
                  />

                  {/* Active Data Point */}
                  <circle cx="480" cy="55" r="4.5" fill="#1DB954" stroke="#ffffff" strokeWidth="2" />
                </svg>

                {/* Floating Tooltip Callout */}
                <div
                  className="absolute left-[65%] top-[14%] -translate-x-1/2 -translate-y-full px-3 py-1.5 rounded-lg bg-[#1F1F1F] border border-white/[0.12] shadow-xl text-xs font-mono pointer-events-none"
                >
                  <div className="flex items-center gap-1.5 text-zinc-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Tue, Feb 17 • Net PnL $28,917</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Split Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-white mb-3">
                  <span>Playbook Edge Distribution</span>
                  <span className="text-zinc-500 font-mono text-[11px]">Win Rate</span>
                </div>
                <div className="space-y-2.5">
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>London Breakout</span>
                      <span className="text-emerald-400 font-mono">74.2% • +3.8R</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1F1F1F] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full w-[74%]" />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-zinc-400 mb-1">
                      <span>FVG Retest</span>
                      <span className="text-emerald-400 font-mono">68.0% • +2.6R</span>
                    </div>
                    <div className="h-1.5 w-full bg-[#1F1F1F] rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-400 rounded-full w-[68%]" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-[#141414] border border-white/[0.06] rounded-xl p-4">
                <div className="flex items-center justify-between text-xs font-semibold text-white mb-3">
                  <span>Rule Compliance</span>
                  <span className="text-emerald-400 font-mono text-[11px]">96% Grade A</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-[#191919] p-2.5 rounded-lg border border-white/[0.04]">
                    <div className="text-[11px] text-zinc-400">Stop Respected</div>
                    <div className="text-base font-bold font-mono text-white mt-1">98%</div>
                  </div>
                  <div className="bg-[#191919] p-2.5 rounded-lg border border-white/[0.04]">
                    <div className="text-[11px] text-zinc-400">No Revenge</div>
                    <div className="text-base font-bold font-mono text-white mt-1">100%</div>
                  </div>
                  <div className="bg-[#191919] p-2.5 rounded-lg border border-white/[0.04]">
                    <div className="text-[11px] text-zinc-400">Plan Logged</div>
                    <div className="text-base font-bold font-mono text-emerald-400 mt-1">94%</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </ContainerScroll>
    </section>
  )
}
