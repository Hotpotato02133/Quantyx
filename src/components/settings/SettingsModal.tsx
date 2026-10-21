import { useState, useEffect } from 'react'
import {
  Sliders,
  ShieldAlert,
  Wallet,
  BookOpen,
  Database,
  User,
  X,
  Check,
  RotateCcw,
  Download,
  FileSpreadsheet,
  Lock,
  Sparkles,
  Zap,
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { useSettingsStore, type UserSettings } from '@/store/useSettingsStore'
import { useTrades } from '@/hooks/useTrades'
import { MOCK_ACCOUNTS } from '@/lib/mockData'
import { Switch } from '@/components/ui/switch'
import { useUserRole } from '@/hooks/useUserRole'
import { useUser, useClerk } from '@clerk/clerk-react'
import { cn } from '@/lib/cn'
import Papa from 'papaparse'

type SettingsTab =
  | 'general'
  | 'risk'
  | 'accounts'
  | 'journal'
  | 'data'
  | 'profile'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

export function SettingsModal() {
  const { settingsModalOpen, setSettingsModalOpen, privacyMode, togglePrivacyMode } =
    useUiStore()
  const settings = useSettingsStore()
  const { data: trades = [] } = useTrades()
  const [activeTab, setActiveTab] = useState<SettingsTab>('general')
  const [showSavedFeedback, setShowSavedFeedback] = useState(false)
  const [resetConfirm, setResetConfirm] = useState(false)

  // Listen for Escape key to close
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setSettingsModalOpen(false)
      }
    }
    if (settingsModalOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [settingsModalOpen, setSettingsModalOpen])

  // Trigger brief visual feedback on settings changes
  const triggerSavedToast = () => {
    setShowSavedFeedback(true)
    setTimeout(() => setShowSavedFeedback(false), 2000)
  }

  // Export full journal trades to CSV
  const handleExportCsv = () => {
    if (trades.length === 0) return
    const exportData = trades.map((t) => ({
      Symbol: t.symbol,
      Side: t.direction.toUpperCase(),
      Status: t.status.toUpperCase(),
      EntryPrice: t.entry_price,
      ExitPrice: t.exit_price ?? '',
      StopPrice: t.stop_price ?? '',
      Quantity: t.quantity,
      PnL: t.pnl ?? '',
      RMultiple: t.r_multiple ?? '',
      EntryDate: t.entry_at,
      ExitDate: t.exit_at ?? '',
      Tags: t.tags ? t.tags.join(';') : '',
      Playbook: t.playbook_id ?? '',
      Notes: t.notes ?? '',
    }))

    const csvString = Papa.unparse(exportData)
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `quantyx_trade_journal_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Export database backup as JSON
  const handleExportJson = () => {
    const backup = {
      version: '0.1.0',
      exportedAt: new Date().toISOString(),
      settings: useSettingsStore.getState(),
      trades,
      accounts: MOCK_ACCOUNTS,
    }
    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `quantyx_backup_${new Date().toISOString().split('T')[0]}.json`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Reset Demo Data
  const handleResetData = () => {
    localStorage.removeItem('quantyx_user_settings')
    settings.resetToDefaults()
    setResetConfirm(false)
    triggerSavedToast()
  }

  if (!settingsModalOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={() => setSettingsModalOpen(false)}
        aria-hidden="true"
      />

      {/* Modal Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Quantyx Platform Settings"
        className={cn(
          'relative z-50 flex flex-col md:flex-row w-full max-w-4xl h-[620px] max-h-[92vh]',
          'rounded-2xl border border-border bg-[#141414] shadow-2xl overflow-hidden',
          'animate-slide-up',
        )}
      >
        {/* ─── Left Sidebar / Tab Rail ─── */}
        <aside className="w-full md:w-60 shrink-0 bg-[#101012] border-b md:border-b-0 md:border-r border-border p-4 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Modal Title Header */}
            <div className="flex items-center gap-2.5 px-2 py-1">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-profit/15 border border-profit/30 text-profit">
                <Sliders className="h-4 w-4" strokeWidth={2.25} />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-[#F4F4F5] tracking-tight">Settings</h2>
                <p className="text-[11px] text-[#A1A1AA]">Preferences & Controls</p>
              </div>
            </div>

            {/* Navigation Tabs List */}
            <nav className="space-y-1">
              <button
                onClick={() => setActiveTab('general')}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  activeTab === 'general'
                    ? 'bg-white/[0.08] text-[#F4F4F5] border border-white/[0.08] shadow-sm font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/[0.04]',
                )}
              >
                <Sliders className={cn('h-4 w-4', activeTab === 'general' ? 'text-profit' : 'text-[#71717A]')} />
                <span>General</span>
              </button>

              <button
                onClick={() => setActiveTab('risk')}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  activeTab === 'risk'
                    ? 'bg-white/[0.08] text-[#F4F4F5] border border-white/[0.08] shadow-sm font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/[0.04]',
                )}
              >
                <ShieldAlert className={cn('h-4 w-4', activeTab === 'risk' ? 'text-profit' : 'text-[#71717A]')} />
                <span>Risk & Capital</span>
              </button>

              <button
                onClick={() => setActiveTab('accounts')}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  activeTab === 'accounts'
                    ? 'bg-white/[0.08] text-[#F4F4F5] border border-white/[0.08] shadow-sm font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/[0.04]',
                )}
              >
                <Wallet className={cn('h-4 w-4', activeTab === 'accounts' ? 'text-profit' : 'text-[#71717A]')} />
                <span>Trading Accounts</span>
              </button>

              <button
                onClick={() => setActiveTab('journal')}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  activeTab === 'journal'
                    ? 'bg-white/[0.08] text-[#F4F4F5] border border-white/[0.08] shadow-sm font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/[0.04]',
                )}
              >
                <BookOpen className={cn('h-4 w-4', activeTab === 'journal' ? 'text-profit' : 'text-[#71717A]')} />
                <span>Journal & Rules</span>
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  activeTab === 'data'
                    ? 'bg-white/[0.08] text-[#F4F4F5] border border-white/[0.08] shadow-sm font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/[0.04]',
                )}
              >
                <Database className={cn('h-4 w-4', activeTab === 'data' ? 'text-profit' : 'text-[#71717A]')} />
                <span>Data & Export</span>
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={cn(
                  'flex w-full items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  activeTab === 'profile'
                    ? 'bg-white/[0.08] text-[#F4F4F5] border border-white/[0.08] shadow-sm font-semibold'
                    : 'text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/[0.04]',
                )}
              >
                <User className={cn('h-4 w-4', activeTab === 'profile' ? 'text-profit' : 'text-[#71717A]')} />
                <span>Profile & Auth</span>
              </button>
            </nav>
          </div>

          {/* Left Footer Info */}
          <div className="hidden md:block pt-4 border-t border-border/60 px-2 space-y-1 text-[11px] text-[#71717A]">
            <div className="flex items-center gap-1.5 text-profit">
              <span className="h-1.5 w-1.5 rounded-full bg-profit animate-pulse" />
              <span className="font-mono text-[10px] uppercase font-semibold">Live Mode</span>
            </div>
            <p>Quantyx Enterprise v0.1.0</p>
          </div>
        </aside>

        {/* ─── Right Content Pane ─── */}
        <section className="flex-1 flex flex-col overflow-hidden bg-[#141414]">
          {/* Content Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#161618]">
            <div>
              <h3 className="text-sm font-semibold text-[#F4F4F5]">
                {activeTab === 'general' && 'General & Localization'}
                {activeTab === 'risk' && 'Risk Model & Capital Safeguards'}
                {activeTab === 'accounts' && 'Trading Accounts & Prop Firms'}
                {activeTab === 'journal' && 'Execution Logging & Playbook Rules'}
                {activeTab === 'data' && 'Data Management & Exports'}
                {activeTab === 'profile' && 'User Identity & Security'}
              </h3>
              <p className="text-xs text-[#A1A1AA] mt-0.5">
                {activeTab === 'general' && 'Configure currency formats, market timezones, and display defaults.'}
                {activeTab === 'risk' && 'Calibrate risk parameters, max daily drawdown limits, and commission models.'}
                {activeTab === 'accounts' && 'Manage your active broker connections, balances, and funded firm profiles.'}
                {activeTab === 'journal' && 'Customize trade logging requirements, R-multiple math, and markdown notes.'}
                {activeTab === 'data' && 'Backup your trading history, export to CSV, or clear temporary cache.'}
                {activeTab === 'profile' && 'Review your assigned permissions, role access, and account credentials.'}
              </p>
            </div>

            {/* Close Button */}
            <button
              onClick={() => setSettingsModalOpen(false)}
              className="rounded-lg p-1.5 text-[#A1A1AA] hover:text-[#F4F4F5] hover:bg-white/[0.08] transition-colors"
              aria-label="Close settings"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Content Body */}
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
            {/* ─── TAB 1: GENERAL ─── */}
            {activeTab === 'general' && (
              <div className="space-y-5 animate-fade-in">
                {/* Currency */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <label htmlFor="currency-select" className="text-xs font-semibold text-[#F4F4F5]">Base Currency</label>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Primary monetary symbol applied across metric cards, PnL displays, and charts.
                    </p>
                  </div>
                  <select
                    id="currency-select"
                    value={settings.currency}
                    onChange={(e) => {
                      const cur = e.target.value
                      const symbolMap: Record<string, string> = {
                        USD: '$',
                        EUR: '€',
                        GBP: '£',
                        JPY: '¥',
                        AUD: 'A$',
                        CAD: 'C$',
                      }
                      settings.updateSettings({
                        currency: cur,
                        currencySymbol: symbolMap[cur] || '$',
                      })
                      triggerSavedToast()
                    }}
                    className="h-8 rounded-md border border-border bg-[#1C1C1E] px-3 font-mono text-xs text-[#F4F4F5] outline-none hover:border-white/20 focus:border-profit"
                  >
                    <option value="USD">USD ($) — US Dollar</option>
                    <option value="EUR">EUR (€) — Euro</option>
                    <option value="GBP">GBP (£) — British Pound</option>
                    <option value="JPY">JPY (¥) — Japanese Yen</option>
                    <option value="AUD">AUD (A$) — Australian Dollar</option>
                    <option value="CAD">CAD (C$) — Canadian Dollar</option>
                  </select>
                </div>

                {/* Timezone */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <label htmlFor="timezone-select" className="text-xs font-semibold text-[#F4F4F5]">Trading Session & Timezone</label>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Aligns trade entry timestamps and calendar analytics to your market exchange clock.
                    </p>
                  </div>
                  <select
                    id="timezone-select"
                    value={settings.timezone}
                    onChange={(e) => {
                      settings.updateSettings({ timezone: e.target.value })
                      triggerSavedToast()
                    }}
                    className="h-8 rounded-md border border-border bg-[#1C1C1E] px-3 text-xs text-[#F4F4F5] outline-none hover:border-white/20 focus:border-profit"
                  >
                    <option value="America/New_York">New York (EST/EDT) — NYSE & CME</option>
                    <option value="America/Chicago">Chicago (CST/CDT) — CBOT & Futures</option>
                    <option value="Europe/London">London (GMT/BST) — LSE & European Forex</option>
                    <option value="Asia/Tokyo">Tokyo (JST) — JPX & Asian Sessions</option>
                    <option value="Asia/Singapore">Singapore (SGT) — SGX</option>
                    <option value="UTC">UTC — Universal Coordinated Time</option>
                  </select>
                </div>

                {/* Date Format */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <label htmlFor="dateformat-select" className="text-xs font-semibold text-[#F4F4F5]">Date Format</label>
                    <p className="text-[11px] text-[#A1A1AA]">Standardized date layout across the data table and drawer views.</p>
                  </div>
                  <select
                    id="dateformat-select"
                    value={settings.dateFormat}
                    onChange={(e) => {
                      settings.updateSettings({ dateFormat: e.target.value })
                      triggerSavedToast()
                    }}
                    className="h-8 rounded-md border border-border bg-[#1C1C1E] px-3 font-mono text-xs text-[#F4F4F5] outline-none hover:border-white/20 focus:border-profit"
                  >
                    <option value="YYYY-MM-DD">YYYY-MM-DD (ISO 8601)</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY (US Standard)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (European Standard)</option>
                  </select>
                </div>

                {/* Default Landing Page */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <label htmlFor="landing-select" className="text-xs font-semibold text-[#F4F4F5]">Initial Startup View</label>
                    <p className="text-[11px] text-[#A1A1AA]">
                      The default section rendered when launching Quantyx in your browser.
                    </p>
                  </div>
                  <select
                    id="landing-select"
                    value={settings.defaultLandingPage}
                    onChange={(e) => {
                      settings.updateSettings({
                        defaultLandingPage: e.target.value as UserSettings['defaultLandingPage'],
                      })
                      triggerSavedToast()
                    }}
                    className="h-8 rounded-md border border-border bg-[#1C1C1E] px-3 text-xs text-[#F4F4F5] outline-none hover:border-white/20 focus:border-profit"
                  >
                    <option value="dashboard">Dashboard (Analytics & Performance)</option>
                    <option value="journal">Trade Journal (Execution Log)</option>
                    <option value="analytics">Deep Analytics (Edge Quantification)</option>
                    <option value="playbooks">Playbooks (Strategy Library)</option>
                  </select>
                </div>

                {/* Privacy Mode Toggle */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Privacy Shield (Blur P&L)</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Instantly masks monetary figures and balances on public or shared screens. Toggle anytime with{' '}
                      <kbd className="font-mono text-[10px] px-1 py-0.5 rounded border border-border bg-white/[0.05]">
                        Ctrl+B
                      </kbd>.
                    </p>
                  </div>
                  <Switch
                    checked={privacyMode}
                    onCheckedChange={() => {
                      togglePrivacyMode()
                      triggerSavedToast()
                    }}
                  />
                </div>

                {/* Sound Effects Toggle */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Haptic & Audio Signals</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Audible micro-tones upon trade registration, CSV batch import, or risk boundary warnings.
                    </p>
                  </div>
                  <Switch
                    checked={settings.soundEffects}
                    onCheckedChange={(val) => {
                      settings.updateSettings({ soundEffects: val })
                      triggerSavedToast()
                    }}
                  />
                </div>
              </div>
            )}

            {/* ─── TAB 2: RISK & CAPITAL ─── */}
            {activeTab === 'risk' && (
              <div className="space-y-5 animate-fade-in">
                {/* Max Daily Drawdown */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <label htmlFor="drawdown-input" className="text-xs font-semibold text-[#F4F4F5]">Max Daily Drawdown Threshold</label>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Maximum allowable loss threshold before locking trade entries (standard prop firm rule).
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      id="drawdown-input"
                      type="number"
                      step="0.5"
                      min="1"
                      max="20"
                      value={settings.maxDailyDrawdownPct}
                      onChange={(e) => {
                        settings.updateSettings({ maxDailyDrawdownPct: parseFloat(e.target.value) || 5 })
                        triggerSavedToast()
                      }}
                      className="h-8 w-20 rounded-md border border-border bg-[#1C1C1E] px-2 text-right font-mono text-xs text-[#F4F4F5] outline-none focus:border-profit"
                    />
                    <span className="font-mono text-xs text-[#A1A1AA]">%</span>
                  </div>
                </div>

                {/* Drawdown Alert Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Drawdown Breach Banner</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Displays a high-visibility warning pill on the dashboard when approaching daily loss ceiling.
                    </p>
                  </div>
                  <Switch
                    checked={settings.dailyDrawdownAlert}
                    onCheckedChange={(val) => {
                      settings.updateSettings({ dailyDrawdownAlert: val })
                      triggerSavedToast()
                    }}
                  />
                </div>

                {/* Default Risk Dollars */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <label htmlFor="risk-dollars-input" className="text-xs font-semibold text-[#F4F4F5]">Default 1R Baseline Risk ($)</label>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Fixed dollar amount representing one standard unit of risk (1.00R) for normalized returns.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-[#A1A1AA]">$</span>
                    <input
                      id="risk-dollars-input"
                      type="number"
                      step="25"
                      min="10"
                      value={settings.defaultRiskDollars}
                      onChange={(e) => {
                        settings.updateSettings({ defaultRiskDollars: parseFloat(e.target.value) || 250 })
                        triggerSavedToast()
                      }}
                      className="h-8 w-24 rounded-md border border-border bg-[#1C1C1E] px-2 text-right font-mono text-xs text-[#F4F4F5] outline-none focus:border-profit"
                    />
                  </div>
                </div>

                {/* Default Commission per Contract */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <label htmlFor="commission-input" className="text-xs font-semibold text-[#F4F4F5]">Round-Turn Commission & Exchange Fees</label>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Estimated brokerage cost subtracted per contract/share to calculate true Net P&L.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs text-[#A1A1AA]">$</span>
                    <input
                      id="commission-input"
                      type="number"
                      step="0.25"
                      min="0"
                      value={settings.defaultCommission}
                      onChange={(e) => {
                        settings.updateSettings({ defaultCommission: parseFloat(e.target.value) || 0 })
                        triggerSavedToast()
                      }}
                      className="h-8 w-24 rounded-md border border-border bg-[#1C1C1E] px-2 text-right font-mono text-xs text-[#F4F4F5] outline-none focus:border-profit"
                    />
                  </div>
                </div>

                {/* Default Asset Class */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <label htmlFor="asset-class-select" className="text-xs font-semibold text-[#F4F4F5]">Primary Asset Class</label>
                    <p className="text-[11px] text-[#A1A1AA]">Pre-selected instrument type when opening the Quick Entry Sheet.</p>
                  </div>
                  <select
                    id="asset-class-select"
                    value={settings.defaultAssetClass}
                    onChange={(e) => {
                      settings.updateSettings({
                        defaultAssetClass: e.target.value as UserSettings['defaultAssetClass'],
                      })
                      triggerSavedToast()
                    }}
                    className="h-8 rounded-md border border-border bg-[#1C1C1E] px-3 text-xs text-[#F4F4F5] outline-none hover:border-white/20 focus:border-profit"
                  >
                    <option value="futures">Futures (ES, NQ, YM, CL, GC)</option>
                    <option value="equities">Equities (Stocks & ETFs)</option>
                    <option value="crypto">Cryptocurrency (BTC, ETH, SOL)</option>
                    <option value="forex">Forex (EUR/USD, GBP/USD)</option>
                    <option value="options">Options Contracts</option>
                  </select>
                </div>

                {/* Daily Session Cutoff */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-md">
                    <label htmlFor="cutoff-input" className="text-xs font-semibold text-[#F4F4F5]">Session End Hard Cutoff</label>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Time after which intraday momentum trades should be flat to prevent holding into overnight margins.
                    </p>
                  </div>
                  <input
                    id="cutoff-input"
                    type="time"
                    value={settings.sessionCutoffTime}
                    onChange={(e) => {
                      settings.updateSettings({ sessionCutoffTime: e.target.value })
                      triggerSavedToast()
                    }}
                    className="h-8 rounded-md border border-border bg-[#1C1C1E] px-2.5 font-mono text-xs text-[#F4F4F5] outline-none focus:border-profit"
                  />
                </div>
              </div>
            )}

            {/* ─── TAB 3: ACCOUNTS & BROKER ─── */}
            {activeTab === 'accounts' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between pb-2">
                  <span className="text-xs font-semibold text-[#A1A1AA] uppercase tracking-wider">
                    Connected Portfolios ({MOCK_ACCOUNTS.length})
                  </span>
                  <span className="text-[11px] text-profit font-medium">Auto-synced</span>
                </div>

                <div className="space-y-2.5">
                  {MOCK_ACCOUNTS.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-[#161618] hover:border-white/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/[0.05] border border-border text-[#F4F4F5] font-mono text-xs font-bold">
                          {acc.broker.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#F4F4F5]">{acc.name}</span>
                            <span className="px-1.5 py-0.2 rounded bg-profit/15 text-profit border border-profit/25 text-[10px] font-mono">
                              ACTIVE
                            </span>
                          </div>
                          <span className="text-[11px] text-[#71717A]">
                            Broker: {acc.broker} · Max DD: {acc.max_daily_drawdown_pct}%
                          </span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-xs font-bold text-[#F4F4F5]">
                          ${acc.current_balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-profit">
                          +${(acc.current_balance - acc.initial_balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} Net
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-3.5 rounded-xl border border-dashed border-border bg-white/[0.01] flex items-center justify-between text-xs text-[#A1A1AA]">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-warning" />
                    <span>Want to link automated Rithmic, Tradovate, or NinjaTrader webhooks?</span>
                  </div>
                  <span className="text-profit font-medium cursor-pointer hover:underline">
                    Documentation →
                  </span>
                </div>
              </div>
            )}

            {/* ─── TAB 4: JOURNAL & RULES ─── */}
            {activeTab === 'journal' && (
              <div className="space-y-5 animate-fade-in">
                {/* Auto Calculate R */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Automated R-Multiple Math</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Computes realized Risk:Reward (R) on closed trades utilizing entry, exit, and initial stop loss.
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoCalculateRMultiple}
                    onCheckedChange={(val) => {
                      settings.updateSettings({ autoCalculateRMultiple: val })
                      triggerSavedToast()
                    }}
                  />
                </div>

                {/* Require Screenshot on Close */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Mandatory Chart Evidence</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Enforces attaching a TradingView or broker screenshot before finalizing a trade log.
                    </p>
                  </div>
                  <Switch
                    checked={settings.requireScreenshotOnClose}
                    onCheckedChange={(val) => {
                      settings.updateSettings({ requireScreenshotOnClose: val })
                      triggerSavedToast()
                    }}
                  />
                </div>

                {/* Auto Compress Screenshots */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Client-Side WebP Compression</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Losslessly optimizes chart screenshots below 200KB prior to cloud storage upload.
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoCompressScreenshots}
                    onCheckedChange={(val) => {
                      settings.updateSettings({ autoCompressScreenshots: val })
                      triggerSavedToast()
                    }}
                  />
                </div>

                {/* Default Markdown Preview */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Default Markdown Preview</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Renders structured markdown headings and checklists in note cards rather than raw source code.
                    </p>
                  </div>
                  <Switch
                    checked={settings.defaultMarkdownPreview}
                    onCheckedChange={(val) => {
                      settings.updateSettings({ defaultMarkdownPreview: val })
                      triggerSavedToast()
                    }}
                  />
                </div>

                {/* Show Tags in Grid */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Playbook Badges in Table Grid</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Renders setup tags, strategy categories, and psychological emotion tags on table rows.
                    </p>
                  </div>
                  <Switch
                    checked={settings.showTagsInGrid}
                    onCheckedChange={(val) => {
                      settings.updateSettings({ showTagsInGrid: val })
                      triggerSavedToast()
                    }}
                  />
                </div>
              </div>
            )}

            {/* ─── TAB 5: DATA & EXPORT ─── */}
            {activeTab === 'data' && (
              <div className="space-y-5 animate-fade-in">
                {/* Export CSV */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Export Trade Journal (CSV)</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Generate a clean, broker-standard spreadsheet file containing all {trades.length} recorded trades.
                    </p>
                  </div>
                  <button
                    onClick={handleExportCsv}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-[#F4F4F5] hover:bg-white/[0.05] transition-colors"
                  >
                    <FileSpreadsheet className="h-3.5 w-3.5 text-profit" />
                    <span>Download CSV</span>
                  </button>
                </div>

                {/* Export JSON Backup */}
                <div className="flex items-center justify-between pb-4 border-b border-border/50">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-[#F4F4F5]">Full System Backup (JSON)</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Download complete snapshots including trade notes, custom playbook rules, and preferences.
                    </p>
                  </div>
                  <button
                    onClick={handleExportJson}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-xs font-medium text-[#F4F4F5] hover:bg-white/[0.05] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5 text-profit" />
                    <span>Export JSON</span>
                  </button>
                </div>

                {/* Reset Demo Data */}
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5 max-w-md">
                    <div className="text-xs font-semibold text-loss">Reset Demo Data & Clear Preferences</div>
                    <p className="text-[11px] text-[#A1A1AA]">
                      Clears local storage preferences and resets settings back to default factory configuration.
                    </p>
                  </div>

                  {resetConfirm ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleResetData}
                        className="px-2.5 py-1.5 rounded-md bg-loss text-[#F4F4F5] text-xs font-medium hover:bg-loss/90 transition-colors"
                      >
                        Confirm Reset
                      </button>
                      <button
                        onClick={() => setResetConfirm(false)}
                        className="px-2.5 py-1.5 rounded-md border border-border text-xs text-[#A1A1AA] hover:text-[#F4F4F5]"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResetConfirm(true)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-loss/30 text-loss text-xs font-medium hover:bg-loss/10 transition-colors"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Reset Cache</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* ─── TAB 6: PROFILE & AUTH ─── */}
            {activeTab === 'profile' && <ProfileTabContent />}
          </div>

          {/* Modal Footer / Save Status Bar */}
          <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-[#101012] text-xs">
            <div className="flex items-center gap-2 text-[#A1A1AA]">
              {showSavedFeedback ? (
                <span className="flex items-center gap-1.5 text-profit font-medium animate-fade-in">
                  <Check className="h-3.5 w-3.5" />
                  <span>Preferences saved</span>
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-[11px] text-[#71717A]">
                  <span className="h-1.5 w-1.5 rounded-full bg-profit/80" />
                  <span>Settings persist across browser sessions</span>
                </span>
              )}
            </div>

            <button
              onClick={() => {
                settings.resetToDefaults()
                triggerSavedToast()
              }}
              className="flex items-center gap-1 text-[11px] text-[#71717A] hover:text-[#F4F4F5] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Reset Defaults</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}

function ProfileTabContent() {
  if (HAS_CLERK) {
    return <ClerkProfileContent />
  }
  return <DemoProfileContent />
}

function ClerkProfileContent() {
  const { roleLabel, roleBadgeColor } = useUserRole()
  const clerk = useClerk()
  const { user } = useUser()

  const displayName = user?.fullName ?? user?.firstName ?? 'Trader'
  const displayEmail = user?.primaryEmailAddress?.emailAddress ?? 'trader@quantyx.trade'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile Card */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-[#161618]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-profit/20 border border-profit/30 text-profit font-bold text-base">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[#F4F4F5]">{displayName}</h4>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded border font-mono text-[10px] font-semibold uppercase',
                  roleBadgeColor.bg,
                  roleBadgeColor.text,
                  roleBadgeColor.border,
                )}
              >
                {roleLabel}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-0.5">{displayEmail}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-profit/15 text-profit text-[10px] font-semibold border border-profit/20">
            <Sparkles className="h-3 w-3" />
            <span>Lifetime Pro Tier</span>
          </span>
        </div>
      </div>

      {/* Security & Access */}
      <div className="space-y-3 pt-1">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
          Security & Credentials
        </h5>
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-[#A1A1AA]" />
            <div>
              <div className="text-xs font-medium text-[#F4F4F5]">Clerk Identity Provider</div>
              <p className="text-[11px] text-[#A1A1AA]">
                Multi-factor authentication & encrypted session tokens active.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-profit">AUTHENTICATED</span>
        </div>
      </div>

      {/* Sign Out CTA */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={() => clerk.signOut()}
          className="px-3.5 py-2 rounded-lg border border-loss/30 text-loss text-xs font-semibold hover:bg-loss/10 transition-colors"
        >
          Sign Out of Quantyx
        </button>
      </div>
    </div>
  )
}

function DemoProfileContent() {
  const { roleLabel, roleBadgeColor } = useUserRole()
  const displayName = 'Efraim James (Trader)'
  const displayEmail = 'trader@quantyx.trade'

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Profile Card */}
      <div className="flex items-center justify-between p-4 rounded-xl border border-border bg-[#161618]">
        <div className="flex items-center gap-3.5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-profit/20 border border-profit/30 text-profit font-bold text-base">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-semibold text-[#F4F4F5]">{displayName}</h4>
              <span
                className={cn(
                  'px-1.5 py-0.5 rounded border font-mono text-[10px] font-semibold uppercase',
                  roleBadgeColor.bg,
                  roleBadgeColor.text,
                  roleBadgeColor.border,
                )}
              >
                {roleLabel}
              </span>
            </div>
            <p className="text-xs text-[#A1A1AA] mt-0.5">{displayEmail}</p>
          </div>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-profit/15 text-profit text-[10px] font-semibold border border-profit/20">
            <Sparkles className="h-3 w-3" />
            <span>Lifetime Pro Tier</span>
          </span>
        </div>
      </div>

      {/* Security & Access */}
      <div className="space-y-3 pt-1">
        <h5 className="text-xs font-semibold uppercase tracking-wider text-[#71717A]">
          Security & Credentials
        </h5>
        <div className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-[#161618]">
          <div className="flex items-center gap-2.5">
            <Lock className="h-4 w-4 text-[#A1A1AA]" />
            <div>
              <div className="text-xs font-medium text-[#F4F4F5]">Local Trader Profile</div>
              <p className="text-[11px] text-[#A1A1AA]">
                Local high-performance mode active with demo credentials.
              </p>
            </div>
          </div>
          <span className="text-[11px] font-mono text-profit">ACTIVE</span>
        </div>
      </div>

      {/* Sign Out CTA */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={() => {
            window.location.href = '/sign-in'
          }}
          className="px-3.5 py-2 rounded-lg border border-loss/30 text-loss text-xs font-semibold hover:bg-loss/10 transition-colors"
        >
          Sign Out of Quantyx
        </button>
      </div>
    </div>
  )
}
