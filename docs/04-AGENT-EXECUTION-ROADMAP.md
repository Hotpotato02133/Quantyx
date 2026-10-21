### File 4: `docs/04-AGENT-EXECUTION-ROADMAP.md`
This is your master execution prompt file. Feed each phase sequentially to your coding agents so they build and verify the application modularly without breaking dependencies.

```markdown
# 04 - Step-by-Step Multi-Agent Implementation Roadmap

## Phase 1: Foundation, Auth & Database Wiring (Agent: Architect / Setup)
**Goal:** Bootstrapped Vite + React + TypeScript project with Clerk Auth and authenticated Supabase client.
- [x] **Step 1.1:** Initialize Vite React-TS app, configure Tailwind CSS v4 with custom color tokens (`#121212`, `#141414`, `#1DB954`, `#FF8C43`), and install ShadCN UI base components (`button`, `dialog`, `dropdown-menu`, `command`, `table`, `sheet`, `badge`, `tabs`).
- [x] **Step 1.2:** Configure `<ClerkProvider>` at root with dark-theme localization and protect `/dashboard/*` routes.
- [x] **Step 1.3:** Create `src/lib/supabase.ts` using `useSession()` from Clerk to inject the bearer token into `@supabase/supabase-js`.
- [x] **Step 1.4:** Build the **Account Switcher** in the top navigation bar allowing users to create their first trading account (e.g., "Main Futures Account - $10,000") and store the active `accountId` in Zustand (`useFilterStore`).

## Phase 2: Financial Math Engine & Trade Ingestion (Agent: Core Logic)
**Goal:** Accurate financial calculation utilities, quick-entry drawer, and CSV batch import.
- [x] **Step 2.1:** Create `src/lib/math.ts` with pure, unit-tested functions:
  - `calculateTradePnL(side, entry, exit, qty, fees)`
  - `calculateRMultiple(netPnl, entry, stopLoss, qty)`
  - `calculatePortfolioMetrics(trades, initialBalance)` -> returns Win Rate, Profit Factor (`grossWins / |grossLosses|`), Expectancy, Max Drawdown %, and Cumulative Equity array.
- [x] **Step 2.2:** Build `<TradeQuickEntrySheet />` triggered via `Cmd+N` or primary CTA. Include auto-calculating live preview badges showing projected Risk %, R-Multiple, and Net PnL as the user types entry, exit, and stop-loss prices.
- [x] **Step 2.3:** Implement client-side image compression (`browser-image-compression` to WebP) and upload to Supabase `trade-screenshots` bucket inside the trade form.
- [x] **Step 2.4:** Build `<CsvImportModal />` using `PapaParse` with a column-mapping step so users can drag-and-drop exported trade history CSVs and bulk-insert them into Supabase.

## Phase 3: High-Density Virtualized Data Grid (Agent: Data Grid Specialist)
**Goal:** A zero-lag table capable of sorting, filtering, and inline editing 10,000+ trade rows.
- [x] **Step 3.1:** Build `<TradeDataGrid />` using `@tanstack/react-table` and `@tanstack/react-virtual`.
- [x] **Step 3.2:** Configure custom cell renderers:
  - **Symbol & Side:** Monospace ticker + colored pill (`LONG` in `#1DB954`/15% opacity, `SHORT` in `#EF4444`/15% opacity).
  - **Net PnL & R-Multiple:** Tabular monospace numbers colored dynamically by sign, respecting global "Privacy Blur Mode".
  - **Playbook & Emotion:** Inline `<Select>` dropdowns that trigger an optimistic `useMutation` update on change without opening a modal.
- [x] **Step 3.3:** Add multi-faceted filter bar (Date Range Picker, Symbol search, Side toggle, Playbook multi-select, Status filter) synced to URL query parameters.
- [x] **Step 3.4:** Add an expandable Row Detail Drawer displaying the trader's Markdown notes, execution checklist score (1–5 stars), and a lightbox carousel for attached chart screenshots.

## Phase 4: Performance Analytics & Charting Bento Grid (Agent: Visualization)
**Goal:** Institutional-grade visual analytics that update instantaneously when filters change.
- [x] **Step 4.1:** Build `<KpiBentoGrid />` featuring 5 top-level metric cards:
  1. Net PnL ($ and % return) with mini sparkline
  2. Win Rate % (Circular progress ring + Wins/Losses/BE count)
  3. Profit Factor (Gauge highlighting > 1.5 as green, 1.0–1.5 as orange `#FF8C43`, < 1.0 as red)
  4. Expectancy per Trade ($ and R)
  5. Current vs. Max Drawdown % (Warning banner if approaching account's `max_daily_drawdown_pct`)
- [x] **Step 4.2:** Integrate TradingView `lightweight-charts` inside `<EquityCurveChart />` with a toggle between **Cumulative Dollar PnL ($)**, **Account Balance ($)**, and **Cumulative R-Multiple (R)**.
- [x] **Step 4.3:** Build `<SetupPerformanceChart />` (horizontal bar chart comparing net PnL and win rate across Playbooks) and `<CalendarHeatmap />` (monthly calendar view coloring each trading day green or red by daily net PnL).

## Phase 5: Power-User UX & Polish (Agent: UI/UX Polish)
**Goal:** Keyboard shortcuts, Command Palette (`Cmd+K`), and export capabilities.
- [ ] **Step 5.1:** Implement `<GlobalCommandPalette />` (`cmdk`) allowing instant navigation, account switching, privacy mode toggling (`Cmd+B`), and filtering by typing `"tag:FOMO"` or `"symbol:BTC"`.
- [ ] **Step 5.2:** Add a "Share Trade Card" generator (`html-to-image`) that renders a sleek, dark-mode summary card of a winning trade (with optional hidden dollar amounts, showing only `%` or `R` gain) ready to share on social media or Discord.