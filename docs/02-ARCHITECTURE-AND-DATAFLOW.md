# 02 - System Architecture & Dataflow

## 1. High-Level Architecture
This application uses a **Serverless Client-Direct Architecture**. There is no custom Node.js middle tier. The React client communicates directly with Supabase PostgREST and Storage APIs. Security is enforced at the database engine layer using **Supabase Row-Level Security (RLS)** verified against **Clerk session tokens**.

### Authentication & Authorization Flow (Clerk -> Supabase)
1. User authenticates via Clerk (`<SignIn />` / OAuth / Passkey).
2. Frontend intercepts Supabase client requests using a custom `accessToken` callback that injects `await window.Clerk.session.getToken()`.
3. Supabase verifies the Clerk JWT signature and extracts `auth.jwt() ->> 'sub'` (which contains the Clerk `user_id`, e.g., `user_2abc123...`).
4. Every PostgreSQL RLS policy checks `(SELECT auth.jwt() ->> 'sub') = user_id` before reading or mutating rows.

## 2. Data Ingestion & Financial Calculation Pipeline
1. **Input Layer:** User submits a trade via the Quick-Entry Drawer (`Cmd+N`) or bulk CSV Importer (Binance/MetaTrader/TradingView CSV format).
2. **Validation Layer:** Zod schema validates numerical constraints (Entry Price > 0, Quantity > 0, Stop Loss logic matches Direction).
3. **Computed Fields (Database Trigger / Generated Columns):**
   - `gross_pnl`: Calculated based on `(exit_price - entry_price) * quantity * multiplier` (inverted for `SHORT`).
   - `net_pnl`: `gross_pnl - fees`.
   - `r_multiple`: `net_pnl / initial_risk_amount` (where initial risk is `|entry_price - stop_loss| * quantity`).
4. **State Invalidation & Optimistic UI:**
   - TanStack Query `useMutation` immediately injects the new trade into the cached table state and recalculates KPI summary cards on the client within <16ms.
   - Once Supabase confirms the insert, background queries (`['trades', accountId]`, `['metrics', accountId]`) revalidate seamlessly.

## 3. Recommended Directory Structure
```text
src/
├── app/                    # Providers (Clerk, TanStack Query, Theme) & Router
├── components/
│   ├── ui/                 # ShadCN primitives (Button, Dialog, Command, Table)
│   ├── layout/             # AppShell, Topbar, AccountSwitcher, CommandPalette
│   ├── dashboard/          # KpiBentoGrid, EquityCurveChart, DrawdownGauge
│   ├── trades/             # TradeDataGrid, TradeQuickEntryModal, CsvImporter
│   └── playbooks/          # SetupCard, PsychologyBreakdownChart
├── hooks/                  # Custom hooks (useSupabaseClient, useTradeMetrics, useHotkeys)
├── lib/
│   ├── supabase.ts         # Clerk-authenticated Supabase singleton
│   ├── math.ts             # Precision financial math utilities (Profit Factor, Drawdown)
│   └── csv-parser.ts       # Broker CSV normalization logic
├── store/                  # Zustand stores (useFilterStore, useUiStore)
└── types/                  # Database TypeScript definitions & Zod schemas