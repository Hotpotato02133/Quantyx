import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ─── Filter Types ────────────────────────────────────────────────────────────

export type TradeDirection = 'long' | 'short' | 'all'
export type TradeOutcome = 'win' | 'loss' | 'breakeven' | 'all'

export interface DateRange {
  from: string | null  // ISO 8601 date string
  to: string | null    // ISO 8601 date string
}

export interface FilterState {
  // Active trading account filter — Step 1.4 requirement
  accountId: string | null

  // Active filter values
  direction: TradeDirection
  outcome: TradeOutcome
  symbol: string
  dateRange: DateRange
  tags: string[]

  // Actions
  setAccountId: (id: string | null) => void
  setDirection: (direction: TradeDirection) => void
  setOutcome: (outcome: TradeOutcome) => void
  setSymbol: (symbol: string) => void
  setDateRange: (range: DateRange) => void
  setTags: (tags: string[]) => void
  resetFilters: () => void
}

// ─── Default State ────────────────────────────────────────────────────────────

const defaultFilters = {
  accountId: null as string | null,
  direction: 'all' as TradeDirection,
  outcome: 'all' as TradeOutcome,
  symbol: '',
  dateRange: { from: null, to: null },
  tags: [] as string[],
}

// ─── Store ────────────────────────────────────────────────────────────────────

/**
 * Client-side filter state for the Journal & Dashboard views.
 * Persisted to sessionStorage so filters and active account survive page refreshes.
 */
export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...defaultFilters,

      setAccountId: (accountId) => set({ accountId }),
      setDirection: (direction) => set({ direction }),
      setOutcome: (outcome) => set({ outcome }),
      setSymbol: (symbol) => set({ symbol }),
      setDateRange: (dateRange) => set({ dateRange }),
      setTags: (tags) => set({ tags }),

      // Resets search and category filters while preserving selected accountId
      resetFilters: () =>
        set((state) => ({
          ...defaultFilters,
          accountId: state.accountId,
        })),
    }),
    {
      name: 'quantyx-filter-state',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
