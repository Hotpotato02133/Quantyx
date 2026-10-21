import { useUser } from '@clerk/clerk-react'
import type { UserRole } from '@/types/auth'

export interface UserRoleResult {
  role: UserRole
  isAdmin: boolean
  isUserAdmin: boolean
  isStandardUser: boolean
  canManageUsers: boolean
  roleLabel: string
  roleBadgeColor: {
    bg: string
    text: string
    border: string
  }
  isLoaded: boolean
  isSignedIn: boolean
}

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

export function parseUserRole(metadata?: Record<string, unknown> | null): UserRole {
  if (!metadata) return 'user'
  const rawRole = (metadata.role || metadata.user_role) as string | undefined
  if (rawRole === 'admin') return 'admin'
  if (rawRole === 'user_admin' || rawRole === 'user-admin' || rawRole === 'useradmin') return 'user_admin'
  return 'user'
}

export function getRoleBadgeStyle(role: UserRole) {
  switch (role) {
    case 'admin':
      return {
        bg: 'bg-[#FF8C43]/15',
        text: 'text-[#FF8C43]',
        border: 'border-[#FF8C43]/30',
      }
    case 'user_admin':
      return {
        bg: 'bg-[#1DB954]/15',
        text: 'text-[#1DB954]',
        border: 'border-[#1DB954]/30',
      }
    case 'user':
    default:
      return {
        bg: 'bg-white/[0.06]',
        text: 'text-[#A1A1AA]',
        border: 'border-white/[0.12]',
      }
  }
}

export function getRoleLabel(role: UserRole): string {
  switch (role) {
    case 'admin':
      return 'Super Admin'
    case 'user_admin':
      return 'User Admin'
    case 'user':
    default:
      return 'Trader'
  }
}

/**
 * Hook to retrieve the current authenticated user's role and permissions.
 * Reads from Clerk's user.publicMetadata (with unsafeMetadata fallback),
 * defaulting safely to 'user'.
 */
export function useUserRole(): UserRoleResult {
  if (!HAS_CLERK) {
    // Local / Demo mode fallback: admin privileges so power-user features remain testable
    return {
      role: 'admin',
      isAdmin: true,
      isUserAdmin: false,
      isStandardUser: false,
      canManageUsers: true,
      roleLabel: 'Super Admin (Demo)',
      roleBadgeColor: getRoleBadgeStyle('admin'),
      isLoaded: true,
      isSignedIn: true,
    }
  }

  // When Clerk is active, call useUser() safely
  return useClerkUserRole()
}

function useClerkUserRole(): UserRoleResult {
  const { user, isLoaded, isSignedIn } = useUser()

  const role: UserRole = parseUserRole(
    (user?.publicMetadata as Record<string, unknown>) ||
    (user?.unsafeMetadata as Record<string, unknown>)
  )

  const isAdmin = role === 'admin'
  const isUserAdmin = role === 'user_admin'
  const isStandardUser = role === 'user'
  const canManageUsers = isAdmin || isUserAdmin

  return {
    role,
    isAdmin,
    isUserAdmin,
    isStandardUser,
    canManageUsers,
    roleLabel: getRoleLabel(role),
    roleBadgeColor: getRoleBadgeStyle(role),
    isLoaded,
    isSignedIn: Boolean(isSignedIn),
  }
}
