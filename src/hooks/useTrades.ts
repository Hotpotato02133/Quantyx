import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@clerk/clerk-react'
import { getAuthenticatedClient, isSupabaseConfigured } from '@/lib/supabase'
import { MOCK_TRADES } from '@/lib/mockData'
import { calcPnL, calcRMultiple } from '@/lib/math'
import { useFilterStore } from '@/store/useFilterStore'
import type { Trade, TradeInsert, TradeUpdate, TradeFilters } from '@/types'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

// Safe wrapper for useAuth to avoid errors when Clerk is not mounted
function useTokenGetter() {
  if (HAS_CLERK) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { getToken } = useAuth()
    return getToken
  }
  return async () => null
}

// In-memory trade cache for local dev / demo mode
let inMemoryTrades: Trade[] = [...MOCK_TRADES]

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const tradeKeys = {
  all: ['trades'] as const,
  lists: () => [...tradeKeys.all, 'list'] as const,
  list: (filters: TradeFilters) => [...tradeKeys.lists(), filters] as const,
  detail: (id: string) => [...tradeKeys.all, 'detail', id] as const,
}

// ─── Fetch Trades ─────────────────────────────────────────────────────────────

export function useTrades(filters: TradeFilters = {}) {
  const getToken = useTokenGetter()

  return useQuery({
    queryKey: tradeKeys.list(filters),
    queryFn: async () => {
      if (HAS_CLERK && isSupabaseConfigured) {
        try {
          const token = await getToken({ template: 'supabase' })
          if (token) {
            const client = getAuthenticatedClient(token)
            let query = client
              .from('trades')
              .select('*')
              .order('entry_at', { ascending: false })

            if (filters.accountId) {
              query = query.eq('account_id', filters.accountId)
            }
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
            if (!error && data && data.length > 0) {
              return data as Trade[]
            }
          }
        } catch {
          // Fall through to in-memory trades
        }
      }

      // Filter in-memory trades
      let result = [...inMemoryTrades]
      if (filters.accountId) {
        result = result.filter(
          (t) => !t.account_id || t.account_id === filters.accountId,
        )
      }
      if (filters.direction && filters.direction !== 'all') {
        result = result.filter((t) => t.direction === filters.direction)
      }
      if (filters.symbol) {
        result = result.filter((t) =>
          t.symbol.toLowerCase().includes(filters.symbol!.toLowerCase()),
        )
      }
      if (filters.status && filters.status !== 'all') {
        result = result.filter((t) => t.status === filters.status)
      }
      if (filters.tags && filters.tags.length > 0) {
        result = result.filter((t) =>
          t.tags.some((tag) => filters.tags!.includes(tag)),
        )
      }

      return result
    },
  })
}

// ─── Create Trade ─────────────────────────────────────────────────────────────

export function useCreateTrade() {
  const queryClient = useQueryClient()
  const getToken = useTokenGetter()

  return useMutation({
    mutationFn: async (newTrade: TradeInsert) => {
      let pnl = (newTrade as Partial<Trade>).pnl ?? null
      let r_multiple = (newTrade as Partial<Trade>).r_multiple ?? null

      if (newTrade.status === 'closed' && newTrade.exit_price) {
        pnl = calcPnL(
          newTrade.direction,
          newTrade.entry_price,
          newTrade.exit_price,
          newTrade.quantity,
        )
        r_multiple = calcRMultiple(
          pnl,
          newTrade.entry_price,
          newTrade.stop_price ?? newTrade.entry_price,
          newTrade.quantity,
        )
      }

      const activeAccountId = useFilterStore.getState().accountId

      if (HAS_CLERK && isSupabaseConfigured) {
        try {
          const token = await getToken({ template: 'supabase' })
          if (token) {
            const client = getAuthenticatedClient(token)
            const { data, error } = await client
              .from('trades')
              .insert({
                ...newTrade,
                account_id: newTrade.account_id ?? activeAccountId ?? undefined,
                pnl,
                r_multiple,
              } as never)
              .select()
              .single()

            if (!error && data) return data as Trade
          }
        } catch {
          // Fall through to in-memory store
        }
      }

      const created: Trade = {
        id: `tr_${Date.now()}`,
        user_id: 'user_local',
        account_id: newTrade.account_id ?? activeAccountId ?? undefined,
        ...newTrade,
        pnl,
        r_multiple,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      inMemoryTrades = [created, ...inMemoryTrades]
      return created
    },

    onMutate: async (newTrade) => {
      await queryClient.cancelQueries({ queryKey: tradeKeys.lists() })
      const previousTrades = queryClient.getQueryData<Trade[]>(tradeKeys.lists())

      const optimisticTrade: Trade = {
        id: `optimistic-${Date.now()}`,
        user_id: 'optimistic',
        account_id: newTrade.account_id ?? useFilterStore.getState().accountId ?? undefined,
        pnl: null,
        r_multiple: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...newTrade,
      }

      queryClient.setQueriesData(
        { queryKey: tradeKeys.lists() },
        (old: Trade[] | undefined) => [optimisticTrade, ...(old ?? [])],
      )

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
  const getToken = useTokenGetter()

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: TradeUpdate }) => {
      if (HAS_CLERK && isSupabaseConfigured) {
        try {
          const token = await getToken({ template: 'supabase' })
          if (token) {
            const client = getAuthenticatedClient(token)
            const { data, error } = await client
              .from('trades')
              .update(updates as never)
              .eq('id', id)
              .select()
              .single()

            if (!error && data) return data as Trade
          }
        } catch {
          // Fall through to in-memory store
        }
      }

      inMemoryTrades = inMemoryTrades.map((t) =>
        t.id === id ? { ...t, ...updates, updated_at: new Date().toISOString() } : t,
      )
      return inMemoryTrades.find((t) => t.id === id)!
    },

    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey: tradeKeys.lists() })

      queryClient.setQueriesData(
        { queryKey: tradeKeys.lists() },
        (old: Trade[] | undefined) =>
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
  const getToken = useTokenGetter()

  return useMutation({
    mutationFn: async (id: string) => {
      if (HAS_CLERK && isSupabaseConfigured) {
        try {
          const token = await getToken({ template: 'supabase' })
          if (token) {
            const client = getAuthenticatedClient(token)
            const { error } = await client.from('trades').delete().eq('id', id)
            if (!error) return
          }
        } catch {
          // Fall through
        }
      }

      inMemoryTrades = inMemoryTrades.filter((t) => t.id !== id)
    },

    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: tradeKeys.lists() })

      queryClient.setQueriesData(
        { queryKey: tradeKeys.lists() },
        (old: Trade[] | undefined) => (old ?? []).filter((t) => t.id !== id),
      )
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: tradeKeys.lists() })
    },
  })
}
