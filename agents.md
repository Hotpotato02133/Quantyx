# AGENTS.md — Master Context & Multi-Agent Engineering Rules

## 1. Project Identity
You are working on **Quantyx**, a High-Density Trading Journal & Performance Analytics web terminal. Every decision must prioritize **sub-50ms UI responsiveness**, **financial calculation precision**, **strict multi-tenant security**, and **power-user keyboard ergonomics**.

## 2. Mandatory Reading Before Coding
Before creating or modifying any file, inspect the relevant specification in `/docs`:
1. `docs/01-PRD-AND-DESIGN-SYSTEM.md` — Product scope, visual tokens, and typography rules.
2. `docs/02-ARCHITECTURE-AND-DATAFLOW.md` — Folder structure, Clerk + Supabase JWT flow, and state management.
3. `docs/03-DATABASE-SCHEMA-AND-RLS.md` — PostgreSQL tables, indexes, and Row-Level Security policies.
4. `docs/04-AGENT-EXECUTION-ROADMAP.md` — Sequential implementation checklist by phase.
5. `docs/05-QA-AND-TEST-SUITES.md` — Required unit and E2E test coverage.

## 3. Non-Negotiable Architecture & Code Standards

### A. Styling & Design System Rules
- **Dark-Mode Only Terminal:**
  - Canvas background: `#121212`
  - Surface / Card / Table Header background: `#141414`
  - Elevated Glassmorphic UI (Modals, Command Palette): `bg-[#1C1C1E]/75 backdrop-blur-md`
  - Hairline Borders: `border-[#262626]` (`1px solid`)
- **Semantic Financial Tokens:**
  - Profit / Long / Positive Edge: `#1DB954` (Emerald Green)
  - Warning / Breakeven / Drawdown Alert: `#FF8C43` (Warm Amber Orange)
  - Loss / Short / Max Drawdown Breach: `#EF4444` (Crimson Red)
- **Tabular Monospace Numbers:** EVERY price, PnL dollar figure, percentage, R-multiple, quantity, and timestamp MUST use monospace typography (`font-mono`) paired with `tabular-nums` so columns align vertically to the decimal point.

### B. Financial Math & Floating-Point Safety
- **Never perform raw inline arithmetic inside JSX components** (e.g., `<td>{trade.exit - trade.entry}</td>` is strictly banned due to IEEE 754 floating-point errors like `0.1 + 0.2 = 0.30000000000000004`).
- All PnL, R-Multiple, Win Rate, Profit Factor, Expectancy, and Drawdown calculations MUST be imported from `src/lib/math.ts`.

### C. State & Data Fetching Rules
- **Server State:** Managed exclusively via TanStack Query v5 (`@tanstack/react-query`). Every mutation (creating, editing, or deleting a trade) must implement **optimistic updates** so the UI updates in under 16ms.
- **Client Filter State:** Managed via Zustand (`src/store/useFilterStore.ts`) and synchronized with URL search params where applicable.
- **Security:** Never bypass Supabase RLS. Never instantiate a Supabase service-role client on the frontend. Always inject the Clerk session token via `window.Clerk.session?.getToken()`.

## 4. Development & Verification Commands
- **Install dependencies:** `npm install`
- **Typecheck (Must pass with 0 errors):** `npm run typecheck` (or `npx tsc --noEmit`)
- **Run Unit Tests (Vitest):** `npm run test:unit` (or `npx vitest run`)
- **Run E2E Tests (Playwright):** `npm run test:e2e`
- **Build Production Bundle:** `npm run build`

## 5. Agent Handoff Protocol
When completing a task from `docs/04-AGENT-EXECUTION-ROADMAP.md`:
1. Run `npx tsc --noEmit` and `npx vitest run` to verify zero regressions.
2. Mark the completed checkbox `[x]` in `docs/04-AGENT-EXECUTION-ROADMAP.md`.
3. Summarize the files created/modified and state the exact next task ID for the subsequent agent.