import { useEffect, useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { Command } from 'cmdk'
import {
  LayoutDashboard,
  BookOpen,
  Calendar,
  BarChart3,
  BookMarked,
  Plus,
  Eye,
  EyeOff,
  Settings,
  Upload,
  X,
  Search,
  Tag,
  TrendingUp,
  Wallet,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { useFilterStore, type TradeDirection } from '@/store/useFilterStore'
import { MOCK_ACCOUNTS } from '@/lib/mockData'
import type { TradingAccount } from '@/types'
import { cn } from '@/lib/cn'

const STORAGE_KEY = 'quantyx-trading-accounts'

function getSavedAccounts(): TradingAccount[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      if (Array.isArray(parsed) && parsed.length > 0) return parsed
    }
  } catch {
    // Fall back to mock accounts
  }
  return MOCK_ACCOUNTS
}

const COMMON_SYMBOLS = ['NQ1!', 'ES1!', 'BTCUSDT', 'ETHUSDT', 'AAPL', 'NVDA', 'TSLA', 'EURUSD', 'GC1!']
const COMMON_TAGS = ['ICT Silver Bullet', 'BreakAndRetest', 'VWAPReversal', 'LiquiditySweep', 'NYOpen', 'FOMO', 'Disciplined', 'Revenge']

