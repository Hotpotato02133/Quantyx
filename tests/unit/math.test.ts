import { describe, it, expect } from 'vitest'
import {
  round,
  calculateTradePnL,
  calculateRMultiple,
  calculatePortfolioMetrics,
  calcPnL,
  calcRMultiple,
  calcWinRate,
  calcProfitFactor,
  calcExpectancy,
  calcMaxDrawdown,
  formatPnL,
  formatPct,
  formatRMultiple,
} from '@/lib/math'

describe('round()', () => {
  it('rounds to 2 decimal places by default', () => {
    expect(round(1.2345)).toBe(1.23)
    expect(round(1.2355)).toBe(1.24)
  })

  it('handles floating-point precision correctly', () => {
    expect(round(0.1 + 0.2)).toBe(0.3)
  })
})

describe('TC-MATH-01: calculateTradePnL (Long vs. Short PnL & Fees)', () => {
  it('verifies a SHORT trade with Entry 100, Exit 90, Qty 2, Fees 1.50 outputs gross_pnl = 20.00 and net_pnl = 18.50', () => {
    const result = calculateTradePnL('SHORT', 100, 90, 2, 1.5)
    expect(result.gross_pnl).toBe(20.0)
    expect(result.net_pnl).toBe(18.5)
  })

  it('calculates LONG trade with fees correctly', () => {
    const result = calculateTradePnL('LONG', 100, 115, 2, 2.5)
    expect(result.gross_pnl).toBe(30.0)
    expect(result.net_pnl).toBe(27.5)
  })

  it('calculates losing trade with fees added to loss', () => {
    const result = calculateTradePnL('LONG', 100, 95, 2, 1.0)
    expect(result.gross_pnl).toBe(-10.0)
    expect(result.net_pnl).toBe(-11.0)
  })
})

describe('TC-MATH-02: Zero Division Safety (Profit Factor)', () => {
  it('verifies Profit Factor returns Infinity when grossLosses === 0 and grossWins > 0', () => {
    expect(calcProfitFactor([100, 250, 400])).toBe(Infinity)
  })

  it('verifies Profit Factor returns 0.00 when no trades exist', () => {
    expect(calcProfitFactor([])).toBe(0)
  })

  it('verifies Profit Factor returns 0 when only losses exist', () => {
    expect(calcProfitFactor([-100, -50])).toBe(0)
  })
})

describe('TC-MATH-03: calculateRMultiple (R-Multiple Accuracy)', () => {
  it('verifies a trade risking $100 that nets -$50 (early manual exit) calculates r_multiple = -0.50', () => {
    // entry 100, stopLoss 90, qty 10 -> initial risk = 10 * 10 = $100. netPnl = -$50
    const result = calculateRMultiple(-50, 100, 90, 10)
    expect(result).toBe(-0.5)
  })

  it('returns positive R multiple for winning trade', () => {
    // entry 100, stopLoss 90, qty 10 -> risk $100. netPnl = +$250 -> 2.50R
    const result = calculateRMultiple(250, 100, 90, 10)
    expect(result).toBe(2.5)
  })

  it('returns null when initial risk is zero', () => {
    expect(calculateRMultiple(100, 100, 100, 10)).toBeNull()
  })
})

describe('TC-MATH-04: Peak-to-Trough Max Drawdown', () => {
  it('given an equity curve of [10000, 10500, 10200, 9800, 10600], verifies Max Drawdown calculates from peak 10500 to trough 9800 (-$700 or -6.67%)', () => {
    const curve = [10000, 10500, 10200, 9800, 10600]
    const result = calcMaxDrawdown(curve)
    expect(result.maxDrawdown).toBe(700)
    expect(result.maxDrawdownPct).toBe(6.67)
  })

  it('returns zero drawdown for monotonically increasing curve', () => {
    const result = calcMaxDrawdown([1000, 1100, 1200, 1300])
    expect(result.maxDrawdown).toBe(0)
    expect(result.maxDrawdownPct).toBe(0)
  })
})

describe('calculatePortfolioMetrics()', () => {
  it('computes win rate, profit factor, drawdown, expectancy, and cumulative equity array', () => {
    const mockTrades = [
      { status: 'closed' as const, pnl: 500, r_multiple: 2.5, exit_at: '2026-10-01T10:00:00Z' },
      { status: 'closed' as const, pnl: -200, r_multiple: -1.0, exit_at: '2026-10-02T10:00:00Z' },
      { status: 'closed' as const, pnl: 300, r_multiple: 1.5, exit_at: '2026-10-03T10:00:00Z' },
      { status: 'closed' as const, pnl: -100, r_multiple: -0.5, exit_at: '2026-10-04T10:00:00Z' },
    ]

    const metrics = calculatePortfolioMetrics(mockTrades, 10000)

    expect(metrics.totalTrades).toBe(4)
    expect(metrics.winsCount).toBe(2)
    expect(metrics.lossesCount).toBe(2)
    expect(metrics.winRate).toBe(50.0)
    expect(metrics.profitFactor).toBe(2.67) // 800 / 300
    expect(metrics.totalPnL).toBe(500)
    expect(metrics.cumulativeEquity).toEqual([10000, 10500, 10300, 10600, 10500])
    expect(metrics.maxDrawdown).toBe(200)
  })

  it('returns default zero values for empty trades list', () => {
    const metrics = calculatePortfolioMetrics([], 50000)
    expect(metrics.totalTrades).toBe(0)
    expect(metrics.winRate).toBe(0)
    expect(metrics.profitFactor).toBe(0)
    expect(metrics.cumulativeEquity).toEqual([50000])
  })
})

describe('Formatters', () => {
  it('formats positive PnL with + sign', () => {
    expect(formatPnL(1234.56)).toBe('+$1,234.56')
  })

  it('formats negative PnL', () => {
    expect(formatPnL(-320)).toBe('-$320.00')
  })

  it('formats percentage with 1 decimal', () => {
    expect(formatPct(67.3)).toBe('67.3%')
  })

  it('formats R-Multiple with sign and unit', () => {
    expect(formatRMultiple(3.2)).toBe('+3.20R')
    expect(formatRMultiple(-1.0)).toBe('-1.00R')
    expect(formatRMultiple(null)).toBe('—')
  })
})
