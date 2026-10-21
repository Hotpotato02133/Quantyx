import { useState } from 'react'
import { UserButton, useUser } from '@clerk/clerk-react'
import {
  Search,
  Plus,
  Eye,
  EyeOff,
  Bell,
  FileSpreadsheet,
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { CsvImportModal } from '@/components/trades/CsvImportModal'
import { useUserRole } from '@/hooks/useUserRole'
import { cn } from '@/lib/cn'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

export function UserAvatar() {
  if (HAS_CLERK) {
    return <ClerkUserAvatar />
  }
  return <DemoUserAvatar />
}

function DemoUserAvatar() {
  return (
    <div
      id="topbar-user-menu"
      className="flex items-center gap-2 pl-1 pr-1 py-0.5"
    >
      <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-[#FF8C43]/30 bg-[#FF8C43]/15 text-[#FF8C43] font-mono text-[10px] font-semibold uppercase">
        ADMIN
      </span>
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-profit/20 text-profit text-xs font-semibold">
        A
      </div>
      <span className="hidden md:inline text-xs font-medium text-[#F4F4F5]">Alex R.</span>
    </div>
  )
}

function ClerkUserAvatar() {
  const { user } = useUser()
  const { role, roleLabel, roleBadgeColor } = useUserRole()

  return (
    <div id="topbar-user-menu" className="flex items-center gap-2 pl-1 pr-1 py-0.5">
      {/* Role Pill Badge */}
      <span
        className={cn(
          'hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border font-mono text-[10px] font-semibold uppercase',
          roleBadgeColor.bg,
          roleBadgeColor.text,
          roleBadgeColor.border
        )}
        title={`Assigned Role: ${roleLabel}`}
      >
        {role.replace('_', ' ')}
      </span>

      <span className="hidden md:inline text-xs font-medium text-[#F4F4F5]">
        {user?.firstName ?? user?.emailAddresses?.[0]?.emailAddress?.split('@')[0] ?? 'User'}
      </span>

      <UserButton
        appearance={{
          elements: {
            userButtonAvatarBox: 'h-6 w-6 ring-1 ring-border',
            userButtonPopoverCard: 'bg-[#141414] border border-[#262626] shadow-2xl text-[#F4F4F5]',
            userButtonPopoverActionButton: 'text-[#F4F4F5] hover:bg-white/[0.05]',
            userButtonPopoverActionButtonText: 'text-xs text-[#F4F4F5]',
            userButtonPopoverFooter: 'hidden',
          },
        }}
      />
    </div>
  )
}

export function Topbar() {
  const { toggleCommandPalette, setTradeSheetOpen, privacyMode, togglePrivacyMode } =
    useUiStore()
  const [csvModalOpen, setCsvModalOpen] = useState(false)

  return (
    <>
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/[0.06] bg-[#0A0A0A] px-5 gap-3">
        {/* Left — Search Trigger */}
        <div className="flex items-center gap-3">
          <button
            id="topbar-search"
            onClick={toggleCommandPalette}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#141414] border border-white/[0.06] text-zinc-400 text-xs hover:border-white/[0.14] hover:text-white transition-colors min-w-[200px]"
            aria-label="Open command palette (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0 text-zinc-500" strokeWidth={1.75} />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd className="inline-flex items-center gap-0.5 rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[10px] text-zinc-400">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2">
          {/* CSV Import */}
          <button
            id="topbar-import-csv"
            onClick={() => setCsvModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-white/[0.06] bg-[#141414] text-xs font-medium text-zinc-400 hover:text-white hover:border-white/[0.12] transition-colors"
            title="Import trades from CSV"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400" />
            <span>Import CSV</span>
          </button>

          {/* New Trade CTA */}
          <button
            id="topbar-new-trade"
            onClick={() => setTradeSheetOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white text-black text-xs font-semibold hover:bg-zinc-200 active:scale-95 transition-all shadow-sm"
            aria-label="Log new trade (Ctrl+N)"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span className="hidden sm:inline">New Trade</span>
          </button>

          {/* Privacy Mode Toggle */}
          <button
            id="topbar-privacy"
            onClick={togglePrivacyMode}
            aria-label={privacyMode ? 'Disable privacy mode' : 'Enable privacy mode'}
            className={cn(
              'flex h-8 w-8 items-center justify-center rounded-xl border transition-colors',
              privacyMode
                ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                : 'border-white/[0.06] bg-[#141414] text-zinc-400 hover:text-white hover:border-white/[0.12]',
            )}
            title={privacyMode ? 'Privacy Mode Active (Ctrl+B)' : 'Enable Privacy Mode (Ctrl+B)'}
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
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.06] bg-[#141414] text-zinc-400 hover:text-white hover:border-white/[0.12] transition-colors"
          >
            <Bell className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {/* User Profile */}
          <UserAvatar />
        </div>
      </header>

      {/* CSV Import Modal */}
      <CsvImportModal isOpen={csvModalOpen} onClose={() => setCsvModalOpen(false)} />
    </>
  )
}
