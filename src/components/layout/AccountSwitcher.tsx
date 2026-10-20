import { useState, useRef, useEffect } from 'react'
import {
  Wallet,
  Check,
  Plus,
  ChevronDown,
  ShieldAlert,
  Building2,
  X,
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { MOCK_ACCOUNTS, type TradingAccount } from '@/lib/mockData'
import { cn } from '@/lib/cn'

export function AccountSwitcher() {
  const { activeAccountId, setActiveAccountId, privacyMode } = useUiStore()
  const [accounts, setAccounts] = useState<TradingAccount[]>(MOCK_ACCOUNTS)
  const [isOpen, setIsOpen] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // New account form state
  const [newName, setNewName] = useState('')
  const [newBroker, setNewBroker] = useState('Tradovate')
  const [newCurrency, setNewCurrency] = useState('USD')
  const [newInitialBalance, setNewInitialBalance] = useState('50000')
  const [newMaxDrawdown, setNewMaxDrawdown] = useState('5.0')

  // Set default active account if none selected
  useEffect(() => {
    if (!activeAccountId && accounts.length > 0) {
      setActiveAccountId(accounts[0].id)
    }
  }, [activeAccountId, accounts, setActiveAccountId])

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

  const currentAccount = accounts.find((a) => a.id === activeAccountId) ?? accounts[0]

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
    setActiveAccountId(newAcc.id)
    setIsModalOpen(false)
    setNewName('')
    setNewInitialBalance('50000')
  }

  return (
    <>
      <div className="relative" ref={dropdownRef}>
        <button
          id="account-switcher-trigger"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-white/[0.04] border border-border text-sm hover:bg-white/[0.08] transition-colors duration-150"
          aria-haspopup="true"
          aria-expanded={isOpen}
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
          <div className="absolute left-0 mt-1.5 w-72 rounded-lg border border-border bg-[#141414] shadow-2xl z-50 py-1.5 backdrop-blur-md">
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
                    onClick={() => {
                      setActiveAccountId(acc.id)
                      setIsOpen(false)
                    }}
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
                onClick={() => {
                  setIsOpen(false)
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

      {/* Modal: Create New Account */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-xl border border-border bg-[#141414] shadow-2xl p-6 relative animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-profit/15 text-profit">
                  <Wallet className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[#F4F4F5]">Add Trading Account</h3>
                  <p className="text-xs text-[#A1A1AA]">Track equity and metrics per broker</p>
                </div>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-md p-1 text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#F4F4F5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                  Account Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apex 50k #2 or Personal NQ"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[#525252] focus:border-profit focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    Broker / Platform
                  </label>
                  <input
                    type="text"
                    value={newBroker}
                    onChange={(e) => setNewBroker(e.target.value)}
                    placeholder="Tradovate, IBKR..."
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-[#F4F4F5] placeholder:text-[#525252] focus:border-profit focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    Currency
                  </label>
                  <select
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
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    Starting Balance ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={newInitialBalance}
                    onChange={(e) => setNewInitialBalance(e.target.value)}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm font-mono text-[#F4F4F5] focus:border-profit focus:outline-none tabular-nums"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#A1A1AA] mb-1.5">
                    Max Daily Drawdown (%)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={newMaxDrawdown}
                    onChange={(e) => setNewMaxDrawdown(e.target.value)}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm font-mono text-[#F4F4F5] focus:border-profit focus:outline-none tabular-nums"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-[#A1A1AA] hover:text-[#F4F4F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-profit text-[#0A0A0A] text-xs font-semibold hover:bg-profit/90 active:scale-95 transition-all"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
