import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { KpiBentoGrid } from '@/components/dashboard/KpiBentoGrid'
import { EquityCurveChart } from '@/components/dashboard/EquityCurveChart'
import { SetupPerformanceChart, CalendarHeatmap } from '@/components/dashboard/DashboardCharts'
import { useUiStore } from '@/store/useUiStore'
import type { Trade, TradeStats } from '@/types'

const mockStats: TradeStats = {
  totalTrades: 10,
  winsCount: 7,
  lossesCount: 2,
  breakevenCount: 1,
  winRate: 70.0,
  profitFactor: 2.85,
  expectancy: 145.5,
  rExpectancy: 1.45,
  totalPnL: 1455.0,
  pnlPct: 14.55,
  maxDrawdown: 350.0,
  maxDrawdownPct: 3.2,
  currentDrawdownPct: 1.5,
  maxDailyDrawdownPct: 5.0,
  avgWin: 250.0,
  avgLoss: -100.0,
  bestTrade: 520.0,
  worstTrade: -150.0,
  avgRMultiple: 1.8,
  sparklineData: [10000, 10250, 10150, 10450, 10900, 11455],
}

const mockTrades: Trade[] = [
  {
    id: 't-1',
    user_id: 'user-1',
    account_id: 'acc-1',
    symbol: 'NQ1!',
    asset_class: 'futures',
    direction: 'long',
    status: 'closed',
    entry_price: 20000,
    exit_price: 20100,
    stop_price: 19950,
    target_price: 20200,
    quantity: 1,
    fees: 2.0,
    entry_at: '2026-10-15T13:30:00Z',
    exit_at: '2026-10-15T14:30:00Z',
    pnl: 500,
    gross_pnl: 502,
    net_pnl: 500,
    r_multiple: 2.0,
    tags: ['BreakAndRetest'],
    playbook_id: 'pb_break_retest',
    emotion_tag: 'disciplined',
    execution_rating: 5,
    notes: 'Clean retest',
    screenshot_url: null,
    created_at: '2026-10-15T13:30:00Z',
    updated_at: '2026-10-15T14:30:00Z',
  },
  {
    id: 't-2',
    user_id: 'user-1',
    account_id: 'acc-1',
    symbol: 'ES1!',
    asset_class: 'futures',
    direction: 'short',
    status: 'closed',
    entry_price: 5800,
    exit_price: 5820,
    stop_price: 5790,
    target_price: 5750,
    quantity: 2,
    fees: 4.0,
    entry_at: '2026-10-16T15:00:00Z',
    exit_at: '2026-10-16T16:00:00Z',
    pnl: -200,
    gross_pnl: -196,
    net_pnl: -200,
    r_multiple: -1.0,
    tags: ['VWAPReversal'],
    playbook_id: 'pb_vwap_reversal',
    emotion_tag: 'fomo',
    execution_rating: 2,
    notes: 'Failed reversal',
    screenshot_url: null,
    created_at: '2026-10-16T15:00:00Z',
    updated_at: '2026-10-16T16:00:00Z',
  },
]

