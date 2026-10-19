import { QueryClient } from '@tanstack/react-query'

/**
 * Singleton TanStack Query client.
 *
 * Configuration rationale:
 * - staleTime: 30s  — trading data changes frequently; 30s keeps it fresh without hammering Supabase.
 * - gcTime: 5m      — keep inactive cache for 5 minutes so navigating back is instant.
 * - retry: 1        — one retry on network failures; avoid infinite loops on auth errors.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30 * 1000,        // 30 seconds
      gcTime: 5 * 60 * 1000,       // 5 minutes
      retry: 1,
      refetchOnWindowFocus: true,
    },
    mutations: {
      retry: 0,
    },
  },
})
