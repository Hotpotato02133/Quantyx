import { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  BookMarked,
  Plus,
  Eye,
  EyeOff,
  X,
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { cn } from '@/lib/cn'

const COMMANDS = [
  {
    group: 'Navigate',
    items: [
      { id: 'nav-dashboard', label: 'Go to Dashboard', icon: LayoutDashboard, href: '/dashboard' },
      { id: 'nav-journal', label: 'Go to Journal', icon: BookOpen, href: '/journal' },
      { id: 'nav-analytics', label: 'Go to Analytics', icon: BarChart3, href: '/analytics' },
      { id: 'nav-playbooks', label: 'Go to Playbooks', icon: BookMarked, href: '/playbooks' },
    ],
  },
  {
    group: 'Actions',
    items: [
      { id: 'action-new-trade', label: 'Log New Trade', icon: Plus, href: null },
      { id: 'action-privacy', label: 'Toggle Privacy Mode', icon: Eye, href: null },
    ],
  },
]

export function CommandPalette() {
  const navigate = useNavigate()
  const {
    commandPaletteOpen,
    setCommandPaletteOpen,
    setTradeSheetOpen,
    privacyMode,
    togglePrivacyMode,
  } = useUiStore()

  // Global keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault()
        setTradeSheetOpen(true)
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        togglePrivacyMode()
      }
      if (e.key === 'Escape') {
        setCommandPaletteOpen(false)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [setCommandPaletteOpen, setTradeSheetOpen, togglePrivacyMode])

  const handleCommand = useCallback(
    (id: string, href: string | null) => {
      setCommandPaletteOpen(false)
      if (id === 'action-new-trade') {
        setTradeSheetOpen(true)
        return
      }
      if (id === 'action-privacy') {
        togglePrivacyMode()
        return
      }
      if (href) navigate(href)
    },
    [navigate, setCommandPaletteOpen, setTradeSheetOpen, togglePrivacyMode],
  )

  if (!commandPaletteOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setCommandPaletteOpen(false)}
        aria-hidden="true"
      />

      {/* Palette */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className={cn(
          'fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2',
          'rounded-xl border border-border bg-elevated/95 backdrop-blur-xl shadow-2xl',
          'animate-slide-up',
        )}
      >
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="text-[#A1A1AA]">⌘</span>
          <input
            autoFocus
            placeholder="Type a command or search…"
            className="flex-1 bg-transparent text-sm text-[#F4F4F5] placeholder-[#525252] outline-none"
            aria-label="Command search input"
          />
          <button
            onClick={() => setCommandPaletteOpen(false)}
            className="text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
            aria-label="Close command palette"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Commands */}
        <div className="max-h-[320px] overflow-y-auto py-2">
          {COMMANDS.map((group) => (
            <div key={group.group}>
              <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#525252]">
                {group.group}
              </p>
              {group.items.map(({ id, label, icon: Icon, href }) => (
                <button
                  key={id}
                  id={id}
                  onClick={() => handleCommand(id, href)}
                  className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#F4F4F5] transition-colors duration-100"
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>{id === 'action-privacy' ? (privacyMode ? 'Disable Privacy Mode' : 'Enable Privacy Mode') : label}</span>
                  {id === 'action-privacy' && privacyMode ? (
                    <EyeOff className="ml-auto h-3.5 w-3.5 text-warning" strokeWidth={1.75} />
                  ) : id === 'action-privacy' ? (
                    <Eye className="ml-auto h-3.5 w-3.5" strokeWidth={1.75} />
                  ) : null}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-[#525252]">
          <span><kbd className="font-mono">↑↓</kbd> navigate</span>
          <span><kbd className="font-mono">↵</kbd> select</span>
          <span><kbd className="font-mono">Esc</kbd> close</span>
        </div>
      </div>
    </>
  )
}
