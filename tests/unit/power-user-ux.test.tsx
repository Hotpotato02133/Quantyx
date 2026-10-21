import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CommandPalette } from '@/components/layout/CommandPalette'
import { ShareTradeCardModal } from '@/components/trades/ShareTradeCardModal'
import { useUiStore } from '@/store/useUiStore'
import { useFilterStore } from '@/store/useFilterStore'
import type { Trade } from '@/types'

// Mock clipboard
const writeTextMock = vi.fn().mockResolvedValue(undefined)
const writeMock = vi.fn().mockResolvedValue(undefined)

Object.assign(navigator, {
  clipboard: {
    writeText: writeTextMock,
    write: writeMock,
  },
})

// Mock html-to-image to avoid canvas DOM issues in JSDOM
vi.mock('html-to-image', () => ({
  toPng: vi.fn().mockResolvedValue('data:image/png;base64,mockPngDataUrl'),
  toBlob: vi.fn().mockResolvedValue(new Blob(['mockPng'], { type: 'image/png' })),
}))

const mockTrade: Trade = {
  id: 'tr_test_001',
  user_id: 'user_1',
  account_id: 'acc_apex_50k',
  symbol: 'NQ1!',
  asset_class: 'futures',
  direction: 'long',
  status: 'closed',
  entry_price: 20150.0,
  exit_price: 20285.0,
  stop_price: 20110.0,
  target_price: 20300.0,
  quantity: 2,
  entry_at: '2026-10-18T13:35:00Z',
  exit_at: '2026-10-18T14:45:00Z',
  pnl: 540.0,
  gross_pnl: 544.5,
  net_pnl: 540.0,
  r_multiple: 3.38,
  tags: ['BreakAndRetest', 'NYOpen'],
  playbook_id: 'pb_break_retest',
  emotion_tag: 'disciplined',
  execution_rating: 5,
  notes: 'Clean morning breakout',
  screenshot_url: 'https://example.com/chart.png',
  screenshot_urls: ['https://example.com/chart.png'],
  created_at: '2026-10-18T13:35:00Z',
  updated_at: '2026-10-18T14:45:00Z',
}

