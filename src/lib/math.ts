/**
 * src/lib/math.ts — Financial Calculation Engine
 *
 * ALL financial computations must be performed here.
 * Direct arithmetic in JSX components is STRICTLY BANNED due to
 * IEEE 754 floating-point precision errors (e.g. 0.1 + 0.2 !== 0.3).
 *
 * All monetary values are treated as numbers rounded to a fixed precision
 * using toFixed() before display to avoid rounding drift.
 */

/** Safely rounds a number to `decimals` decimal places. */
export function round(value: number, decimals = 2): number {
  const factor = Math.pow(10, decimals)
  return Math.round((value + Number.EPSILON) * factor) / factor
}

/**
 * Calculates gross PnL for a trade.
 * @param direction - 'long' or 'short'
 * @param entryPrice - Entry price per unit
 * @param exitPrice  - Exit price per unit
 * @param quantity   - Number of units / contracts
 * @returns PnL in currency units, rounded to 2 decimal places
 */
export function calcPnL(
  direction: 'long' | 'short',
  entryPrice: number,
  exitPrice: number,
  quantity: number,
): number {
  const raw =
    direction === 'long'
      ? (exitPrice - entryPrice) * quantity
      : (entryPrice - exitPrice) * quantity
  return round(raw, 2)
}

/**
 * Calculates the R-Multiple (risk-adjusted return).
 * R = PnL / (entry - stop) * quantity
 *
 * @param pnl        - Realized PnL (from calcPnL)
 * @param entryPrice - Entry price per unit
 * @param stopPrice  - Stop-loss price per unit
 * @param quantity   - Number of units / contracts
 * @returns R-Multiple rounded to 2 decimal places, or null if risk is zero
 */
export function calcRMultiple(
  pnl: number,
  entryPrice: number,
  stopPrice: number,
  quantity: number,
): number | null {
  const riskPerUnit = Math.abs(entryPrice - stopPrice)
  const totalRisk = riskPerUnit * quantity
  if (totalRisk === 0) return null
  return round(pnl / totalRisk, 2)
}

/**
 * Calculates win rate from a set of PnL values.
 * @param pnls - Array of realized PnL values
 * @returns Win rate as a percentage (0–100), rounded to 1 decimal place
 */
export function calcWinRate(pnls: number[]): number {
  if (pnls.length === 0) return 0
  const wins = pnls.filter((p) => p > 0).length
  return round((wins / pnls.length) * 100, 1)
}

/**
 * Calculates the Profit Factor.
 * PF = Gross Profit / |Gross Loss|
 * A value > 1 indicates a profitable system.
 *
 * @param pnls - Array of realized PnL values
 * @returns Profit Factor rounded to 2 decimal places, or Infinity if no losses
 */
export function calcProfitFactor(pnls: number[]): number {
  const grossProfit = pnls.filter((p) => p > 0).reduce((sum, p) => sum + p, 0)
  const grossLoss = Math.abs(pnls.filter((p) => p < 0).reduce((sum, p) => sum + p, 0))
  if (grossLoss === 0) return Infinity
  return round(grossProfit / grossLoss, 2)
}

/**
 * Calculates mathematical expectancy per trade.
 * E = (Win Rate × Avg Win) − (Loss Rate × Avg Loss)
 *
 * @param pnls - Array of realized PnL values
 * @returns Expectancy in currency units per trade, rounded to 2 decimal places
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
 * Calculates the Maximum Drawdown from an equity curve.
 * @param equityCurve - Array of cumulative equity values over time
 * @returns Object containing maxDrawdown (currency) and maxDrawdownPct (percentage)
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
    if (value > peak) peak = value
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

/**
 * Formats a number as a currency string with sign prefix for PnL display.
 * Uses Intl.NumberFormat for locale-aware formatting.
 *
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
 * Formats a percentage value for display.
 * @example formatPct(67.3) → "67.3%"
 */
export function formatPct(value: number, decimals = 1): string {
  return `${round(value, decimals).toFixed(decimals)}%`
}