describe('Performance Analytics & Charting Bento Grid (Phase 4)', () => {
  beforeEach(() => {
    act(() => {
      useUiStore.setState({ privacyMode: false })
    })
  })

  describe('KpiBentoGrid Component (Step 4.1)', () => {
    it('renders all 5 institutional metric cards with accurate data', () => {
      render(<KpiBentoGrid stats={mockStats} />)

      // 1. Net PnL Card
      expect(screen.getByText('Net Realized PnL')).toBeInTheDocument()
      expect(screen.getByText('+$1,455.00')).toBeInTheDocument()
      expect(screen.getByText('+14.55%')).toBeInTheDocument()

      // 2. Win Rate Card
      expect(screen.getByText('Win Rate')).toBeInTheDocument()
      expect(screen.getByText('70.0%')).toBeInTheDocument()
      expect(screen.getByText('7 W')).toBeInTheDocument()
      expect(screen.getByText('2 L')).toBeInTheDocument()
      expect(screen.getByText('1 BE')).toBeInTheDocument()

      // 3. Profit Factor Card
      expect(screen.getByText('Profit Factor')).toBeInTheDocument()
      expect(screen.getByText('2.85')).toBeInTheDocument()
      expect(screen.getByText('High institutional edge (>1.5)')).toBeInTheDocument()

      // 4. Expectancy Card
      expect(screen.getByText('Expectancy / Trade')).toBeInTheDocument()
      expect(screen.getByText('+$145.50')).toBeInTheDocument()
      expect(screen.getByText('+1.45R')).toBeInTheDocument()

      // 5. Drawdown & Risk Limit Card
      expect(screen.getByText('Drawdown & Risk Limit')).toBeInTheDocument()
      expect(screen.getByText('-3.20%')).toBeInTheDocument()
      expect(screen.getByText('-$350.00')).toBeInTheDocument()
      expect(screen.getByText(/Safe Margin/i)).toBeInTheDocument()
    })

    it('renders warning banner when current drawdown approaches or breaches daily risk limit', () => {
      // Approaching limit (e.g. 4.2% with 5% max limit)
      const approachingStats: TradeStats = {
        ...mockStats,
        currentDrawdownPct: 4.2,
        maxDailyDrawdownPct: 5.0,
      }

      const { rerender } = render(<KpiBentoGrid stats={approachingStats} />)
      expect(screen.getByText(/Warning: Approaching 5% Risk Limit/i)).toBeInTheDocument()

      // Breached limit (e.g. 5.5% with 5% max limit)
      const breachedStats: TradeStats = {
        ...mockStats,
        currentDrawdownPct: 5.5,
        maxDailyDrawdownPct: 5.0,
      }
      rerender(<KpiBentoGrid stats={breachedStats} />)
      expect(screen.getByText(/Max Daily Drawdown \(5%\) Breached!/i)).toBeInTheDocument()
    })

    it('renders correct color gauge for different profit factor ranges', () => {
      // Moderate edge: 1.25 (Orange)
      const moderateStats: TradeStats = { ...mockStats, profitFactor: 1.25 }
      const { rerender } = render(<KpiBentoGrid stats={moderateStats} />)
      expect(screen.getByText('Moderate edge (1.0–1.5)')).toBeInTheDocument()

      // Negative edge: 0.75 (Red)
      const negativeStats: TradeStats = { ...mockStats, profitFactor: 0.75 }
      rerender(<KpiBentoGrid stats={negativeStats} />)
      expect(screen.getByText('Negative edge (<1.0)')).toBeInTheDocument()
    })

    it('blurs values when privacy mode is enabled', () => {
      render(<KpiBentoGrid stats={mockStats} />)
      const pnlElement = screen.getByText('+$1,455.00')
      expect(pnlElement.className).not.toContain('blur-md')

      act(() => {
        useUiStore.setState({ privacyMode: true })
      })

      expect(pnlElement.className).toContain('blur-md')
    })

    it('renders loading skeleton when isLoading is true', () => {
      const { container } = render(<KpiBentoGrid isLoading={true} />)
      const pulses = container.querySelectorAll('.animate-pulse')
      expect(pulses.length).toBe(5)
    })
  })

  describe('EquityCurveChart Component (Step 4.2)', () => {
    it('renders header, current net progression, and view mode options', () => {
      render(<EquityCurveChart trades={mockTrades} initialBalance={10000} />)

      expect(screen.getByText('Institutional Equity Curve')).toBeInTheDocument()
      expect(screen.getByText('Cumulative P&L ($)')).toBeInTheDocument()
      expect(screen.getByText('Account Balance ($)')).toBeInTheDocument()
      expect(screen.getByText('Cumulative R (R)')).toBeInTheDocument()
    })

    it('switches between view modes via segmented controls', () => {
      render(<EquityCurveChart trades={mockTrades} initialBalance={10000} />)

      const balanceButton = screen.getByRole('button', { name: /Account Balance/i })
      fireEvent.click(balanceButton)

      // Active button has profit styling
      expect(balanceButton.className).toContain('text-profit')

      const rMultipleButton = screen.getByRole('button', { name: /Cumulative R/i })
      fireEvent.click(rMultipleButton)
      expect(rMultipleButton.className).toContain('text-profit')
    })

    it('renders empty state when no closed executions exist', () => {
      render(<EquityCurveChart trades={[]} />)
      expect(screen.getByText('No closed executions found')).toBeInTheDocument()
    })
  })

  describe('SetupPerformanceChart Component (Step 4.3)', () => {
    it('renders comparative strategy breakdown for tagged trades', () => {
      render(<SetupPerformanceChart trades={mockTrades} />)

      expect(screen.getByText('Setup Performance')).toBeInTheDocument()
      expect(screen.getByText(/Comparative net PnL and win rate across Playbooks/i)).toBeInTheDocument()
      expect(screen.getByText('2 Playbooks')).toBeInTheDocument()
    })

    it('renders empty placeholder when trades have no setup data', () => {
      render(<SetupPerformanceChart trades={[]} />)
      expect(screen.getByText('No tagged executions yet')).toBeInTheDocument()
    })
  })

  describe('CalendarHeatmap Component (Step 4.3)', () => {
    it('renders calendar days, navigation controls, and weekday labels', () => {
      render(<CalendarHeatmap trades={mockTrades} />)

      // Calendar weekday headers
      expect(screen.getByText('Sun')).toBeInTheDocument()
      expect(screen.getByText('Mon')).toBeInTheDocument()
      expect(screen.getByText('Fri')).toBeInTheDocument()

      // Navigation controls
      expect(screen.getByTitle('Previous Month')).toBeInTheDocument()
      expect(screen.getByTitle('Next Month')).toBeInTheDocument()

      // Legend
      expect(screen.getByText(/Profit \/ Loss Day Color Scaling/i)).toBeInTheDocument()
    })

    it('navigates to previous and next months when clicking navigation buttons', () => {
      render(<CalendarHeatmap trades={mockTrades} />)

      // Starting month corresponds to October 2026 based on mock trades
      expect(screen.getByText('October 2026')).toBeInTheDocument()

      const prevBtn = screen.getByTitle('Previous Month')
      fireEvent.click(prevBtn)
      expect(screen.getByText('September 2026')).toBeInTheDocument()

      const nextBtn = screen.getByTitle('Next Month')
      fireEvent.click(nextBtn)
      expect(screen.getByText('October 2026')).toBeInTheDocument()
    })
  })
})