describe('Power-User UX & Polish (Phase 5)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    act(() => {
      useUiStore.setState({
        commandPaletteOpen: false,
        tradeSheetOpen: false,
        settingsModalOpen: false,
        csvModalOpen: false,
        privacyMode: false,
        activeAccountId: 'acc_apex_50k',
      })
      useFilterStore.setState({
        accountId: 'acc_apex_50k',
        symbol: '',
        tags: [],
        direction: 'all',
      })
    })
  })

  describe('GlobalCommandPalette Component (Step 5.1)', () => {
    it('renders search input and commands when opened', () => {
      act(() => {
        useUiStore.setState({ commandPaletteOpen: true })
      })

      render(
        <MemoryRouter>
          <CommandPalette />
        </MemoryRouter>,
      )

      expect(screen.getByRole('dialog', { name: /Global Command Palette/i })).toBeInTheDocument()
      expect(screen.getByPlaceholderText(/Type a command/i)).toBeInTheDocument()

      // Quick actions
      expect(screen.getByText('Log New Trade')).toBeInTheDocument()
      expect(screen.getByText(/Enable Privacy Mode/i)).toBeInTheDocument()
      expect(screen.getByText('Import Trades from CSV')).toBeInTheDocument()
      expect(screen.getByText('Open Settings & Preferences')).toBeInTheDocument()

      // Navigation
      expect(screen.getByText('Dashboard Overview')).toBeInTheDocument()
      expect(screen.getByText('Trade Journal & Grid')).toBeInTheDocument()
      expect(screen.getByText('Performance Analytics')).toBeInTheDocument()
      expect(screen.getByText('Playbooks & Strategies')).toBeInTheDocument()
    })

    it('toggles privacy mode via Command Palette item', () => {
      act(() => {
        useUiStore.setState({ commandPaletteOpen: true, privacyMode: false })
      })

      render(
        <MemoryRouter>
          <CommandPalette />
        </MemoryRouter>,
      )

      const privacyItem = screen.getByText(/Enable Privacy Mode/i)
      fireEvent.click(privacyItem)

      expect(useUiStore.getState().privacyMode).toBe(true)
    })

    it('switches trading account from Command Palette', () => {
      act(() => {
        useUiStore.setState({ commandPaletteOpen: true, activeAccountId: 'acc_apex_50k' })
      })

      render(
        <MemoryRouter>
          <CommandPalette />
        </MemoryRouter>,
      )

      // Find Personal Futures account item
      const personalAccountItem = screen.getByText('Personal Futures (Interactive Brokers)')
      expect(personalAccountItem).toBeInTheDocument()

      fireEvent.click(personalAccountItem)

      expect(useFilterStore.getState().accountId).toBe('acc_personal_futures')
      expect(useUiStore.getState().activeAccountId).toBe('acc_personal_futures')
      expect(useUiStore.getState().commandPaletteOpen).toBe(false)
    })

    it('dynamically parses tag: prefix queries and applies tag filter', () => {
      act(() => {
        useUiStore.setState({ commandPaletteOpen: true })
      })

      render(
        <MemoryRouter>
          <CommandPalette />
        </MemoryRouter>,
      )

      const searchInput = screen.getByPlaceholderText(/Type a command/i)
      fireEvent.change(searchInput, { target: { value: 'tag:FOMO' } })

      // Dynamic item appears
      const filterItem = screen.getByText(/Filter Journal by tag/i)
      expect(filterItem).toBeInTheDocument()

      fireEvent.click(filterItem)

      expect(useFilterStore.getState().tags).toContain('FOMO')
      expect(useUiStore.getState().commandPaletteOpen).toBe(false)
    })

    it('dynamically parses symbol: prefix queries and applies symbol filter', () => {
      act(() => {
        useUiStore.setState({ commandPaletteOpen: true })
      })

      render(
        <MemoryRouter>
          <CommandPalette />
        </MemoryRouter>,
      )

      const searchInput = screen.getByPlaceholderText(/Type a command/i)
      fireEvent.change(searchInput, { target: { value: 'symbol:BTC' } })

      const filterItem = screen.getByText(/Filter Journal by symbol/i)
      expect(filterItem).toBeInTheDocument()

      fireEvent.click(filterItem)

      expect(useFilterStore.getState().symbol).toBe('BTC')
      expect(useUiStore.getState().commandPaletteOpen).toBe(false)
    })

    it('responds to global hotkeys Cmd+K, Cmd+B, and Cmd+N', () => {
      render(
        <MemoryRouter>
          <CommandPalette />
        </MemoryRouter>,
      )

      // Test Cmd+K opens palette
      expect(useUiStore.getState().commandPaletteOpen).toBe(false)
      fireEvent.keyDown(window, { key: 'k', metaKey: true })
      expect(useUiStore.getState().commandPaletteOpen).toBe(true)

      // Test Cmd+B toggles privacy mode
      expect(useUiStore.getState().privacyMode).toBe(false)
      fireEvent.keyDown(window, { key: 'b', metaKey: true })
      expect(useUiStore.getState().privacyMode).toBe(true)

      // Test Cmd+N opens trade sheet
      expect(useUiStore.getState().tradeSheetOpen).toBe(false)
      fireEvent.keyDown(window, { key: 'n', metaKey: true })
      expect(useUiStore.getState().tradeSheetOpen).toBe(true)
    })
  })

  describe('ShareTradeCardModal Component (Step 5.2)', () => {
    it('renders trade card with verified badge, metrics bento, and strategy', () => {
      render(<ShareTradeCardModal trade={mockTrade} isOpen={true} onClose={() => {}} />)

      // Branding & verified pill
      expect(screen.getAllByText(/QUANTYX/i).length).toBeGreaterThan(0)
      expect(screen.getByText('VERIFIED')).toBeInTheDocument()

      // Symbol & side
      expect(screen.getByText('NQ1!')).toBeInTheDocument()
      expect(screen.getByText('long')).toBeInTheDocument()

      // Default Dollar PnL
      expect(screen.getByText('+$540.00')).toBeInTheDocument()

      // Entry & Exit prices
      expect(screen.getByText('$20,150.00')).toBeInTheDocument()
      expect(screen.getByText('$20,285.00')).toBeInTheDocument()

      // Playbook & emotion
      expect(screen.getByText('Break & Retest')).toBeInTheDocument()
      expect(screen.getByText('disciplined')).toBeInTheDocument()
    })

    it('switches between display modes (Dollar, R-Multiple, Percent)', () => {
      render(<ShareTradeCardModal trade={mockTrade} isOpen={true} onClose={() => {}} />)

      const rMultipleBtn = screen.getByRole('button', { name: 'R-Multiple' })
      fireEvent.click(rMultipleBtn)
      expect(screen.getByText('+3.38R')).toBeInTheDocument()

      const percentBtn = screen.getByRole('button', { name: 'Percent (%)' })
      fireEvent.click(percentBtn)
      expect(screen.getByText('+0.67%')).toBeInTheDocument()
    })

    it('hides dollar amounts when Protected Capital / Privacy is enabled', () => {
      render(<ShareTradeCardModal trade={mockTrade} isOpen={true} onClose={() => {}} />)

      const privacyBtn = screen.getByRole('button', { name: /Hide \$ \(Privacy\)/i })
      fireEvent.click(privacyBtn)

      // Shows capital protected badge and falls back to R-Multiple
      expect(screen.getByText(/Capital Protected/i)).toBeInTheDocument()
      expect(screen.getByText('+3.38R')).toBeInTheDocument()
    })

    it('copies social markdown summary to clipboard when clicking Copy Text', () => {
      render(<ShareTradeCardModal trade={mockTrade} isOpen={true} onClose={() => {}} />)

      const copyTextBtn = screen.getByRole('button', { name: /Copy Text/i })
      fireEvent.click(copyTextBtn)

      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining('$NQ1! LONG | +3.38R (+$540.00)'),
      )
      expect(writeTextMock).toHaveBeenCalledWith(
        expect.stringContaining('@Quantyx Terminal'),
      )
    })
  })
})
