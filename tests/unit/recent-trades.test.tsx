import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { RecentTradesWidget } from '@/components/dashboard/RecentTradesWidget'
import { useUiStore } from '@/store/useUiStore'
import type { Trade } from '@/types'

const mockRecentTrades: Trade[] = [
  {
    id: 'tr_rec_001',
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
    r_multiple: 3.38,
    tags: ['BreakAndRetest'],
    playbook_id: 'pb_break_retest',
    emotion_tag: 'disciplined',
    execution_rating: 5,
    notes: 'Clean morning breakout',
    screenshot_url: null,
    created_at: '2026-10-18T13:35:00Z',
    updated_at: '2026-10-18T14:45:00Z',
  },
  {
    id: 'tr_rec_002',
    user_id: 'user_1',
    account_id: 'acc_apex_50k',
    symbol: 'ES1!',
    asset_class: 'futures',
    direction: 'short',
    status: 'closed',
    entry_price: 5860.0,
    exit_price: 5885.0,
    stop_price: 5870.0,
    target_price: 5840.0,
    quantity: 1,
    entry_at: '2026-10-17T15:00:00Z',
    exit_at: '2026-10-17T15:30:00Z',
    pnl: -285.0,
    r_multiple: -2.5,
    tags: ['VWAPReversal'],
    playbook_id: 'pb_vwap_reversal',
    emotion_tag: 'fomo',
    execution_rating: 2,
    notes: 'Chased entry',
    screenshot_url: null,
    created_at: '2026-10-17T15:00:00Z',
    updated_at: '2026-10-17T15:30:00Z',
  },
]

describe('RecentTradesWidget Component', () => {
  beforeEach(() => {
    act(() => {
      useUiStore.setState({ privacyMode: false, sharingTrade: null })
    })
  })

  it('renders recent executions table with symbols, side, prices, and net PnL', () => {
    render(
      <MemoryRouter>
        <RecentTradesWidget trades={mockRecentTrades} limit={5} />
      </MemoryRouter>,
    )

    expect(screen.getByText('Recent Executions')).toBeInTheDocument()
    expect(screen.getByText('2 of 2')).toBeInTheDocument()

    // Symbols & Sides
    expect(screen.getByText('NQ1!')).toBeInTheDocument()
    expect(screen.getByText('long')).toBeInTheDocument()
    expect(screen.getByText('ES1!')).toBeInTheDocument()
    expect(screen.getByText('short')).toBeInTheDocument()

    // PnL & R
    expect(screen.getByText('+$540.00')).toBeInTheDocument()
    expect(screen.getByText('-$285.00')).toBeInTheDocument()

    // Playbook & Strategy
    expect(screen.getByText('Break & Retest')).toBeInTheDocument()
  })

  it('clicking share button sets sharingTrade in useUiStore to open share modal', () => {
    render(
      <MemoryRouter>
        <RecentTradesWidget trades={mockRecentTrades} limit={5} />
      </MemoryRouter>,
    )

    const shareButtons = screen.getAllByTitle('Share Trade Card')
    expect(shareButtons.length).toBe(2)

    fireEvent.click(shareButtons[0])

    expect(useUiStore.getState().sharingTrade).toBeDefined()
    expect(useUiStore.getState().sharingTrade?.id).toBe('tr_rec_001')
  })

  it('renders empty state when no executions exist', () => {
    render(
      <MemoryRouter>
        <RecentTradesWidget trades={[]} limit={5} />
      </MemoryRouter>,
    )

    expect(screen.getByText('No recent executions recorded')).toBeInTheDocument()
  })
})
