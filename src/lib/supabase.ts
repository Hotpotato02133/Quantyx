import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

export const isSupabaseConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
export const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

/**
 * Default anon Supabase client singleton.
 *
 * SECURITY RULES (non-negotiable):
 * - NEVER use the service-role key on the frontend.
 * - NEVER bypass RLS policies.
 * - Always inject the Clerk session JWT via Authorization header / accessToken callback
 *   so PostgreSQL RLS policies can evaluate:
 *     (SELECT auth.jwt() ->> 'sub') = user_id
 */
export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      persistSession: false,     // Clerk manages the session — avoid double-persistence
      autoRefreshToken: false,   // Clerk handles token refreshing
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'quantyx-web/0.1.0',
      },
    },
  },
)

/**
 * Creates an authenticated Supabase client using an explicit Clerk JWT.
 * Useful for one-off operations or server-side calls.
 */
export function getAuthenticatedClient(clerkToken: string): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        Authorization: `Bearer ${clerkToken}`,
        'X-Client-Info': 'quantyx-web/0.1.0',
      },
    },
  })
}

/**
 * Creates a Supabase client that dynamically invokes a token getter callback
 * before each request, ensuring refreshed Clerk tokens are seamlessly forwarded.
 */
export function createClerkSupabaseClient(
  getToken: () => Promise<string | null>,
): SupabaseClient<Database> {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'quantyx-web/0.1.0',
      },
    },
    accessToken: async () => {
      try {
        const token = await getToken()
        return token ?? ''
      } catch {
        return ''
      }
    },
  })
}
