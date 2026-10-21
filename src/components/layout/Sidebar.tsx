import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  BookMarked,
  Users,
  Settings,
  ChevronLeft,
  Zap,
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { useUserRole } from '@/hooks/useUserRole'
import { cn } from '@/lib/cn'

const BASE_NAV_ITEMS = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/journal', icon: BookOpen, label: 'Journal' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/playbooks', icon: BookMarked, label: 'Playbooks' },
]

export function Sidebar() {
  const { sidebarCollapsed, toggleSidebar } = useUiStore()
  const { canManageUsers } = useUserRole()

  const navItems = canManageUsers
    ? [...BASE_NAV_ITEMS, { to: '/users', icon: Users, label: 'Users & Roles' }]
    : BASE_NAV_ITEMS

  return (
    <aside
      className={cn(
        'relative flex flex-col bg-surface border-r border-border transition-all duration-300 ease-in-out shrink-0',
        sidebarCollapsed ? 'w-[60px]' : 'w-[220px]',
      )}
    >
      {/* Logo */}
      <div
        className={cn(
          'flex items-center gap-2.5 px-4 py-5 border-b border-border',
          sidebarCollapsed && 'justify-center px-0',
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-profit/15 border border-profit/30 shrink-0">
          <Zap className="h-4 w-4 text-profit" strokeWidth={2.5} />
        </div>
        {!sidebarCollapsed && (
          <span className="font-semibold text-sm tracking-tight text-[#F4F4F5]">
            Quantyx
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors duration-150',
                isActive
                  ? 'bg-profit/10 text-profit border border-profit/20'
                  : 'text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5]',
                sidebarCollapsed && 'justify-center gap-0 px-0',
              )
            }
            title={sidebarCollapsed ? label : undefined}
          >
            <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
            {!sidebarCollapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="px-2 pb-4 space-y-0.5 border-t border-border pt-3">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-2.5 py-2 rounded-md text-sm transition-colors duration-150',
              isActive
                ? 'bg-profit/10 text-profit border border-profit/20'
                : 'text-[#A1A1AA] hover:bg-white/5 hover:text-[#F4F4F5]',
              sidebarCollapsed && 'justify-center gap-0 px-0',
            )
          }
          title={sidebarCollapsed ? 'Settings' : undefined}
        >
          <Settings className="h-4 w-4 shrink-0" strokeWidth={1.75} />
          {!sidebarCollapsed && <span>Settings</span>}
        </NavLink>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        className={cn(
          'absolute -right-3 top-[72px] z-10 flex h-6 w-6 items-center justify-center rounded-full',
          'bg-surface border border-border text-[#A1A1AA] hover:text-[#F4F4F5] hover:border-profit/40',
          'transition-colors duration-150 shadow-md',
        )}
      >
        <ChevronLeft
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-300',
            sidebarCollapsed && 'rotate-180',
          )}
          strokeWidth={2}
        />
      </button>
    </aside>
  )
}
