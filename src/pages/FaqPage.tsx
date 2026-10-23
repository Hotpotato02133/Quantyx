import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react'
import { Navbar } from '@/components/landing/Navbar'
import { Footer } from '@/components/landing/Footer'
import { Spotlight } from '@/components/ui/aceternity/Spotlight'
import {
  HelpCircle,
  Search,
  ChevronDown,
  ArrowRight,
  Sparkles,
  MessageSquare,
  Shield,
  FileSpreadsheet,
  TrendingUp,
  Building,
} from 'lucide-react'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

interface FaqItem {
  id: string
  category: 'brokers' | 'risk' | 'prop' | 'security'
  question: string
  answer: string
}

const FAQ_ITEMS: FaqItem[] = [
  {
    id: 'brokers-supported',
    category: 'brokers',
    question: 'Which brokers and platforms does Quantyx natively support?',
    answer:
      'Quantyx provides native automated CSV parsing for Tradovate, NinjaTrader 8, MetaTrader 5, Thinkorswim, Interactive Brokers, and TradingView. For prop traders, we natively support account export formats from Apex Trader Funding, Topstep, FTMO, and MyFundedFX.',
  },
  {
    id: 'duplicate-detection',
    category: 'brokers',
    question: 'How does the automated CSV importer handle duplicate trades?',
    answer:
      'Every imported execution is processed through an automated reconciliation algorithm that hashes the exact fill timestamp, instrument symbol, order price, and ticket identifier. If you re upload a historical file, existing records are recognized and duplicates are omitted without overwriting your manual notes.',
  },
  {
    id: 'manual-logging',
    category: 'brokers',
    question: 'Can I log manual trades if my broker is not listed in the preset menu?',
    answer:
      'Yes. You can use our rapid inline entry terminal to log any trade in seconds. Simply input your entry price, stop loss, exit price, and contract size. Quantyx automatically calculates your exact risk multiple, dollar return, and hold duration on the fly.',
  },
  {
    id: 'r-multiple-math',
    category: 'risk',
    question: 'How does Quantyx compute Risk Multiple and Expectancy?',
    answer:
      'Risk Multiple is calculated by dividing your net realized dollar profit or loss by your initial cash risk. Your initial cash risk is the difference between entry price and stop loss price multiplied by position size. Expectancy is computed as your win rate multiplied by average win R minus your loss rate multiplied by average loss R.',
  },
  {
    id: 'commissions-fees',
    category: 'risk',
    question: 'Are commissions, exchange fees, and financing costs included in analytics?',
    answer:
      'Yes. You can toggle between Gross Return and Net Return across your entire dashboard. Quantyx deducts round turn broker commissions and clearing fees so your verified stats reflect exact cash deposited in your bank account.',
  },
  {
    id: 'prop-rules',
    category: 'prop',
    question: 'Can Quantyx track trailing drawdown and daily loss limit thresholds?',
    answer:
      'Yes. You can configure custom account guardrails including maximum trailing drawdown, intraday daily loss pause points, and max contracts. The system highlights when your active positions approach critical evaluation boundaries.',
  },
  {
    id: 'multi-account',
    category: 'prop',
    question: 'Can I manage multiple funded accounts and personal brokers in one workspace?',
    answer:
      'Yes. Quantyx features a unified multi account architecture. You can view an aggregate master equity curve or switch directly into individual accounts to review evaluation progress separately.',
  },
  {
    id: 'data-privacy',
    category: 'security',
    question: 'Is my personal trading data sold or shared with outside parties?',
    answer:
      'Never. Your execution logs, playbook rules, and journal reflections remain strictly confidential and encrypted. We do not sell user data to prop firms, brokers, or market makers under any circumstances.',
  },
  {
    id: 'data-export',
    category: 'security',
    question: 'Can I export my entire trading journal history at any time?',
    answer:
      'Yes. You retain total ownership of your data. You can export your full trade records, setup tags, and performance analytics to CSV or JSON with a single click whenever you wish.',
  },
]

