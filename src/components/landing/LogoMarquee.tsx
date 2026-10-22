import { InfiniteMovingCards } from '@/components/ui/aceternity/InfiniteMovingCards'
import {
  CandlestickChart,
  BarChart2,
  TrendingUp,
  LineChart,
  ShieldCheck,
  Compass,
  Cpu,
  Zap,
} from 'lucide-react'

interface BrokerItem {
  name: string
  category: string
  icon: typeof CandlestickChart
}

const BROKERS: BrokerItem[] = [
  { name: 'TradingView', category: 'Charts & Webhook', icon: LineChart },
  { name: 'MetaTrader 5', category: 'Forex & CFD', icon: CandlestickChart },
  { name: 'NinjaTrader', category: 'Futures Platform', icon: BarChart2 },
  { name: 'Tradovate', category: 'Futures Direct', icon: Cpu },
  { name: 'Interactive Brokers', category: 'Global Equities', icon: ShieldCheck },
  { name: 'cTrader', category: 'ECN Trading', icon: TrendingUp },
  { name: 'Thinkorswim', category: 'Options & Equities', icon: Compass },
  { name: 'Topstep', category: 'Funded Trader', icon: Zap },
  { name: 'Apex Trader Funding', category: 'Prop Firm Sync', icon: Zap },
  { name: 'FTMO', category: 'Evaluation Sync', icon: ShieldCheck },
]

export function LogoMarquee() {
  return (
    <section className="py-12 border-y border-white/[0.06] bg-[#0A0A0A] overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 mb-6 text-center">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          Seamless execution imports for modern futures, forex, and equity traders
        </p>
      </div>

      <InfiniteMovingCards
        items={BROKERS}
        direction="left"
        speed="normal"
        pauseOnHover={true}
        className="py-2"
        renderItem={(item) => {
          const Icon = item.icon
          return (
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-[#141414] border border-white/[0.06] hover:border-white/[0.14] transition-all group select-none">
              <div className="p-1.5 rounded-lg bg-[#1C1C1C] text-zinc-400 group-hover:text-emerald-400 transition-colors">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  {item.name}
                </span>
                <span className="text-[10px] text-zinc-500 font-mono">
                  {item.category}
                </span>
              </div>
            </div>
          )
        }}
      />
    </section>
  )
}
