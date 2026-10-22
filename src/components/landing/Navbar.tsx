import { useState } from 'react'
import { Link } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, SignUpButton } from '@clerk/clerk-react'
import { TrendingUp, Menu, X, ArrowRight } from 'lucide-react'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

const NAV_LINKS = [
  { label: 'Features', href: '#features' },
  { label: 'Analytics', href: '#analytics' },
  { label: 'Playbooks', href: '#playbooks' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 sm:px-6">
      <nav className="max-w-5xl mx-auto mt-4 px-5 py-3 rounded-2xl bg-[#121212]/80 backdrop-blur-xl border border-white/[0.08] flex items-center justify-between shadow-2xl transition-all">
        {/* Left: Brand Icon & Wordmark */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-white to-zinc-400 p-0.5 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#0A0A0A] rounded-[6px] flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white group-hover:text-zinc-200 transition-colors">
            Quantyx
          </span>
        </Link>

        {/* Center: Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              {link.label}
            </a>
          ))}
        </div>

        {/* Right: Smart Auth Aware CTAs */}
        <div className="hidden md:flex items-center gap-3">
          {HAS_CLERK ? (
            <>
              <SignedIn>
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-1.5 bg-white text-black hover:bg-zinc-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </SignedIn>
              <SignedOut>
                <SignInButton mode="modal">
                  <button className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors cursor-pointer">
                    Sign In
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98] cursor-pointer">
                    Start Journaling
                  </button>
                </SignUpButton>
              </SignedOut>
            </>
          ) : (
            <>
              <Link
                to="/sign-in"
                className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/dashboard"
                className="bg-white text-black hover:bg-zinc-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all shadow-sm hover:scale-[1.02] active:scale-[0.98]"
              >
                Start Journaling
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 text-zinc-400 hover:text-white focus:outline-none"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile Dropdown Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden max-w-5xl mx-auto mt-2 p-4 rounded-2xl bg-[#141414]/95 backdrop-blur-2xl border border-white/[0.08] shadow-2xl flex flex-col gap-3">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-sm font-medium text-zinc-300 hover:text-white py-2 px-3 rounded-lg hover:bg-white/[0.05] transition-colors"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-white/[0.08] flex flex-col gap-2">
            {HAS_CLERK ? (
              <>
                <SignedIn>
                  <Link
                    to="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center bg-white text-black font-semibold text-xs py-2.5 rounded-xl"
                  >
                    Go to Dashboard
                  </Link>
                </SignedIn>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center text-xs font-medium text-zinc-300 py-2"
                    >
                      Sign In
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full text-center bg-white text-black font-semibold text-xs py-2.5 rounded-xl"
                    >
                      Start Journaling
                    </button>
                  </SignUpButton>
                </SignedOut>
              </>
            ) : (
              <>
                <Link
                  to="/sign-in"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center text-xs font-medium text-zinc-300 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-white text-black font-semibold text-xs py-2.5 rounded-xl"
                >
                  Start Journaling
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
