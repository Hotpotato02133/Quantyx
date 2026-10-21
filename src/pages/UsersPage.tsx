import { useState } from 'react'
import {
  Users,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Search,
  Filter,
  CheckCircle2,
  ExternalLink,
  Info,
} from 'lucide-react'
import { useUserRole, getRoleBadgeStyle } from '@/hooks/useUserRole'
import type { UserRole, ManagedUser } from '@/types/auth'
import { cn } from '@/lib/cn'

// Default mock team members for initial evaluation and management demo
const INITIAL_USERS: ManagedUser[] = [
  {
    id: 'user_admin_01',
    fullName: 'Alex Vance',
    email: 'alex@quantyx.trade',
    role: 'admin',
    createdAt: '2026-01-10T14:30:00Z',
    lastSignInAt: '2026-10-20T22:15:00Z',
    accountsCount: 3,
    tradesCount: 428,
  },
  {
    id: 'user_uadmin_02',
    fullName: 'Marcus Vance',
    email: 'marcus@quantyx.trade',
    role: 'user_admin',
    createdAt: '2026-02-15T09:12:00Z',
    lastSignInAt: '2026-10-20T18:40:00Z',
    accountsCount: 2,
    tradesCount: 195,
  },
  {
    id: 'user_trader_03',
    fullName: 'Elena Rostova',
    email: 'elena@quantyx.trade',
    role: 'user',
    createdAt: '2026-03-01T11:00:00Z',
    lastSignInAt: '2026-10-20T15:20:00Z',
    accountsCount: 1,
    tradesCount: 84,
  },
  {
    id: 'user_trader_04',
    fullName: 'David Chen',
    email: 'david.chen@quantyx.trade',
    role: 'user',
    createdAt: '2026-04-12T16:45:00Z',
    lastSignInAt: '2026-10-19T10:05:00Z',
    accountsCount: 2,
    tradesCount: 312,
  },
]

