import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables — check your .env file.')
}

/**
 * Supabase client using the anon key.
 *
 * SECURITY RULES (non-negotiable):
 * - NEVER use the service-role key on the frontend.
 * - NEVER bypass RLS policies.
 * - Always inject the Clerk session JWT via the Authorization header
 *   so Supabase can validate the `auth.uid()` claim in RLS policies.
 *
 * Usage:
 *   const token = await window.Clerk.session?.getToken({ template: 'supabase' })
 *   const { data } = await supabase.from('trades').select('*')
 *   // Supabase reads the Authorization header automatically if set via accessToken
 */
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,     // Clerk manages the session — don't double-persist
    autoRefreshToken: false,   // Clerk handles token refresh
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      'X-Client-Info': 'quantyx-web/0.1.0',
    },
  },
})

/**
 * Creates a Supabase client authenticated with a Clerk JWT.
 * Call this before any authenticated query.
 *
 * @example
 *   const token = await window.Clerk?.session?.getToken({ template: 'supabase' })
 *   const client = getAuthenticatedClient(token)
 *   const { data } = await client.from('trades').select('*')
 */
export function getAuthenticatedClient(clerkToken: string) {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}
