import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TradeDataGrid } from '@/components/trades/TradeDataGrid'
import { useUiStore } from '@/store/useUiStore'
import type { Trade } from '@/types'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: async () => null, userId: 'user-1', isSignedIn: true }),
  useUser: () => ({ user: null, isLoaded: true, isSignedIn: false }),
}))

const mockTrades: Trade[] = [
  {
    id: 'tr-1',
    user_id: 'user-1',
    account_id: 'acc-1',
    symbol: 'NQ1!',
    asset_class: 'futures',
    direction: 'long',
    status: 'closed',
    entry_price: 20250,
    exit_price: 20380,
    stop_price: 20200,
    target_price: 20450,
    quantity: 2,
    fees: 4.5,
    entry_at: '2026-10-19T13:30:00Z',
    exit_at: '2026-10-19T15:00:00Z',
    pnl: 260,
    gross_pnl: 264.5,
    net_pnl: 260,
    r_multiple: 2.6,
    tags: ['BreakAndRetest', 'NYOpen'],
    playbook_id: 'pb_break_retest',
    emotion_tag: 'disciplined',
    execution_rating: 5,
    notes: '# Clean Entry\n- 15m breakout followed by low volume test',
    screenshot_url: 'https://example.com/chart1.webp',
    created_at: '2026-10-19T13:30:00Z',
    updated_at: '2026-10-19T15:00:00Z',
  },
  {
    id: 'tr-2',
    user_id: 'user-1',
    account_id: 'acc-1',
    symbol: 'ES1!',
    asset_class: 'futures',
    direction: 'short',
    status: 'closed',
    entry_price: 5860,
    exit_price: 5842,
    stop_price: 5872,
    target_price: 5830,
    quantity: 3,
    fees: 6.0,
    entry_at: '2026-10-18T15:00:00Z',
    exit_at: '2026-10-18T16:00:00Z',
    pnl: -120,
    gross_pnl: -114,
    net_pnl: -120,
    r_multiple: -0.67,
    tags: ['VWAPReversal'],
    playbook_id: 'pb_vwap_reversal',
    emotion_tag: 'fomo',
    execution_rating: 2,
    notes: 'Chased entry before 5m confirmation',
    screenshot_url: null,
    created_at: '2026-10-18T15:00:00Z',
    updated_at: '2026-10-18T16:00:00Z',
  },
]

function renderWithProviders(ui: React.ReactElement, initialEntries = ['/journal']) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('TradeDataGrid Component (Phase 3)', () => {
  it('renders trade rows with symbol and side badges (Step 3.2)', () => {
    renderWithProviders(<TradeDataGrid trades={mockTrades} />)

    expect(screen.getByText('NQ1!')).toBeInTheDocument()
    expect(screen.getByText('LONG')).toBeInTheDocument()
    expect(screen.getByText('ES1!')).toBeInTheDocument()
    expect(screen.getByText('SHORT')).toBeInTheDocument()
  })

  it('formats Net PnL and R-multiple with tabular numbers (Step 3.2)', () => {
    renderWithProviders(<TradeDataGrid trades={mockTrades} />)

    const positivePnl = screen.getByText('+$260.00')
    expect(positivePnl).toBeInTheDocument()
    expect(positivePnl.className).toContain('text-profit')
    expect(positivePnl.className).toContain('tabular-nums')

    const negativePnl = screen.getByText('-$120.00')
    expect(negativePnl).toBeInTheDocument()
    expect(negativePnl.className).toContain('text-loss')
  })

  it('blurs PnL and R-multiple when Privacy Mode is enabled (Step 3.2)', () => {
    useUiStore.setState({ privacyMode: true })

    renderWithProviders(<TradeDataGrid trades={mockTrades} />)

    const pnlCell = screen.getByText('+$260.00')
    expect(pnlCell.className).toContain('blur-md')

    // Reset store
    useUiStore.setState({ privacyMode: false })
  })

  it('filters trades by symbol dynamically in Filter Bar (Step 3.3)', () => {
    renderWithProviders(<TradeDataGrid trades={mockTrades} />)

    expect(screen.getByText('NQ1!')).toBeInTheDocument()
    expect(screen.getByText('ES1!')).toBeInTheDocument()

    const searchInput = screen.getByPlaceholderText(/search symbol/i)
    fireEvent.change(searchInput, { target: { value: 'ES' } })

    expect(screen.queryByText('NQ1!')).not.toBeInTheDocument()
    expect(screen.getByText('ES1!')).toBeInTheDocument()
  })

  it('filters trades by direction toggle (Step 3.3)', () => {
    renderWithProviders(<TradeDataGrid trades={mockTrades} />)

    const longBtn = screen.getByRole('button', { name: /^long$/i })
    fireEvent.click(longBtn)

    expect(screen.getByText('NQ1!')).toBeInTheDocument()
    expect(screen.queryByText('ES1!')).not.toBeInTheDocument()
  })

  it('expands row detail drawer on click (Step 3.4)', () => {
    renderWithProviders(<TradeDataGrid trades={mockTrades} />)

    // Initially drawer content is not shown
    expect(screen.queryByText(/Trade Journal & Markdown Notes/i)).not.toBeInTheDocument()

    // Click on row to expand
    fireEvent.click(screen.getByText('NQ1!'))

    // Detail drawer is now rendered with notes, execution rating, and metrics
    expect(screen.getByText(/Trade Journal & Markdown Notes/i)).toBeInTheDocument()
    expect(screen.getByText('Clean Entry')).toBeInTheDocument()
    expect(screen.getByText(/15m breakout followed by low volume test/i)).toBeInTheDocument()
    expect(screen.getByText('5/5')).toBeInTheDocument()
  })

  it('displays loading indicator when isLoading is true', () => {
    renderWithProviders(<TradeDataGrid trades={[]} isLoading={true} />)
    expect(screen.getByText(/Loading trade log/i)).toBeInTheDocument()
  })
})