export default function UsersPage() {
  const { role: currentUserRole, isAdmin } = useUserRole()
  const [users, setUsers] = useState<ManagedUser[]>(INITIAL_USERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all')
  const [notification, setNotification] = useState<string | null>(null)

  // Filtered list
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesRole = roleFilter === 'all' || u.role === roleFilter
    return matchesSearch && matchesRole
  })

  // Role stats
  const totalCount = users.length
  const adminCount = users.filter((u) => u.role === 'admin').length
  const userAdminCount = users.filter((u) => u.role === 'user_admin').length
  const traderCount = users.filter((u) => u.role === 'user').length

  const handleRoleChange = (userId: string, newRole: UserRole) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
    )
    const targetUser = users.find((u) => u.id === userId)
    setNotification(
      `Updated ${targetUser?.fullName ?? 'User'} to ${newRole.toUpperCase().replace('_', ' ')}`
    )
    setTimeout(() => setNotification(null), 3500)
  }

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight text-[#F4F4F5] uppercase font-mono">
              User & Role Management
            </h1>
            <span className="rounded bg-profit/15 border border-profit/30 px-2 py-0.5 font-mono text-[11px] text-profit uppercase">
              RBAC Enabled
            </span>
          </div>
          <p className="text-xs text-[#A1A1AA] mt-1">
            Manage team roles (<code className="text-[#F4F4F5]">admin</code>, <code className="text-[#F4F4F5]">user_admin</code>, <code className="text-[#F4F4F5]">user</code>) and assign account permissions.
          </p>
        </div>

        {/* Current Operator Role Status */}
        <div className="flex items-center gap-2 rounded-lg bg-surface border border-border px-3 py-2 text-xs">
          <Shield className="h-4 w-4 text-profit" />
          <span className="text-[#A1A1AA]">Current Access:</span>
          <span className="font-mono font-semibold text-[#F4F4F5] uppercase">
            {currentUserRole.replace('_', ' ')}
          </span>
        </div>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div className="flex items-center gap-2 rounded-md bg-profit/15 border border-profit/30 px-3 py-2 text-xs text-profit animate-in fade-in duration-200">
          <CheckCircle2 className="h-4 w-4" />
          <span>{notification}</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-border bg-surface p-4">
          <span className="text-xs text-[#A1A1AA]">Total Users</span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#F4F4F5]">{totalCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-1.5 text-xs text-[#FF8C43]">
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Admins</span>
          </div>
          <p className="mt-1 font-mono text-2xl font-bold text-[#FF8C43]">{adminCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="flex items-center gap-1.5 text-xs text-profit">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>User Admins</span>
          </div>
          <p className="mt-1 font-mono text-2xl font-bold text-profit">{userAdminCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <span className="text-xs text-[#A1A1AA]">Traders</span>
          <p className="mt-1 font-mono text-2xl font-bold text-[#F4F4F5]">{traderCount}</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-border bg-surface p-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search by name or email…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-[#18181B] pl-9 pr-3 py-1.5 text-xs text-[#F4F4F5] placeholder:text-[#525252] focus:border-profit focus:outline-none"
          />
        </div>

        {/* Role Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <Filter className="h-3.5 w-3.5 text-[#A1A1AA] mr-1 shrink-0" />
          {(['all', 'admin', 'user_admin', 'user'] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={cn(
                'px-2.5 py-1 rounded text-xs font-mono transition-colors',
                roleFilter === r
                  ? 'bg-profit text-[#0A0A0A] font-semibold'
                  : 'bg-white/[0.04] text-[#A1A1AA] hover:bg-white/[0.08] hover:text-[#F4F4F5]'
              )}
            >
              {r === 'all' ? 'All Roles' : r.toUpperCase().replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Users Data Grid */}
      <div className="rounded-lg border border-border bg-surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-[#18181B]/50 font-mono text-[11px] uppercase text-[#A1A1AA]">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Accounts</th>
                <th className="px-4 py-3">Trades</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3 text-right">Role Assignment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border font-sans">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#A1A1AA]">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const badge = getRoleBadgeStyle(u.role)
                  return (
                    <tr key={u.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* User Info */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-profit/15 text-profit font-semibold text-xs border border-profit/20">
                            {u.fullName[0]}
                          </div>
                          <div>
                            <div className="font-medium text-[#F4F4F5]">{u.fullName}</div>
                            <div className="text-[11px] text-[#A1A1AA] font-mono">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3">
                        <span
                          className={cn(
                            'inline-flex items-center gap-1 px-2 py-0.5 rounded border font-mono text-[10px] font-semibold uppercase',
                            badge.bg,
                            badge.text,
                            badge.border
                          )}
                        >
                          {u.role === 'admin' && <ShieldAlert className="h-3 w-3" />}
                          {u.role === 'user_admin' && <ShieldCheck className="h-3 w-3" />}
                          {u.role === 'user' && <Users className="h-3 w-3" />}
                          {u.role.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Accounts */}
                      <td className="px-4 py-3 font-mono text-[#F4F4F5]">
                        {u.accountsCount} {u.accountsCount === 1 ? 'account' : 'accounts'}
                      </td>

                      {/* Trades */}
                      <td className="px-4 py-3 font-mono tabular-nums text-[#F4F4F5]">
                        {u.tradesCount}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3 text-[#A1A1AA] font-mono text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Action / Role Assignment */}
                      <td className="px-4 py-3 text-right">
                        <select
                          value={u.role}
                          disabled={!isAdmin && u.role === 'admin'}
                          onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                          className="rounded border border-border bg-[#18181B] px-2.5 py-1 text-xs font-mono text-[#F4F4F5] focus:border-profit focus:outline-none cursor-pointer disabled:opacity-50"
                        >
                          <option value="user">Trader (user)</option>
                          <option value="user_admin">User Admin (user_admin)</option>
                          <option value="admin">Super Admin (admin)</option>
                        </select>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clerk Role Management Info Box */}
      <div className="rounded-lg border border-border bg-[#141414] p-4 text-xs text-[#A1A1AA] space-y-2">
        <div className="flex items-center gap-2 text-[#F4F4F5] font-semibold">
          <Info className="h-4 w-4 text-profit" />
          <span>How Clerk RBAC Works in Quantyx</span>
        </div>
        <p className="leading-relaxed">
          Roles are stored directly in Clerk’s <code className="text-[#1DB954] font-mono">user.publicMetadata.role</code>. You can also assign roles programmatically via the Clerk Management API or directly from the Clerk Dashboard under <span className="text-[#F4F4F5]">Users → Select User → Metadata</span>:
        </p>
        <pre className="rounded bg-[#18181B] border border-border p-3 font-mono text-[11px] text-[#F4F4F5] overflow-x-auto">
{`{
  "role": "admin"        // Options: "admin" | "user_admin" | "user"
}`}
        </pre>
        <div className="pt-2 flex items-center gap-2">
          <a
            href="https://dashboard.clerk.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-profit hover:underline font-mono text-xs"
          >
            <span>Open Clerk Dashboard</span>
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </div>
    </div>
  )
}
