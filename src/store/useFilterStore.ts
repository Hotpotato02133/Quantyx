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
  // Active filter values
  direction: TradeDirection
  outcome: TradeOutcome
  symbol: string
  dateRange: DateRange
  tags: string[]

  // Actions
  setDirection: (direction: TradeDirection) => void
  setOutcome: (outcome: TradeOutcome) => void
  setSymbol: (symbol: string) => void
  setDateRange: (range: DateRange) => void
  setTags: (tags: string[]) => void
  resetFilters: () => void
}

// ─── Default State ────────────────────────────────────────────────────────────

const defaultFilters = {
  direction: 'all' as TradeDirection,
  outcome: 'all' as TradeOutcome,
  symbol: '',
  dateRange: { from: null, to: null },
  tags: [] as string[],
}

// ─── Store ────────────────────────────────────────────────────────────────────

/**
 * Client-side filter state for the Journal view.
 * Persisted to sessionStorage so filters survive page refreshes within a session.
 * URL sync is handled in JournalPage via useEffect + URLSearchParams.
 */
export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      ...defaultFilters,

      setDirection: (direction) => set({ direction }),
      setOutcome: (outcome) => set({ outcome }),
      setSymbol: (symbol) => set({ symbol }),
      setDateRange: (dateRange) => set({ dateRange }),
      setTags: (tags) => set({ tags }),

      resetFilters: () => set({ ...defaultFilters }),
    }),
    {
      name: 'quantyx-filter-state',
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
)
