import React from 'react'
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * Route protection wrapper.
 * When Clerk is configured, enforces authentication using Clerk's <SignedIn> / <SignedOut>.
 * When in local development / demo mode without Clerk keys, seamlessly allows access.
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!HAS_CLERK) {
    return <>{children}</>
  }

  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <RedirectToSignIn signInFallbackRedirectUrl="/dashboard" />
      </SignedOut>
    </>
  )
}
