/**
 * src/lib/math.ts — Financial Calculation Engine (Phase 2)
 *
 * ALL financial computations must be performed here with numerical precision.
 * Direct arithmetic in JSX components is strictly forbidden to prevent
 * IEEE 754 floating-point precision artifacts (e.g., 0.1 + 0.2 !== 0.3).
 */

import type { Trade } from '@/types'

/** Safely rounds a number to `decimals` decimal places using Number.EPSILON. */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export interface TradePnLResult {
  grossPnL: number
  netPnL: number
  gross_pnl: number
  net_pnl: number
}

/**
 * Calculates gross and net PnL for a trade.
 * TC-MATH-01: SHORT, Entry 100, Exit 90, Qty 2, Fees 1.50 -> gross_pnl = 20.00, net_pnl = 18.50.
 *
 * @param side  - 'LONG' | 'SHORT' | 'long' | 'short'
 * @param entry - Entry price per unit
 * @param exit  - Exit price per unit
 * @param qty   - Quantity / units / contracts
 * @param fees  - Brokerage commission / platform fees (default 0)
 */
export function calculateTradePnL(
  side: 'LONG' | 'SHORT' | 'long' | 'short',
  entry: number,
  exit: number,
  qty: number,
  fees = 0,
): TradePnLResult {
  const isLong = side.toUpperCase() === 'LONG'
  const grossRaw = isLong ? (exit - entry) * qty : (entry - exit) * qty
  const gross_pnl = round(grossRaw, 2)
  const net_pnl = round(gross_pnl - fees, 2)

  return {
    grossPnL: net_pnl >= 0 && gross_pnl >= 0 ? gross_pnl : gross_pnl,
    netPnL: net_pnl,
    gross_pnl,
    net_pnl,
  }
}

/** Backward-compatible alias returning net/gross PnL scalar */
export function calcPnL(
  direction: 'long' | 'short' | 'LONG' | 'SHORT',
  entryPrice: number,
  exitPrice: number,
  quantity: number,
  fees = 0,
): number {
  return calculateTradePnL(direction, entryPrice, exitPrice, quantity, fees).net_pnl
}

/**
 * Calculates R-Multiple (risk-adjusted return).
 * R = Net PnL / Initial Risk Amount
 * where Initial Risk = |Entry Price - Stop Loss| * Quantity
 *
 * TC-MATH-03: Risk $100, net PnL -$50 -> r_multiple = -0.50
 *
 * @param netPnl   - Net realized PnL
 * @param entry    - Entry price per unit
 * @param stopLoss - Stop-loss price per unit
 * @param qty      - Position quantity
 */
export function calculateRMultiple(
  netPnl: number,
  entry: number,
  stopLoss: number,
  qty: number,
): number | null {
  const riskPerUnit = Math.abs(entry - stopLoss)
  const initialRisk = riskPerUnit * qty
  if (initialRisk === 0) return null
  return round(netPnl / initialRisk, 2)
}

/** Backward-compatible alias */
export function calcRMultiple(
  pnl: number,
  entryPrice: number,
  stopPrice: number,
  quantity: number,
): number | null {
  return calculateRMultiple(pnl, entryPrice, stopPrice, quantity)
}

/**
 * Calculates win rate from an array of PnL values.
 * Returns percentage (0–100) rounded to 1 decimal place.
 */
export function calcWinRate(pnls: number[]): number {
  if (pnls.length === 0) return 0
  const wins = pnls.filter((p) => p > 0).length
  return round((wins / pnls.length) * 100, 1)
}

/**
 * Calculates Profit Factor: Gross Wins / |Gross Losses|.
 * TC-MATH-02:
 * - Returns 0.00 when no trades exist.
 * - Returns Infinity when grossLosses === 0 and grossWins > 0.
 */
export function calcProfitFactor(pnls: number[]): number {
  if (pnls.length === 0) return 0
  const grossWins = pnls.filter((p) => p > 0).reduce((sum, p) => sum + p, 0)
  const grossLosses = Math.abs(pnls.filter((p) => p < 0).reduce((sum, p) => sum + p, 0))

  if (grossLosses === 0) {
    return grossWins > 0 ? Infinity : 0
  }
  return round(grossWins / grossLosses, 2)
}

/**
 * Calculates Mathematical Expectancy per Trade ($ per trade).
 * E = (Win Rate × Avg Win) − (Loss Rate × Avg Loss)
 */
export function calcExpectancy(pnls: number[]): number {
  if (pnls.length === 0) return 0
  const wins = pnls.filter((p) => p > 0)
  const losses = pnls.filter((p) => p < 0)
  const winRate = wins.length / pnls.length
  const lossRate = losses.length / pnls.length
  const avgWin = wins.length > 0 ? wins.reduce((s, p) => s + p, 0) / wins.length : 0
  const avgLoss = losses.length > 0 ? Math.abs(losses.reduce((s, p) => s + p, 0) / losses.length) : 0
  return round(winRate * avgWin - lossRate * avgLoss, 2)
}

/**
 * Calculates Peak-to-Trough Maximum Drawdown.
 * TC-MATH-04: Curve [10000, 10500, 10200, 9800, 10600]
 * Peak 10500 to trough 9800 -> -$700 or -6.67%
 */
