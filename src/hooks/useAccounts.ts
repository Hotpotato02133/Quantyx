import { useState, useEffect, useMemo, useCallback } from 'react'
import { useFilterStore } from '@/store/useFilterStore'
import { useUiStore } from '@/store/useUiStore'
import { MOCK_ACCOUNTS } from '@/lib/mockData'
import type { TradingAccount } from '@/types'

export const ACCOUNTS_STORAGE_KEY = 'quantyx-trading-accounts'

export function getStoredAccounts(): TradingAccount[] {
  try {
    const saved = localStorage.getItem(ACCOUNTS_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // Ignore error and fall back to mock accounts
  }
  return MOCK_ACCOUNTS
}

export function useAccounts() {
  const { accountId, setAccountId } = useFilterStore()
  const { activeAccountId, setActiveAccountId } = useUiStore()

  const [accounts, setAccounts] = useState<TradingAccount[]>(getStoredAccounts)

  // Listen to cross-tab / local storage updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === ACCOUNTS_STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue)
          if (Array.isArray(parsed)) setAccounts(parsed)
        } catch {
          // ignore
        }
      }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Ensure an account is active
  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      const firstId = accounts[0].id
      setAccountId(firstId)
      setActiveAccountId(firstId)
    }
  }, [accountId, accounts, setAccountId, setActiveAccountId])

  // Resolve active account
  const currentAccount = useMemo<TradingAccount>(() => {
    const activeId = accountId ?? activeAccountId
    const matched = accounts.find((a) => a.id === activeId)
    return matched ?? accounts[0] ?? MOCK_ACCOUNTS[0]
  }, [accounts, accountId, activeAccountId])

  // Save changes
  const saveAccounts = useCallback((updated: TradingAccount[]) => {
    setAccounts(updated)
    try {
      localStorage.setItem(ACCOUNTS_STORAGE_KEY, JSON.stringify(updated))
    } catch {
      // ignore
    }
  }, [])

  // Create new account
  const createAccount = useCallback(
    (newAcc: {
      name: string
      broker: string
      currency: string
      initial_balance: number
      max_daily_drawdown_pct: number
    }) => {
      const created: TradingAccount = {
        id: `acc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: newAcc.name,
        broker: newAcc.broker,
        currency: newAcc.currency,
        initial_balance: newAcc.initial_balance,
        current_balance: newAcc.initial_balance,
        max_daily_drawdown_pct: newAcc.max_daily_drawdown_pct,
        is_archived: false,
        created_at: new Date().toISOString(),
      }
      const updated = [...accounts, created]
      saveAccounts(updated)
      setAccountId(created.id)
      setActiveAccountId(created.id)
      return created
    },
    [accounts, saveAccounts, setAccountId, setActiveAccountId],
  )

  const selectAccount = useCallback(
    (id: string) => {
      setAccountId(id)
      setActiveAccountId(id)
    },
    [setAccountId, setActiveAccountId],
  )

  return {
    accounts,
    currentAccount,
    selectAccount,
    createAccount,
    saveAccounts,
  }
}