export function CommandPalette() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [accounts, setAccounts] = useState<TradingAccount[]>(getSavedAccounts)

  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setTradeSheetOpen,
    setSettingsModalOpen,
    setCsvModalOpen,
    privacyMode,
    togglePrivacyMode,
    activeAccountId,
    setActiveAccountId,
  } = useUiStore()

  const {
    accountId,
    setAccountId,
    setSymbol,
    setTags,
    setDirection,
    resetFilters,
    symbol: activeSymbol,
    tags: activeTags,
    direction: activeDirection,
  } = useFilterStore()

  // Keep accounts up to date when opened
  useEffect(() => {
    if (commandPaletteOpen) {
      setAccounts(getSavedAccounts())
      setSearch('')
    }
  }, [commandPaletteOpen])

  // Global hotkeys listener (Cmd+K, Cmd+N, Cmd+B, Cmd+,, Cmd+I, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle palette: Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
        return
      }

      // Quick Trade: Cmd+N or Ctrl+N
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault()
        setTradeSheetOpen(true)
        return
      }

      // Privacy Mode: Cmd+B or Ctrl+B
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        togglePrivacyMode()
        return
      }

      // Settings: Cmd+, or Ctrl+,
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault()
        setSettingsModalOpen(true)
        return
      }

      // CSV Import: Cmd+I or Ctrl+I
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'i') {
        e.preventDefault()
        setCsvModalOpen(true)
        return
      }

      // Close on Escape
      if (e.key === 'Escape' && commandPaletteOpen) {
        setCommandPaletteOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [
    commandPaletteOpen,
    setCommandPaletteOpen,
    setTradeSheetOpen,
    togglePrivacyMode,
    setSettingsModalOpen,
    setCsvModalOpen,
  ])

  // Smart Query Detection: tag:xyz or symbol:xyz or side:long/short
  const parsedPrefix = useMemo(() => {
    const trimmed = search.trim()
    const lower = trimmed.toLowerCase()

    if (lower.startsWith('tag:')) {
      const val = trimmed.slice(4).trim()
      return { type: 'tag' as const, value: val }
    }
    if (lower.startsWith('symbol:') || lower.startsWith('ticker:')) {
      const idx = trimmed.indexOf(':')
      const val = trimmed.slice(idx + 1).trim()
      return { type: 'symbol' as const, value: val }
    }
    if (lower.startsWith('side:') || lower.startsWith('dir:')) {
      const idx = trimmed.indexOf(':')
      const val = trimmed.slice(idx + 1).trim().toLowerCase()
      return { type: 'side' as const, value: val }
    }

    return null
  }, [search])

  const handleAccountSwitch = useCallback(
    (accId: string) => {
      setAccountId(accId)
      setActiveAccountId(accId)
      setCommandPaletteOpen(false)
    },
    [setAccountId, setActiveAccountId, setCommandPaletteOpen],
  )

  const handleFilterByTag = useCallback(
    (tag: string) => {
      setTags([tag])
      setCommandPaletteOpen(false)
      navigate('/journal')
    },
    [setTags, setCommandPaletteOpen, navigate],
  )

  const handleFilterBySymbol = useCallback(
    (sym: string) => {
      setSymbol(sym)
      setCommandPaletteOpen(false)
      navigate('/journal')
    },
    [setSymbol, setCommandPaletteOpen, navigate],
  )

  const handleFilterByDirection = useCallback(
    (dir: string) => {
      if (dir === 'long' || dir === 'short' || dir === 'all') {
        setDirection(dir as TradeDirection)
      }
      setCommandPaletteOpen(false)
      navigate('/journal')
    },
    [setDirection, setCommandPaletteOpen, navigate],
  )

  const handleResetFilters = useCallback(() => {
    resetFilters()
    setCommandPaletteOpen(false)
    navigate('/journal')
  }, [resetFilters, setCommandPaletteOpen, navigate])

  const hasActiveFilters = Boolean(
    activeSymbol || activeTags.length > 0 || (activeDirection && activeDirection !== 'all'),
  )

  if (!commandPaletteOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4">
      {/* Dimmed backdrop with blur */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-md transition-opacity animate-in fade-in duration-150"
        onClick={() => setCommandPaletteOpen(false)}
        aria-hidden="true"
      />

      {/* Raycast / Linear Style cmdk container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Global Command Palette"
        className={cn(
          'relative z-10 w-full max-w-xl overflow-hidden rounded-2xl',
          'border border-white/10 bg-[#161618]/95 backdrop-blur-2xl shadow-2xl',
          'animate-in zoom-in-95 fade-in duration-150 flex flex-col',
        )}
      >
        <Command
          label="Global Commands"
          className="flex flex-col w-full focus:outline-none"
          shouldFilter={parsedPrefix === null}
        >
          {/* Top Search Input with Live Prefix Badge */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.08] bg-[#121214]">
            <Search className="h-4 w-4 shrink-0 text-[#71717A]" />
            <Command.Input
              value={search}
              onValueChange={setSearch}
              placeholder="Type a command, 'tag:FOMO', or 'symbol:NQ'…"
              autoFocus
              className="flex-1 bg-transparent text-sm text-[#F4F4F5] placeholder-[#525252] outline-none font-sans"
              aria-label="Search command palette"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="text-[#71717A] hover:text-[#A1A1AA] transition-colors p-0.5"
                title="Clear input"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
            <kbd className="hidden sm:inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-[10px] font-mono text-[#71717A] bg-white/[0.05] border border-white/[0.08]">
              ESC
            </kbd>
          </div>

          {/* Command List View */}
          <Command.List className="max-h-[360px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
            <Command.Empty className="py-8 text-center text-xs text-[#71717A]">
              No matching commands, tags, or symbols found.
            </Command.Empty>

            {/* Dynamic Prefix Filter Suggestion */}
            {parsedPrefix && (
              <Command.Group heading="Dynamic Filter Query" className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] px-2 py-1">
                {parsedPrefix.type === 'tag' && (
                  <Command.Item
                    value={`filter-tag-${parsedPrefix.value}`}
                    onSelect={() => handleFilterByTag(parsedPrefix.value)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#F4F4F5] cursor-pointer hover:bg-profit/15 hover:text-profit data-[selected=true]:bg-profit/15 data-[selected=true]:text-profit transition-colors"
                  >
                    <Tag className="h-4 w-4 text-profit shrink-0" />
                    <span className="flex-1">
                      Filter Journal by tag <strong className="text-profit">"{parsedPrefix.value}"</strong>
                    </span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#A1A1AA]">
                      ↵ Apply
                    </kbd>
                  </Command.Item>
                )}

                {parsedPrefix.type === 'symbol' && (
                  <Command.Item
                    value={`filter-symbol-${parsedPrefix.value}`}
                    onSelect={() => handleFilterBySymbol(parsedPrefix.value)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#F4F4F5] cursor-pointer hover:bg-profit/15 hover:text-profit data-[selected=true]:bg-profit/15 data-[selected=true]:text-profit transition-colors"
                  >
                    <TrendingUp className="h-4 w-4 text-profit shrink-0" />
                    <span className="flex-1">
                      Filter Journal by symbol <strong className="text-profit">"{parsedPrefix.value.toUpperCase()}"</strong>
                    </span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#A1A1AA]">
                      ↵ Apply
                    </kbd>
                  </Command.Item>
                )}

                {parsedPrefix.type === 'side' && (
                  <Command.Item
                    value={`filter-side-${parsedPrefix.value}`}
                    onSelect={() => handleFilterByDirection(parsedPrefix.value)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#F4F4F5] cursor-pointer hover:bg-profit/15 hover:text-profit data-[selected=true]:bg-profit/15 data-[selected=true]:text-profit transition-colors"
                  >
                    <Sparkles className="h-4 w-4 text-profit shrink-0" />
                    <span className="flex-1">
                      Filter Journal by direction <strong className="text-profit">"{parsedPrefix.value.toUpperCase()}"</strong>
                    </span>
                    <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#A1A1AA]">
                      ↵ Apply
                    </kbd>
                  </Command.Item>
                )}
              </Command.Group>
            )}

            {/* Quick Actions Group */}
            <Command.Group heading="Quick Actions" className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] px-2 py-1">
              <Command.Item
                value="action-new-trade log new trade order entry cmd+n"
                onSelect={() => {
                  setCommandPaletteOpen(false)
                  setTradeSheetOpen(true)
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
              >
                <Plus className="h-4 w-4 text-profit shrink-0" />
                <span className="flex-1 font-medium">Log New Trade</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#71717A]">
                  ⌘N
                </kbd>
              </Command.Item>

              <Command.Item
                value="action-privacy-mode toggle privacy blur numbers cmd+b"
                onSelect={() => {
                  togglePrivacyMode()
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
              >
                {privacyMode ? (
                  <EyeOff className="h-4 w-4 text-warning shrink-0" />
                ) : (
                  <Eye className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                )}
                <span className="flex-1 font-medium">
                  {privacyMode ? 'Disable Privacy Mode (Show $)' : 'Enable Privacy Mode (Blur $)'}
                </span>
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold',
                    privacyMode ? 'bg-warning/15 text-warning' : 'bg-white/[0.05] text-[#71717A]',
                  )}
                >
                  {privacyMode ? 'Active' : 'Off'}
                </span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#71717A]">
                  ⌘B
                </kbd>
              </Command.Item>

              <Command.Item
                value="action-csv-import import trades bulk csv papaparse"
                onSelect={() => {
                  setCommandPaletteOpen(false)
                  setCsvModalOpen(true)
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
              >
                <Upload className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                <span className="flex-1 font-medium">Import Trades from CSV</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#71717A]">
                  ⌘I
                </kbd>
              </Command.Item>

              <Command.Item
                value="action-settings open settings preferences cmd+,"
                onSelect={() => {
                  setCommandPaletteOpen(false)
                  setSettingsModalOpen(true)
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
              >
                <Settings className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                <span className="flex-1 font-medium">Open Settings & Preferences</span>
                <kbd className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/[0.08] text-[#71717A]">
                  ⌘,
                </kbd>
              </Command.Item>

              {hasActiveFilters && (
                <Command.Item
                  value="action-reset-filters clear all filters reset journal"
                  onSelect={handleResetFilters}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-warning hover:bg-warning/10 data-[selected=true]:bg-warning/10 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-4 w-4 text-warning shrink-0" />
                  <span className="flex-1 font-medium">Clear All Active Journal Filters</span>
                  <span className="text-[10px] font-mono text-warning/70">Reset</span>
                </Command.Item>
              )}
            </Command.Group>

            <Command.Separator className="h-px bg-white/[0.06] my-1" />

            {/* Navigation Group */}
            <Command.Group heading="Navigation" className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] px-2 py-1">
              <Command.Item
                value="nav-dashboard go to dashboard metrics analytics"
                onSelect={() => {
                  setCommandPaletteOpen(false)
                  navigate('/dashboard')
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
              >
                <LayoutDashboard className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                <span className="flex-1 font-medium">Dashboard Overview</span>
                <span className="text-[10px] font-mono text-[#525252]">/dashboard</span>
              </Command.Item>

              <Command.Item
                value="nav-journal go to journal trade data grid executions"
                onSelect={() => {
                  setCommandPaletteOpen(false)
                  navigate('/journal')
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
              >
                <BookOpen className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                <span className="flex-1 font-medium">Trade Journal & Grid</span>
                <span className="text-[10px] font-mono text-[#525252]">/journal</span>
              </Command.Item>

              <Command.Item
                value="nav-calendar go to calendar trading heatmap executions"
                onSelect={() => {
                  setCommandPaletteOpen(false)
                  navigate('/calendar')
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
              >
                <Calendar className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                <span className="flex-1 font-medium">Trading Calendar</span>
                <span className="text-[10px] font-mono text-[#525252]">/calendar</span>
              </Command.Item>

              <Command.Item
                value="nav-analytics go to analytics performance edge"
                onSelect={() => {
                  setCommandPaletteOpen(false)
                  navigate('/app/analytics')
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
              >
                <BarChart3 className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                <span className="flex-1 font-medium">Performance Analytics</span>
                <span className="text-[10px] font-mono text-[#525252]">/app/analytics</span>
              </Command.Item>

              <Command.Item
                value="nav-playbooks go to playbooks strategies setups"
                onSelect={() => {
                  setCommandPaletteOpen(false)
                  navigate('/app/playbooks')
                }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
              >
                <BookMarked className="h-4 w-4 text-[#A1A1AA] shrink-0" />
                <span className="flex-1 font-medium">Playbooks & Strategies</span>
                <span className="text-[10px] font-mono text-[#525252]">/app/playbooks</span>
              </Command.Item>
            </Command.Group>

            <Command.Separator className="h-px bg-white/[0.06] my-1" />

            {/* Trading Accounts Switcher Group */}
            <Command.Group heading="Switch Trading Account" className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] px-2 py-1">
              {accounts.map((acc) => {
                const isSelected = (accountId ?? activeAccountId) === acc.id
                return (
                  <Command.Item
                    key={acc.id}
                    value={`account-${acc.id} switch account ${acc.name} ${acc.broker}`}
                    onSelect={() => handleAccountSwitch(acc.id)}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-[#A1A1AA] hover:bg-white/[0.07] hover:text-[#F4F4F5] data-[selected=true]:bg-white/[0.07] data-[selected=true]:text-[#F4F4F5] transition-colors cursor-pointer"
                  >
                    <Wallet className={cn('h-4 w-4 shrink-0', isSelected ? 'text-profit' : 'text-[#71717A]')} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={cn('font-medium truncate', isSelected && 'text-[#F4F4F5] font-semibold')}>
                          {acc.name}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded bg-profit/15 text-profit text-[9px] font-mono font-semibold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-[#71717A] font-mono">
                        {acc.broker} • ${acc.current_balance?.toLocaleString('en-US') ?? acc.initial_balance.toLocaleString('en-US')}
                      </span>
                    </div>
                    {isSelected && <Check className="h-4 w-4 text-profit shrink-0" />}
                  </Command.Item>
                )
              })}
            </Command.Group>

            {/* Quick Filter Suggestions (Symbols & Playbook Tags) */}
            <Command.Separator className="h-px bg-white/[0.06] my-1" />

            <Command.Group heading="Filter by Common Symbol" className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] px-2 py-1">
              <div className="flex flex-wrap gap-1.5 px-3 py-1.5">
                {COMMON_SYMBOLS.map((sym) => (
                  <Command.Item
                    key={sym}
                    value={`symbol-${sym} filter ticker ${sym}`}
                    onSelect={() => handleFilterBySymbol(sym)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/[0.04] border border-white/[0.08] text-[#D4D4D8] hover:bg-profit/15 hover:text-profit hover:border-profit/30 cursor-pointer data-[selected=true]:bg-profit/15 data-[selected=true]:text-profit transition-all"
                  >
                    <span>{sym}</span>
                  </Command.Item>
                ))}
              </div>
            </Command.Group>

            <Command.Group heading="Filter by Strategy Tag" className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A] px-2 py-1">
              <div className="flex flex-wrap gap-1.5 px-3 py-1.5">
                {COMMON_TAGS.map((tag) => (
                  <Command.Item
                    key={tag}
                    value={`tag-${tag} filter strategy ${tag}`}
                    onSelect={() => handleFilterByTag(tag)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono bg-white/[0.04] border border-white/[0.08] text-[#D4D4D8] hover:bg-profit/15 hover:text-profit hover:border-profit/30 cursor-pointer data-[selected=true]:bg-profit/15 data-[selected=true]:text-profit transition-all"
                  >
                    <Tag className="h-3 w-3 text-profit/70" />
                    <span>{tag}</span>
                  </Command.Item>
                ))}
              </div>
            </Command.Group>
          </Command.List>

          {/* Raycast-style Keyboard Footer */}
          <div className="flex items-center justify-between px-4 py-2.5 border-t border-white/[0.08] bg-[#121214] text-[11px] text-[#71717A]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="font-mono text-[10px] bg-white/[0.06] border border-white/[0.08] px-1 rounded">↑↓</kbd>
                <span>Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono text-[10px] bg-white/[0.06] border border-white/[0.08] px-1 rounded">↵</kbd>
                <span>Select</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="font-mono text-[10px] bg-white/[0.06] border border-white/[0.08] px-1 rounded">⌘B</kbd>
                <span>Privacy</span>
              </span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-[#525252] font-mono text-[10px]">
              <span>Tip:</span>
              <code className="text-[#71717A]">tag:FOMO</code>
              <span>or</span>
              <code className="text-[#71717A]">symbol:NQ</code>
            </div>
          </div>
        </Command>
      </div>
    </div>
  )
}