export function calcMaxDrawdown(equityCurve: number[]): {
  maxDrawdown: number
  maxDrawdownPct: number
} {
  if (equityCurve.length === 0) return { maxDrawdown: 0, maxDrawdownPct: 0 }

  let peak = equityCurve[0]
  let maxDrawdown = 0
  let maxDrawdownPct = 0

  for (const value of equityCurve) {
    if (value > peak) {
      peak = value
    }
    const drawdown = peak - value
    const drawdownPct = peak > 0 ? (drawdown / peak) * 100 : 0
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown
      maxDrawdownPct = drawdownPct
    }
  }

  return {
    maxDrawdown: round(maxDrawdown, 2),
    maxDrawdownPct: round(maxDrawdownPct, 2),
  }
}

export interface PortfolioMetrics {
  totalTrades: number
  winsCount: number
  lossesCount: number
  breakevenCount: number
  winRate: number
  profitFactor: number
  expectancy: number
  maxDrawdown: number
  maxDrawdownPct: number
  totalPnL: number
  avgWin: number
  avgLoss: number
  bestTrade: number
  worstTrade: number
  avgRMultiple: number | null
  cumulativeEquity: number[]
}

/**
 * Step 2.1: Calculates comprehensive portfolio metrics from an array of trades.
 * Returns Win Rate, Profit Factor, Expectancy, Max Drawdown %, and Cumulative Equity array.
 */
export function calculatePortfolioMetrics(
  trades: Array<Pick<Trade, 'status' | 'pnl' | 'r_multiple' | 'exit_at'>>,
  initialBalance = 10000,
): PortfolioMetrics {
  const closedTrades = trades
    .filter((t) => t.status === 'closed' || t.status === 'WIN' || t.status === 'LOSS' || t.status === 'BREAKEVEN')
    .filter((t) => typeof t.pnl === 'number')

  if (closedTrades.length === 0) {
    return {
      totalTrades: 0,
      winsCount: 0,
      lossesCount: 0,
      breakevenCount: 0,
      winRate: 0,
      profitFactor: 0,
      expectancy: 0,
      maxDrawdown: 0,
      maxDrawdownPct: 0,
      totalPnL: 0,
      avgWin: 0,
      avgLoss: 0,
      bestTrade: 0,
      worstTrade: 0,
      avgRMultiple: null,
      cumulativeEquity: [initialBalance],
    }
  }

  // Sort chronologically by exit time if available
  const sorted = [...closedTrades].sort((a, b) => {
    const timeA = a.exit_at ? new Date(a.exit_at).getTime() : 0
    const timeB = b.exit_at ? new Date(b.exit_at).getTime() : 0
    return timeA - timeB
  })

  const pnls = sorted.map((t) => t.pnl as number)
  const wins = pnls.filter((p) => p > 0)
  const losses = pnls.filter((p) => p < 0)
  const breakevens = pnls.filter((p) => p === 0)

  let currentBalance = initialBalance
  const cumulativeEquity: number[] = [initialBalance]
  for (const p of pnls) {
    currentBalance = round(currentBalance + p, 2)
    cumulativeEquity.push(currentBalance)
  }

  const { maxDrawdown, maxDrawdownPct } = calcMaxDrawdown(cumulativeEquity)

  const rMultiples = sorted
    .map((t) => t.r_multiple)
    .filter((r): r is number => typeof r === 'number')

  const totalPnL = round(pnls.reduce((sum, p) => sum + p, 0), 2)
  const avgWin = wins.length > 0 ? round(wins.reduce((sum, p) => sum + p, 0) / wins.length, 2) : 0
  const avgLoss = losses.length > 0 ? round(Math.abs(losses.reduce((sum, p) => sum + p, 0) / losses.length), 2) : 0
  const bestTrade = pnls.length > 0 ? Math.max(...pnls) : 0
  const worstTrade = pnls.length > 0 ? Math.min(...pnls) : 0
  const avgRMultiple = rMultiples.length > 0 ? round(rMultiples.reduce((sum, r) => sum + r, 0) / rMultiples.length, 2) : null

  return {
    totalTrades: closedTrades.length,
    winsCount: wins.length,
    lossesCount: losses.length,
    breakevenCount: breakevens.length,
    winRate: calcWinRate(pnls),
    profitFactor: calcProfitFactor(pnls),
    expectancy: calcExpectancy(pnls),
    maxDrawdown,
    maxDrawdownPct,
    totalPnL,
    avgWin,
    avgLoss,
    bestTrade,
    worstTrade,
    avgRMultiple,
    cumulativeEquity,
  }
}

/**
 * Formats a number as currency with sign indicator.
 * @example formatPnL(1234.56) → "+$1,234.56"
 * @example formatPnL(-320)    → "-$320.00"
 */
export function formatPnL(value: number, currency = 'USD'): string {
  const sign = value > 0 ? '+' : ''
  return `${sign}${new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(value)}`
}

/**
 * Formats percentage for display.
 * @example formatPct(67.3) → "67.3%"
 */
export function formatPct(value: number, decimals = 1): string {
  return `${round(value, decimals).toFixed(decimals)}%`
}

/**
 * Formats R-Multiple for display.
 * @example formatRMultiple(2.54) → "+2.54R"
 * @example formatRMultiple(-1.0)  → "-1.00R"
 */
export function formatRMultiple(value: number | null): string {
  if (value === null || isNaN(value)) return '—'
  const sign = value > 0 ? '+' : ''
  return `${sign}${round(value, 2).toFixed(2)}R`
}
