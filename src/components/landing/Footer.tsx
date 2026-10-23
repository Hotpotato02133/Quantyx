import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignUpButton } from '@clerk/clerk-react'
import {
  TrendingUp,
  ArrowRight,
  ChevronDown,
} from 'lucide-react'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

const FAQS = [
  {
    q: 'Which brokers and prop firms are supported for CSV import?',
    a: 'Quantyx natively parses execution files from TradingView, MetaTrader 5, NinjaTrader, Tradovate, Interactive Brokers, cTrader, Thinkorswim, Topstep, Apex Trader Funding, and FTMO.',
  },
  {
    q: 'How does Quantyx compute risk multiple?',
    a: 'Quantyx calculates your initial cash risk based on your entry price and hard stop loss, then measures realized gain against that denominator with millisecond precision.',
  },
  {
    q: 'Can I manage multiple funded evaluation accounts simultaneously?',
    a: 'Yes. You can switch between personal brokerage accounts and prop firm evaluations seamlessly via the command palette or account selector.',
  },
  {
    q: 'Is my financial trade data private and secure?',
    a: 'All user records are isolated using row level database security and encrypted both in transit and at rest.',
  },
]

export function Footer() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <footer className="pt-20 pb-12 relative overflow-hidden cursor-pointer">
      {/* FAQ Accordion Section */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 mb-24 cursor-pointer">
        <div className="text-center mb-12 cursor-pointer">
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-widest block mb-2 font-mono cursor-pointer">
            Got Questions?
          </span>
          <h2 className="text-2xl sm:text-4xl font-semibold tracking-tight text-white cursor-pointer">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3 cursor-pointer">
          {FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx
            return (
              <div
                key={faq.q}
                className="rounded-2xl bg-[#141414] border border-white/[0.06] overflow-hidden transition-colors hover:border-white/[0.12] cursor-pointer"
              >
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-sm font-semibold text-white cursor-pointer">
                    {faq.q}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-zinc-400 transition-transform cursor-pointer ${
                      isOpen ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs text-zinc-400 leading-relaxed border-t border-white/[0.04] cursor-pointer">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* Final Callout Card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 cursor-pointer">
        <div className="relative rounded-3xl p-[1px] overflow-hidden shadow-2xl cursor-pointer">
          <div className="absolute inset-[-1000%] animate-[spin_10s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,transparent_0%,#1DB954_30%,#ffffff_45%,transparent_60%)] opacity-70 cursor-pointer" />
          <div className="relative z-10 rounded-[23px] bg-gradient-to-b from-[#181818] to-[#101010] border border-white/[0.08] p-10 sm:p-14 text-center overflow-hidden cursor-pointer">
            {/* Radial ambient background light */}
            <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_50%_0%,rgba(29,185,84,0.12),transparent_70%)]" />

            <div className="relative z-10 max-w-2xl mx-auto cursor-pointer">
              <h2 className="text-3xl sm:text-5xl font-semibold tracking-tight text-white leading-tight cursor-pointer">
                Ready to trade with undeniable data?
              </h2>
              <p className="mt-4 text-sm sm:text-base text-zinc-400 leading-relaxed cursor-pointer">
                Join disciplined traders who use Quantyx to eliminate emotional mistakes and compound their edge every single session.
              </p>

              <div className="mt-8 flex justify-center cursor-pointer">
                {HAS_CLERK ? (
                  <>
                    <SignedIn>
                      <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 text-sm font-semibold px-8 py-4 rounded-xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                      >
                        <span className="cursor-pointer">Go to Dashboard</span>
                        <ArrowRight className="w-4 h-4 cursor-pointer" />
                      </Link>
                    </SignedIn>
                    <SignedOut>
                      <SignUpButton mode="modal">
                        <button className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 text-sm font-semibold px-8 py-4 rounded-xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                          <span className="cursor-pointer">Create Your Free Account</span>
                          <ArrowRight className="w-4 h-4 cursor-pointer" />
                        </button>
                      </SignUpButton>
                    </SignedOut>
                  </>
                ) : (
                  <Link
                    to="/dashboard"
                    className="inline-flex items-center gap-2 bg-white text-black hover:bg-zinc-200 text-sm font-semibold px-8 py-4 rounded-xl transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
                  >
                    <span className="cursor-pointer">Create Your Free Account</span>
                    <ArrowRight className="w-4 h-4 cursor-pointer" />
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Bottom Bar */}
      <div className="border-t border-white/[0.06] py-8 mt-16 text-xs text-zinc-500 max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer">
        {/* Left: Brand Mark & Copyright */}
        <div className="flex items-center gap-2.5 cursor-pointer">
          <div className="w-6 h-6 rounded-md bg-[#1C1C1C] flex items-center justify-center border border-white/[0.08] cursor-pointer">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 cursor-pointer" />
          </div>
          <span className="cursor-pointer">
            © 2026 Quantyx Analytics. Crafted for precision market execution.
          </span>
        </div>

        {/* Right: Quick Links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 cursor-pointer">
          <Link to="/features" className="hover:text-zinc-300 transition-colors cursor-pointer">
            Features
          </Link>
          <span>•</span>
          <Link to="/analytics" className="hover:text-zinc-300 transition-colors cursor-pointer">
            Analytics
          </Link>
          <span>•</span>
          <Link to="/playbooks" className="hover:text-zinc-300 transition-colors cursor-pointer">
            Playbooks
          </Link>
          <span>•</span>
          <Link to="/faq" className="hover:text-zinc-300 transition-colors cursor-pointer">
            FAQ
          </Link>
          <span>•</span>
          <Link to="/dashboard" className="hover:text-zinc-300 transition-colors cursor-pointer">
            Dashboard
          </Link>
        </div>
      </div>
    </footer>
  )
}
