import React from 'react'
import { Link } from 'react-router-dom'
import { ShieldAlert, ArrowLeft } from 'lucide-react'
import { useUserRole } from '@/hooks/useUserRole'
import type { UserRole } from '@/types/auth'
import { Button } from '@/components/ui/button'

interface RoleGuardProps {
  allowedRoles: UserRole[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

/**
 * Enforces role-based view access.
 * Displays a sleek terminal-styled restricted screen if the user lacks the required role.
 */
export function RoleGuard({ allowedRoles, children, fallback }: RoleGuardProps) {
  const { role, roleLabel, isLoaded } = useUserRole()

  if (!isLoaded) {
    return (
      <div className="flex h-64 w-full items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-profit border-t-transparent" />
      </div>
    )
  }

  const isAllowed = allowedRoles.includes(role)

  if (isAllowed) {
    return <>{children}</>
  }

  if (fallback) {
    return <>{fallback}</>
  }

  return (
    <div className="flex min-h-[480px] w-full flex-col items-center justify-center p-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-loss/10 border border-loss/20 text-loss mb-4 shadow-lg shadow-loss/5">
        <ShieldAlert className="h-8 w-8" strokeWidth={1.75} />
      </div>

      <h2 className="text-lg font-semibold text-[#F4F4F5] tracking-tight mb-2">
        Access Restricted
      </h2>

      <p className="max-w-md text-xs text-[#A1A1AA] leading-relaxed mb-6">
        This area requires elevated privileges (<span className="text-[#F4F4F5] font-medium">{allowedRoles.join(' or ')}</span>). Your current role is <span className="text-warning font-mono font-medium">{roleLabel}</span>.
      </p>

      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <Button variant="outline" size="sm" className="gap-2">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Return to Terminal</span>
          </Button>
        </Link>
      </div>
    </div>
  )
}
