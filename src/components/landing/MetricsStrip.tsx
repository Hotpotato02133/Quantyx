import { NumberTicker } from '@/components/ui/aceternity/NumberTicker'

export function MetricsStrip() {
  return (
    <section className="bg-[#141414] border-y border-white/[0.06] py-12 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
          {/* Stat 1: 16ms */}
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-white tracking-tight">
              <NumberTicker value={16} suffix="ms" />
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium pt-1">
              Optimistic UI response time
            </p>
          </div>

          {/* Stat 2: 100% */}
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-emerald-400 tracking-tight">
              <NumberTicker value={100} suffix="%" />
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium pt-1">
              Row level data isolation
            </p>
          </div>

          {/* Stat 3: 10,000+ */}
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-white tracking-tight">
              <NumberTicker value={10000} suffix="+" />
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium pt-1">
              Virtualized rows at 60 FPS
            </p>
          </div>

          {/* Stat 4: 24/7 */}
          <div className="space-y-1">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold font-mono text-white tracking-tight">
              <span>24/7</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 font-medium pt-1">
              Cloud sync across devices
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
