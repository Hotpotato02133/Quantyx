import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAccounts, ACCOUNTS_STORAGE_KEY } from '@/hooks/useAccounts'
import { useFilterStore } from '@/store/useFilterStore'
import { useUiStore } from '@/store/useUiStore'

describe('useAccounts Hook', () => {
  beforeEach(() => {
    localStorage.clear()
    act(() => {
      useFilterStore.setState({ accountId: null })
      useUiStore.setState({ activeAccountId: null })
    })
  })

  it('initializes with default mock accounts and sets first account active', () => {
    const { result } = renderHook(() => useAccounts())

    expect(result.current.accounts.length).toBeGreaterThan(0)
    expect(result.current.currentAccount).toBeDefined()
    expect(result.current.currentAccount.id).toBe('acc_apex_50k')
    expect(result.current.currentAccount.initial_balance).toBe(50000)
    expect(result.current.currentAccount.max_daily_drawdown_pct).toBe(5.0)
  })

  it('switches current account when selectAccount is called', () => {
    const { result } = renderHook(() => useAccounts())

    act(() => {
      result.current.selectAccount('acc_personal_futures')
    })

    expect(result.current.currentAccount.id).toBe('acc_personal_futures')
    expect(result.current.currentAccount.initial_balance).toBe(25000)
    expect(result.current.currentAccount.max_daily_drawdown_pct).toBe(4.0)
  })

  it('creates a new account and sets it active', () => {
    const { result } = renderHook(() => useAccounts())

    act(() => {
      result.current.createAccount({
        name: 'Topstep 150k Combine',
        broker: 'NinjaTrader',
        currency: 'USD',
        initial_balance: 150000,
        max_daily_drawdown_pct: 3.5,
      })
    })

    expect(result.current.currentAccount.name).toBe('Topstep 150k Combine')
    expect(result.current.currentAccount.initial_balance).toBe(150000)
    expect(result.current.currentAccount.max_daily_drawdown_pct).toBe(3.5)

    // Verify localStorage was updated
    const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    expect(saved).toContain('Topstep 150k Combine')
  })
})
