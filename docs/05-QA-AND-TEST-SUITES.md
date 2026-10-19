# 05 - Quality Assurance (QA) & Test Plan

## 1. Financial Math Unit Tests (`src/lib/__tests__/math.test.ts` - Vitest)
- **TC-MATH-01 (Long vs. Short PnL):** Verify a `SHORT` trade with Entry `100`, Exit `90`, Qty `2`, Fees `1.50` outputs `gross_pnl = 20.00` and `net_pnl = 18.50`.
- **TC-MATH-02 (Zero Division Safety):** Verify `Profit Factor` returns `Infinity` (formatted as `MAX` in UI) when `grossLosses === 0` and `grossWins > 0`, and `0.00` when no trades exist.
- **TC-MATH-03 (R-Multiple Accuracy):** Verify a trade risking `$100` that nets `-$50` (early manual exit) calculates `r_multiple = -0.50R`.
- **TC-MATH-04 (Peak-to-Trough Max Drawdown):** Given an equity curve of `[10000, 10500, 10200, 9800, 10600]`, verify Max Drawdown calculates from peak `10500` to trough `9800` (`-$700` or `-6.67%`).

## 2. End-to-End (E2E) User Flows (Playwright)
- **TC-E2E-01 (Multi-Tenant Isolation):** Log in as User A, create a trade on `BTCUSDT`. Log out, log in as User B. Verify `BTCUSDT` does not appear in the grid and direct Supabase API queries for User A's trade UUID return `0 rows`.
- **TC-E2E-02 (Optimistic Trade Entry):** Open Quick Entry via `Cmd+N`, submit a winning trade (`+$500`). Verify the table row and Top KPI Net PnL card increment by `$500` within `<100ms` before network settlement.
- **TC-E2E-03 (Filter & Metric Sync):** Filter the table by Playbook `"Breakout"`. Verify that the Equity Curve chart, Win Rate card, and Trade Data Grid all update in lockstep to reflect only `"Breakout"` trades.
- **TC-E2E-04 (Grid Virtualization Performance):** Seed 5,000 mock trades. Scroll rapidly from top to bottom of `<TradeDataGrid />`. Verify DOM node count for `<tr>` remains under 50 at all times and frame rate stays above 55 FPS.