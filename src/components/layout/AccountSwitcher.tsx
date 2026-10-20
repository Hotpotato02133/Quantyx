import React, { useState, useRef, useEffect } from 'react'
import {
  Wallet,
  Check,
  Plus,
  ChevronDown,
  ShieldAlert,
  Building2,
} from 'lucide-react'
import { useFilterStore } from '@/store/useFilterStore'
import { useUiStore } from '@/store/useUiStore'
import { MOCK_ACCOUNTS } from '@/lib/mockData'
import type { TradingAccount } from '@/types'
import { cn } from '@/lib/cn'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

const STORAGE_KEY = 'quantyx-trading-accounts'

function getInitialAccounts(): TradingAccount[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
      }
    }
  } catch {
    // Ignore error and fall back
  }
  return MOCK_ACCOUNTS
}

export function AccountSwitcher() {
  const { accountId, setAccountId } = useFilterStore()
  const { setActiveAccountId, privacyMode } = useUiStore()

  const [accounts, setAccounts] = useState<TradingAccount[]>(getInitialAccounts)
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // New account form state
  const [newName, setNewName] = useState('')
  const [newBroker, setNewBroker] = useState('Tradovate')
  const [newCurrency, setNewCurrency] = useState('USD')
  const [newInitialBalance, setNewInitialBalance] = useState('10000')
  const [newMaxDrawdown, setNewMaxDrawdown] = useState('5.0')

  // Set default active account in useFilterStore if none selected
  useEffect(() => {
    if (!accountId && accounts.length > 0) {
      const firstId = accounts[0].id
      setAccountId(firstId)
      setActiveAccountId(firstId)
    }
  }, [accountId, accounts, setAccountId, setActiveAccountId])

  // Sync activeAccountId into useUiStore when accountId changes
  useEffect(() => {
    if (accountId) {
      setActiveAccountId(accountId)
    }
  }, [accountId, setActiveAccountId])

  // Save accounts to localStorage whenever accounts state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts))
    } catch {
      // Ignore storage write errors
    }
  }, [accounts])

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const currentAccount = accounts.find((a) => a.id === accountId) ?? accounts[0]

  const handleSelectAccount = (id: string) => {
    setAccountId(id)
    setActiveAccountId(id)
    setIsOpen(false)
  }

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim()) return

    const initial = parseFloat(newInitialBalance) || 10000
    const newAcc: TradingAccount = {
      id: `acc_${Date.now()}`,
      name: newName.trim(),
      broker: newBroker.trim() || 'Custom Broker',
      currency: newCurrency,
      initial_balance: initial,
      current_balance: initial,
      max_daily_drawdown_pct: parseFloat(newMaxDrawdown) || 5.0,
      is_archived: false,
      created_at: new Date().toISOString(),
    }

    setAccounts((prev) => [...prev, newAcc])
    setAccountId(newAcc.id)
    setActiveAccountId(newAcc.id)
    setIsModalOpen(false)
    setNewName('')
    setNewInitialBalance('10000')
    setNewBroker('Tradovate')
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          id="account-switcher-trigger"
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-border text-sm hover:bg-white/[0.08] transition-colors duration-150"
          aria-haspopup="true"
          aria-expanded={isOpen}
          aria-label="Select trading account"
        >
          <div className="flex h-5 w-5 items-center justify-center rounded bg-profit/15 text-profit">
            <Wallet className="h-3 w-3" strokeWidth={2} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-xs font-medium text-[#F4F4F5] max-w-[130px] truncate leading-tight">
              {currentAccount?.name ?? 'Select Account'}
            </span>
            <span
              className={cn(
                'font-mono text-[10px] text-[#A1A1AA] leading-tight tabular-nums',
                privacyMode && 'blur-sm select-none',
              )}
            >
              ${currentAccount?.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <ChevronDown className="h-3 w-3 text-[#A1A1AA] ml-1 shrink-0" strokeWidth={2} />
        </button>

        {isOpen && (
          <div className="absolute left-0 mt-1.5 w-72 rounded-lg border border-border bg-[#141414] shadow-2xl z-50 py-1.5 backdrop-blur-md animate-in fade-in-0 zoom-in-95">
            <div className="px-3 py-1.5 border-b border-border/50 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider">
                Trading Accounts
              </span>
              <span className="text-[10px] text-[#71717A]">{accounts.length} Total</span>
            </div>

            <div className="max-h-60 overflow-y-auto py-1">
              {accounts.map((acc) => {
                const isSelected = acc.id === currentAccount?.id
                return (
                  <button
                    key={acc.id}
                    type="button"
                    onClick={() => handleSelectAccount(acc.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/[0.05] transition-colors',
                      isSelected && 'bg-white/[0.06]',
                    )}
                  >
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-[#F4F4F5] truncate">
                          {acc.name}
                        </span>
                        {isSelected && <Check className="h-3 w-3 text-profit shrink-0" strokeWidth={2.5} />}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#A1A1AA]">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-2.5 w-2.5" />
                          {acc.broker}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-0.5 text-warning">
                          <ShieldAlert className="h-2.5 w-2.5" />
                          {acc.max_daily_drawdown_pct}% Max DD
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span
                        className={cn(
                          'font-mono text-xs font-medium text-[#F4F4F5] tabular-nums',
                          privacyMode && 'blur-sm select-none',
                        )}
                      >
                        ${acc.current_balance.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="pt-1.5 border-t border-border/50 px-2">
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false)
                  setNewName('Main Futures Account - $10,000')
                  setNewInitialBalance('10000')
                  setIsModalOpen(true)
                }}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] text-xs font-medium text-[#F4F4F5] transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Create New Account</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Create New Account using Dialog component */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-2 mb-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-profit/15 text-profit">
                <Wallet className="h-4 w-4" />
              </div>
              <div>
                <DialogTitle>Add Trading Account</DialogTitle>
                <DialogDescription>
                  Track independent equity, balances, and risk parameters per broker
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleCreateAccount} className="space-y-4 pt-1">
            <div>
              <label htmlFor="account-name-input" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                Account Name
              </label>
              <input
                id="account-name-input"
                type="text"
                required
                placeholder="e.g. Main Futures Account - $10,000"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[#525252] focus:border-profit focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="broker-input" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Broker / Platform
                </label>
                <input
                  id="broker-input"
                  type="text"
                  value={newBroker}
                  onChange={(e) => setNewBroker(e.target.value)}
                  placeholder="Tradovate, IBKR..."
                  className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[#525252] focus:border-profit focus:outline-none"
                />
              </div>
              <div>
                <label htmlFor="currency-select" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Currency
                </label>
                <select
                  id="currency-select"
                  value={newCurrency}
                  onChange={(e) => setNewCurrency(e.target.value)}
                  className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-[#F4F4F5] focus:border-profit focus:outline-none"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="USDT">USDT</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="balance-input" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Starting Balance ($)
                </label>
                <input
                  id="balance-input"
                  type="number"
                  step="any"
                  required
                  value={newInitialBalance}
                  onChange={(e) => setNewInitialBalance(e.target.value)}
                  className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm font-mono text-[#F4F4F5] focus:border-profit focus:outline-none tabular-nums"
                />
              </div>
              <div>
                <label htmlFor="drawdown-input" className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Max Daily Drawdown (%)
                </label>
                <input
                  id="drawdown-input"
                  type="number"
                  step="0.1"
                  value={newMaxDrawdown}
                  onChange={(e) => setNewMaxDrawdown(e.target.value)}
                  className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm font-mono text-[#F4F4F5] focus:border-profit focus:outline-none tabular-nums"
                />
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="default"
                size="sm"
              >
                Save Account
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
