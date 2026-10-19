import { useUser } from '@clerk/clerk-react'
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Bell,
  ChevronDown,
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { cn } from '@/lib/cn'

export function Topbar() {
  const { user } = useUser()
  const { toggleCommandPalette, setTradeSheetOpen, privacyMode, togglePrivacyMode } =
    useUiStore()

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-4 gap-3">
      {/* Left — Search trigger */}
      <button
        id="topbar-search"
        onClick={toggleCommandPalette}
        className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.04] border border-border text-[#A1A1AA] text-sm hover:bg-white/[0.07] hover:text-[#F4F4F5] transition-colors duration-150 min-w-[200px]"
        aria-label="Open command palette (Ctrl+K)"
      >
        <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
        <span className="flex-1 text-left">Search or jump to…</span>
        <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded border border-border px-1 py-0.5 font-mono text-[10px] text-[#525252]">
          <span>Ctrl</span>
          <span>K</span>
        </kbd>
      </button>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {/* New Trade CTA */}
        <button
          id="topbar-new-trade"
          onClick={() => setTradeSheetOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-profit text-[#0A0A0A] text-sm font-semibold hover:bg-profit/90 active:scale-95 transition-all duration-150"
          aria-label="Log new trade (Ctrl+N)"
        >
          <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
          <span className="hidden sm:inline">New Trade</span>
        </button>

        {/* Privacy Mode */}
        <button
          id="topbar-privacy"
          onClick={togglePrivacyMode}
          aria-label={privacyMode ? 'Disable privacy mode' : 'Enable privacy mode'}
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-md border transition-colors duration-150',
            privacyMode
              ? 'border-warning/40 bg-warning/10 text-warning'
              : 'border-border bg-transparent text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#F4F4F5]',
          )}
        >
          {privacyMode ? (
            <EyeOff className="h-4 w-4" strokeWidth={1.75} />
          ) : (
            <Eye className="h-4 w-4" strokeWidth={1.75} />
          )}
        </button>

        {/* Notifications */}
        <button
          id="topbar-notifications"
          aria-label="Notifications"
          className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#F4F4F5] transition-colors duration-150"
        >
          <Bell className="h-4 w-4" strokeWidth={1.75} />
        </button>

        {/* User Avatar */}
        <button
          id="topbar-user-menu"
          aria-label="User menu"
          className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-md hover:bg-white/[0.05] transition-colors duration-150"
        >
          {user?.imageUrl ? (
            <img
              src={user.imageUrl}
              alt={user.fullName ?? 'User'}
              className="h-6 w-6 rounded-full object-cover ring-1 ring-border"
            />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-profit/20 text-profit text-xs font-semibold">
              {user?.firstName?.[0] ?? 'U'}
            </div>
          )}
          <ChevronDown className="h-3 w-3 text-[#A1A1AA]" strokeWidth={2} />
        </button>
      </div>
    </header>
  )
}
