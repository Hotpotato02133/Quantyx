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
import { AccountSwitcher } from '@/components/layout/AccountSwitcher'
import { CsvImportModal } from '@/components/trades/CsvImportModal'
import { useUserRole } from '@/hooks/useUserRole'
import { cn } from '@/lib/cn'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

function UserAvatar() {
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
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-surface px-4 gap-3">
        {/* Left — Account Switcher & Search Trigger */}
        <div className="flex items-center gap-3">
          <AccountSwitcher />

          <button
            id="topbar-search"
            onClick={toggleCommandPalette}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.04] border border-border text-[#A1A1AA] text-sm hover:bg-white/[0.07] hover:text-[#F4F4F5] transition-colors duration-150 min-w-[200px]"
            aria-label="Open command palette (Ctrl+K)"
          >
            <Search className="h-3.5 w-3.5 shrink-0" strokeWidth={1.75} />
            <span className="flex-1 text-left">Search or jump to…</span>
            <kbd className="inline-flex items-center gap-0.5 rounded border border-border px-1 py-0.5 font-mono text-[10px] text-[#525252]">
              <span>Ctrl</span>
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md border border-border text-xs font-medium text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/[0.05] transition-colors"
            title="Import trades from CSV"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-profit" />
            <span>Import CSV</span>
          </button>

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

          {/* Privacy Mode Toggle */}
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
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#F4F4F5] transition-colors duration-150"
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
