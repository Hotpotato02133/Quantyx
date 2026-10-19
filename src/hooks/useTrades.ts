import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { getAuthenticatedClient } from '@/lib/supabase'
import type { Trade, TradeInsert, TradeUpdate, TradeFilters } from '@/types'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: (filters: TradeFilters) => [...tradeKeys.lists(), filters] as const,
  detail: (id: string) => [...tradeKeys.all, 'detail', id] as const,
}

// ─── Fetch Trades ─────────────────────────────────────────────────────────────

/**
 * Fetches trades from Supabase for the current authenticated user.
 * Clerk JWT is injected so Supabase RLS can validate auth.uid().
 */
export function useTrades(filters: TradeFilters = {}) {
  const { getToken } = useAuth()

  return useQuery({
    queryKey: tradeKeys.list(filters),
    queryFn: async () => {
      const token = await getToken({ template: 'supabase' })
      if (!token) throw new Error('No auth token available')

      const client = getAuthenticatedClient(token)
      let query = client
        .from('trades')
        .select('*')
        .order('entry_at', { ascending: false })

      if (filters.direction && filters.direction !== 'all') {
        query = query.eq('direction', filters.direction)
      }
      if (filters.symbol) {
        query = query.ilike('symbol', `%${filters.symbol}%`)
      }
      if (filters.dateFrom) {
        query = query.gte('entry_at', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('entry_at', filters.dateTo)
      }
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      const { data, error } = await query
      if (error) throw error
      return data as Trade[]
    },
  })
}

// ─── Create Trade ─────────────────────────────────────────────────────────────

export function useCreateTrade() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (newTrade: TradeInsert) => {
      const token = await getToken({ template: 'supabase' })
      if (!token) throw new Error('No auth token available')

      const client = getAuthenticatedClient(token)
      const { data, error } = await client
        .from('trades')
        .insert(newTrade)
        .select()
        .single()

      if (error) throw error
      return data as Trade
    },

    // Optimistic update — UI responds in <16ms
    onMutate: async (newTrade) => {
      await queryClient.cancelQueries({ queryKey: tradeKeys.lists() })
      const previousTrades = queryClient.getQueryData<Trade[]>(tradeKeys.lists())

      const optimisticTrade: Trade = {
        id: `optimistic-${Date.now()}`,
        user_id: 'optimistic',
        pnl: null,
        r_multiple: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newTrade,
      }

      queryClient.setQueriesData({ queryKey: tradeKeys.lists() }, (old: Trade[] | undefined) => [
        optimisticTrade,
        ...(old ?? []),
      ])

      return { previousTrades }
    },

    onError: (_err, _vars, context) => {
      if (context?.previousTrades) {
        queryClient.setQueriesData({ queryKey: tradeKeys.lists() }, context.previousTrades)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() })
    },
  })
}

// ─── Update Trade ─────────────────────────────────────────────────────────────

export function useUpdateTrade() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TradeUpdate }) => {
      const token = await getToken({ template: 'supabase' })
      if (!token) throw new Error('No auth token available')

      const client = getAuthenticatedClient(token)
      const { data, error } = await client
        .from('trades')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data as Trade
    },

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: tradeKeys.lists() })

      queryClient.setQueriesData({ queryKey: tradeKeys.lists() }, (old: Trade[] | undefined) =>
        (old ?? []).map((t) => (t.id === id ? { ...t, ...updates } : t)),
      )
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() })
    },
  })
}

// ─── Delete Trade ─────────────────────────────────────────────────────────────

export function useDeleteTrade() {
  const queryClient = useQueryClient()
  const { getToken } = useAuth()

  return useMutation({
    mutationFn: async (id: string) => {
      const token = await getToken({ template: 'supabase' })
      if (!token) throw new Error('No auth token available')

      const client = getAuthenticatedClient(token)
      const { error } = await client.from('trades').delete().eq('id', id)
      if (error) throw error
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tradeKeys.lists() })

      queryClient.setQueriesData({ queryKey: tradeKeys.lists() }, (old: Trade[] | undefined) =>
        (old ?? []).filter((t) => t.id !== id),
      )
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() })
    },
  })
}
