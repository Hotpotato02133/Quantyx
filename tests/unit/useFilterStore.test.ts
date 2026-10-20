import { describe, it, expect, beforeEach } from 'vitest'
import { useFilterStore } from '@/store/useFilterStore'

describe('useFilterStore', () => {
  beforeEach(() => {
    useFilterStore.setState({
      accountId: null,
      direction: 'all',
      outcome: 'all',
      symbol: '',
      dateRange: { from: null, to: null },
      tags: [],
    })
  })

  it('initializes with null accountId and default filters', () => {
    const state = useFilterStore.getState()
    expect(state.accountId).toBeNull()
    expect(state.direction).toBe('all')
    expect(state.outcome).toBe('all')
    expect(state.symbol).toBe('')
    expect(state.tags).toEqual([])
  })

  it('updates active accountId via setAccountId (Step 1.4 requirement)', () => {
    useFilterStore.getState().setAccountId('acc_apex_50k')
    expect(useFilterStore.getState().accountId).toBe('acc_apex_50k')

    useFilterStore.getState().setAccountId('acc_personal_futures')
    expect(useFilterStore.getState().accountId).toBe('acc_personal_futures')
  })

  it('updates direction, outcome, symbol, date range, and tags', () => {
    useFilterStore.getState().setDirection('long')
    expect(useFilterStore.getState().direction).toBe('long')

    useFilterStore.getState().setOutcome('win')
    expect(useFilterStore.getState().outcome).toBe('win')

    useFilterStore.getState().setSymbol('NQ1!')
    expect(useFilterStore.getState().symbol).toBe('NQ1!')

    useFilterStore.getState().setDateRange({ from: '2026-10-01', to: '2026-10-20' })
    expect(useFilterStore.getState().dateRange).toEqual({ from: '2026-10-01', to: '2026-10-20' })

    useFilterStore.getState().setTags(['Breakout', 'ICT'])
    expect(useFilterStore.getState().tags).toEqual(['Breakout', 'ICT'])
  })

  it('resetFilters resets criteria while preserving active accountId', () => {
    useFilterStore.getState().setAccountId('acc_apex_50k')
    useFilterStore.getState().setDirection('short')
    useFilterStore.getState().setSymbol('ES1!')
    useFilterStore.getState().setTags(['FOMO'])

    useFilterStore.getState().resetFilters()

    const state = useFilterStore.getState()
    expect(state.accountId).toBe('acc_apex_50k') // Preserved
    expect(state.direction).toBe('all')          // Reset
    expect(state.symbol).toBe('')                // Reset
    expect(state.tags).toEqual([])               // Reset
  })
})
