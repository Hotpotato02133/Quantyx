import { NavLink } from 'react-router-dom'
import {
  LayoutGrid,
  BookOpen,
  Calendar,
  BarChart2,
  GitBranch,
  Users,
  Settings,
  Search,
  PanelLeft,
  Sparkles,
  HelpCircle,
  ChevronRight,
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { useUserRole } from '@/hooks/useUserRole'
import { AccountSwitcher } from '@/components/layout/AccountSwitcher'
import { cn } from '@/lib/cn'

export function Sidebar() {
  const {
    sidebarCollapsed,
    toggleSidebar,
    toggleCommandPalette,
    settingsModalOpen,
    setSettingsModalOpen,
    setCsvModalOpen,
  } = useUiStore()
  const { canManageUsers } = useUserRole()

  const platformNavItems = [
    { to: '/dashboard', icon: LayoutGrid, label: 'Dashboard' },
    { to: '/journal', icon: BookOpen, label: 'Trade Journal' },
    { to: '/calendar', icon: Calendar, label: 'Calendar' },
    { to: '/analytics', icon: BarChart2, label: 'Analytics & Reports' },
    { to: '/playbooks', icon: GitBranch, label: 'Workflows & Playbooks' },
    ...(canManageUsers ? [{ to: '/users', icon: Users, label: 'Users & Roles' }] : []),
  ]

  return (
    <aside
      className={cn(
        'relative flex flex-col justify-between shrink-0 bg-[#0A0A0A] border-r border-white/[0.06] select-none transition-all duration-300 ease-in-out z-30 h-screen',
        sidebarCollapsed ? 'w-[68px] p-2.5' : 'w-[260px] p-4',
      )}
    >
      {/* ─── Top Brand & Collapse Row ────────────────────────────────────── */}
      <div>
        <div className={cn('flex items-center justify-between', sidebarCollapsed && 'flex-col gap-3')}>
          <div className="flex items-center gap-2.5">
            {/* Geometric pixel logo */}
            <div className="flex items-center justify-center text-white">
              <svg className="w-6 h-6 text-white" viewBox="0 0 24 24" fill="currentColor">
                <rect x="2" y="3" width="7" height="7" rx="1.5" />
                <rect x="11" y="3" width="11" height="7" rx="1.5" />
                <rect x="2" y="12" width="11" height="7" rx="1.5" />
                <rect x="15" y="12" width="7" height="7" rx="1.5" />
              </svg>
            </div>
            {!sidebarCollapsed && (
              <span className="font-semibold text-sm tracking-tight text-white font-mono">
                QUANTYX
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.06] flex items-center justify-center transition-colors"
            title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <PanelLeft className="w-4 h-4" />
          </button>
        </div>

        {/* ─── Command Palette Search Trigger Pill ─────────────────────────── */}
        {!sidebarCollapsed ? (
          <button
            type="button"
            id="sidebar-search-button"
            onClick={toggleCommandPalette}
            className="w-full h-9 px-3 rounded-xl bg-[#161616] border border-white/[0.06] flex items-center justify-between text-xs text-zinc-400 hover:border-white/[0.14] hover:text-zinc-200 transition-colors mt-4 mb-5"
            aria-label="Search or command palette (⌘K)"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
              <span>Search...</span>
            </div>
            <div className="flex items-center gap-1 font-mono text-[10px] text-zinc-400">
              <kbd className="bg-white/[0.06] px-1.5 py-0.5 rounded text-[10px]">⌘</kbd>
              <kbd className="bg-white/[0.06] px-1.5 py-0.5 rounded text-[10px]">K</kbd>
            </div>
          </button>
        ) : (
          <button
            type="button"
            id="sidebar-search-button-collapsed"
            onClick={toggleCommandPalette}
            className="w-10 h-10 mx-auto rounded-xl bg-[#161616] border border-white/[0.06] flex items-center justify-center text-zinc-400 hover:text-white hover:border-white/[0.14] transition-colors mt-4 mb-5"
            aria-label="Search or command palette (⌘K)"
            title="Search... (⌘K)"
          >
            <Search className="w-4 h-4 text-zinc-400" />
          </button>
        )}

        {/* ─── Platform Nav Group ─────────────────────────────────────────── */}
        <div className="space-y-1">
          {!sidebarCollapsed && (
            <div className="text-[11px] font-medium text-zinc-500 px-3 mb-1.5 uppercase tracking-wider">
              Platform
            </div>
          )}

          <nav className="space-y-0.5">
            {platformNavItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                end
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 px-3 py-2 rounded-xl text-xs transition-all duration-150',
                    isActive
                      ? 'bg-[#1C1C1C] text-white font-medium shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]',
                    sidebarCollapsed && 'justify-center px-0 py-2.5',
                  )
                }
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" strokeWidth={1.8} />
                {!sidebarCollapsed && <span className="truncate">{label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* ─── System Nav Group ───────────────────────────────────────────── */}
        <div className="mt-5 space-y-1">
          {!sidebarCollapsed && (
            <div className="text-[11px] font-medium text-zinc-500 px-3 mb-1.5 uppercase tracking-wider">
              System
            </div>
          )}

          <button
            type="button"
            id="sidebar-settings-button"
            onClick={() => setSettingsModalOpen(true)}
            aria-label="Open settings"
            className={cn(
              'flex w-full items-center justify-between px-3 py-2 rounded-xl text-xs transition-colors',
              settingsModalOpen
                ? 'bg-[#1C1C1C] text-white font-medium'
                : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.04]',
              sidebarCollapsed && 'justify-center px-0 py-2.5',
            )}
            title={sidebarCollapsed ? 'Settings' : undefined}
          >
            <div className="flex items-center gap-3">
              <Settings className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              {!sidebarCollapsed && <span>Settings</span>}
            </div>
            {!sidebarCollapsed && <ChevronRight className="w-3.5 h-3.5 text-zinc-500" />}
          </button>
        </div>
      </div>

      {/* ─── Bottom Stack (What's New, Links & Account Switcher) ──────────── */}
      <div className="space-y-3 pt-4 border-t border-white/[0.06]">
        {!sidebarCollapsed && (
          <>
            {/* "What's new?" Card */}
            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
                <span>What's new?</span>
              </div>
              <ul className="space-y-1.5 text-xs text-zinc-400">
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-zinc-400 inline-block" />
                  <span>Execution R-Multiple tracking</span>
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-zinc-400 inline-block" />
                  <button
                    type="button"
                    onClick={() => setCsvModalOpen(true)}
                    className="text-left hover:text-white transition-colors"
                  >
                    CSV broker auto-sync
                  </button>
                </li>
                <li className="flex items-center gap-1.5 text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer">
                  <span className="w-1 h-1 rounded-full bg-zinc-500 inline-block" />
                  <span>Full changelog</span>
                </li>
              </ul>
            </div>

            {/* Utility links */}
            <div className="space-y-0.5 px-1">
              <a
                href="#help"
                onClick={(e) => {
                  e.preventDefault()
                  setSettingsModalOpen(true)
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5 text-zinc-500" />
                <span>Help Center</span>
              </a>
              <a
                href="#docs"
                onClick={(e) => {
                  e.preventDefault()
                  window.open('https://github.com/Hotpotato02133/Quantyx', '_blank')
                }}
                className="flex items-center gap-2 px-2 py-1.5 text-xs text-zinc-400 hover:text-zinc-200 rounded-lg hover:bg-white/[0.03] transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                <span>Documentation</span>
              </a>
            </div>
          </>
        )}

        {/* Bottom Floating Account Switcher (Customizer style) */}
        <div className="w-full">
          <AccountSwitcher />
        </div>
      </div>
    </aside>
  )
}