export default function FaqPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [openItems, setOpenItems] = useState<Record<string, boolean>>({
    'brokers-supported': true,
    'r-multiple-math': true,
  })

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const toggleItem = (id: string) => {
    setOpenItems((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const filteredItems = FAQ_ITEMS.filter((item) => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory
    const query = searchQuery.toLowerCase().trim()
    const matchesQuery =
      query === '' ||
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query)

    return matchesCategory && matchesQuery
  })

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-zinc-100 selection:bg-[#1DB954]/20 selection:text-[#1DB954] cursor-pointer">
      <Navbar />

      <main className="cursor-pointer">
        {/* Hero Section */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden cursor-pointer">
          <Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="#1DB954" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 cursor-pointer">
            <div className="text-center max-w-3xl mx-auto cursor-pointer">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#1DB954]/30 bg-[#1DB954]/10 text-[#1DB954] text-xs font-semibold tracking-wide uppercase mb-6 cursor-pointer hover:bg-[#1DB954]/20 transition-colors">
                <Sparkles className="w-3.5 h-3.5" />
                Support Knowledge Base
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 leading-tight cursor-pointer">
                Frequently Asked{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1DB954] to-emerald-300">
                  Questions
                </span>
              </h1>

              <p className="text-lg text-zinc-400 mb-8 max-w-xl mx-auto leading-relaxed cursor-pointer">
                Everything you need to know about automated broker sync, risk calculations, prop firm rules, and data security.
              </p>

              {/* Instant Search Bar */}
              <div className="relative max-w-xl mx-auto mb-8 cursor-pointer">
                <Search className="w-5 h-5 text-zinc-500 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search questions or keywords..."
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[#141414] border border-zinc-800 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#1DB954] transition-all cursor-pointer shadow-lg shadow-black/40"
                />
              </div>

              {/* Category Filters */}
              <div className="flex flex-wrap items-center justify-center gap-2 cursor-pointer">
                {[
                  { id: 'all', label: 'All Topics', icon: HelpCircle },
                  { id: 'brokers', label: 'Broker Imports', icon: FileSpreadsheet },
                  { id: 'risk', label: 'Risk Math', icon: TrendingUp },
                  { id: 'prop', label: 'Prop Firms', icon: Building },
                  { id: 'security', label: 'Data Security', icon: Shield },
                ].map((cat) => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        activeCategory === cat.id
                          ? 'bg-[#1DB954] text-black shadow-md shadow-[#1DB954]/20'
                          : 'bg-zinc-900/80 border border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Accordion Section */}
        <section className="py-16 border-t border-zinc-900 bg-[#0E0E0E] cursor-pointer">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            {filteredItems.length === 0 ? (
              <div className="text-center py-16 p-8 rounded-3xl border border-zinc-800 bg-[#141414] cursor-pointer">
                <HelpCircle className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2 cursor-pointer">No questions matched your search</h3>
                <p className="text-sm text-zinc-400 mb-6 cursor-pointer">
                  Try adjusting your keywords or clearing the category filter.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setActiveCategory('all')
                  }}
                  className="px-5 py-2.5 rounded-xl bg-[#1DB954] text-black font-semibold text-xs cursor-pointer hover:bg-[#1ed760] transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4 cursor-pointer">
                {filteredItems.map((item) => {
                  const isOpen = Boolean(openItems[item.id])
                  return (
                    <div
                      key={item.id}
                      className={`rounded-2xl border transition-all duration-200 cursor-pointer overflow-hidden ${
                        isOpen
                          ? 'border-[#1DB954]/40 bg-[#141414] shadow-lg shadow-black/40'
                          : 'border-zinc-800/80 bg-[#141414]/70 hover:border-zinc-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span className="text-base sm:text-lg font-semibold text-white cursor-pointer">
                          {item.question}
                        </span>
                        <div
                          className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 ${
                            isOpen ? 'bg-[#1DB954]/20 text-[#1DB954] rotate-180' : 'bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          <ChevronDown className="w-4 h-4" />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-zinc-400 leading-relaxed border-t border-zinc-800/50 pt-4 cursor-pointer">
                          {item.answer}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}

            {/* Direct Support Card */}
            <div className="mt-16 p-8 rounded-3xl border border-zinc-800 bg-[#141414] flex flex-col sm:flex-row items-center justify-between gap-6 cursor-pointer">
              <div className="flex items-center gap-4 cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-[#1DB954]/20 border border-[#1DB954]/30 flex items-center justify-center text-[#1DB954] shrink-0">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white cursor-pointer">Still have unanswered questions?</h3>
                  <p className="text-sm text-zinc-400 cursor-pointer">
                    Our team and community of disciplined traders are available around the clock.
                  </p>
                </div>
              </div>

              <a
                href="https://discord.com"
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs transition-colors shrink-0 text-center cursor-pointer"
              >
                Join Discord Community
              </a>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="py-20 border-t border-zinc-900 bg-gradient-to-b from-[#0A0A0A] to-[#121212] text-center cursor-pointer">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 cursor-pointer">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white tracking-tight mb-6 cursor-pointer">
              Experience The Quantyx Difference
            </h2>
            <p className="text-zinc-400 text-base sm:text-lg mb-8 max-w-2xl mx-auto cursor-pointer">
              Take complete control of your trading edge. Set up your account and import your first trade history in less than two minutes.
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
                      to="/dashboard"
                      className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      Open Trading Terminal
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </SignedIn>
                </>
              ) : (
                <Link
                  to="/dashboard"
                  className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-[#1DB954] text-black font-semibold text-sm hover:bg-[#1ed760] transition-all shadow-lg shadow-[#1DB954]/20 flex items-center justify-center gap-2 cursor-pointer"
                >
                  Open Trading Terminal
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}
              <Link
                to="/features"
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 font-medium text-sm transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                Review Platform Features
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
