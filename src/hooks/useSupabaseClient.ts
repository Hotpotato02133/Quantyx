import { useMemo } from 'react'
import { useSession } from '@clerk/clerk-react'
import type { SupabaseClient } from '@supabase/supabase-js'
import {
  supabase,
  createClerkSupabaseClient,
  isSupabaseConfigured,
} from '@/lib/supabase'
import type { Database } from '@/types/database'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

function useClerkSessionSafe() {
  if (HAS_CLERK) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useSession()
  }
  return { session: null, isLoaded: true, isSignedIn: false }
}

/**
 * React hook that returns an authenticated Supabase client.
 * Injects the Clerk session JWT via session.getToken({ template: 'supabase' })
 * into every database request so PostgreSQL RLS policies can authorize:
 *   (SELECT auth.jwt() ->> 'sub') = user_id
 */
export function useSupabaseClient(): SupabaseClient<Database> {
  const { session } = useClerkSessionSafe()

  return useMemo(() => {
    if (!HAS_CLERK || !isSupabaseConfigured || !session) {
      return supabase
    }

    return createClerkSupabaseClient(async () => {
      try {
        return await session.getToken({ template: 'supabase' })
      } catch {
        return null
      }
    })
  }, [session])
}
