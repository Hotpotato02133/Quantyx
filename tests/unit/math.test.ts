import { describe, it, expect } from 'vitest'
import {
  round,
  calcPnL,
  calcRMultiple,
  calcWinRate,
  calcProfitFactor,
  calcExpectancy,
  calcMaxDrawdown,
  formatPnL,
  formatPct,
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

describe('calcPnL()', () => {
  it('calculates long trade profit', () => {
    expect(calcPnL('long', 100, 110, 10)).toBe(100)
  })

  it('calculates long trade loss', () => {
    expect(calcPnL('long', 100, 90, 10)).toBe(-100)
  })

  it('calculates short trade profit', () => {
    expect(calcPnL('short', 100, 90, 10)).toBe(100)
  })

  it('calculates short trade loss', () => {
    expect(calcPnL('short', 100, 110, 10)).toBe(-100)
  })

  it('is safe against floating-point drift', () => {
    const result = calcPnL('long', 1.1, 2.2, 1)
    expect(result).toBe(1.1)
  })
})

describe('calcRMultiple()', () => {
  it('returns correct R-multiple', () => {
    expect(calcRMultiple(200, 100, 90, 10)).toBe(2)
  })

  it('returns null when risk is zero', () => {
    expect(calcRMultiple(100, 100, 100, 10)).toBeNull()
  })

  it('returns negative R for losing trade', () => {
    expect(calcRMultiple(-100, 100, 90, 10)).toBe(-1)
  })
})

describe('calcWinRate()', () => {
  it('returns 0 for empty array', () => {
    expect(calcWinRate([])).toBe(0)
  })

  it('returns 100 for all wins', () => {
    expect(calcWinRate([100, 200, 50])).toBe(100)
  })

  it('returns 0 for all losses', () => {
    expect(calcWinRate([-100, -50])).toBe(0)
  })

  it('returns 50 for half wins', () => {
    expect(calcWinRate([100, -50, 200, -30])).toBe(50)
  })
})

describe('calcProfitFactor()', () => {
  it('returns Infinity when no losses', () => {
    expect(calcProfitFactor([100, 200])).toBe(Infinity)
  })

  it('calculates correctly for mixed trades', () => {
    expect(calcProfitFactor([300, -100])).toBe(3)
  })
})

describe('calcExpectancy()', () => {
  it('returns 0 for empty array', () => {
    expect(calcExpectancy([])).toBe(0)
  })

  it('calculates expectancy for mixed trades', () => {
    // 2 wins of 100, 1 loss of 50 → (2/3 * 100) - (1/3 * 50) = 50
    const result = calcExpectancy([100, 100, -50])
    expect(result).toBe(50)
  })
})

describe('calcMaxDrawdown()', () => {
  it('returns zeros for flat equity', () => {
    const result = calcMaxDrawdown([1000, 1000, 1000])
    expect(result.maxDrawdown).toBe(0)
    expect(result.maxDrawdownPct).toBe(0)
  })

  it('calculates single drawdown', () => {
    const result = calcMaxDrawdown([1000, 900, 800, 1100])
    expect(result.maxDrawdown).toBe(200)
    expect(result.maxDrawdownPct).toBe(20)
  })

  it('returns zeros for empty array', () => {
    const result = calcMaxDrawdown([])
    expect(result.maxDrawdown).toBe(0)
  })
})

describe('formatPnL()', () => {
  it('formats positive PnL with + sign', () => {
    expect(formatPnL(1234.56)).toBe('+$1,234.56')
  })

  it('formats negative PnL', () => {
    expect(formatPnL(-320)).toBe('-$320.00')
  })
})

describe('formatPct()', () => {
  it('formats percentage with 1 decimal', () => {
    expect(formatPct(67.3)).toBe('67.3%')
  })
})
