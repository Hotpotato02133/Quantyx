# 01 - Product Requirements Document (PRD) & Design System

## 1. Project Overview
**Product Name:** Quantyx — High-Density Trading Journal & Performance Analytics
**Core Value Proposition:** A lightning-fast, keyboard-first web terminal where retail and proprietary traders log executions, tag playbooks/strategies, attach chart screenshots, and analyze statistical edge (Win Rate, Profit Factor, Expectancy, R-Multiple, and Drawdown) across multiple trading accounts.

## 2. Target Tech Stack
- **Framework:** React 19 + Vite (TypeScript, strict mode)
- **Styling & UI Primitives:** Tailwind CSS v4 + ShadCN UI + Lucide Icons
- **State Management:** 
  - Server State: TanStack Query v5 (`@tanstack/react-query`)
  - Client/UI State: Zustand (active portfolio filter, date range, command palette state)
- **Data Grid & Virtualization:** TanStack Table v8 + TanStack Virtual
- **Charts & Visualizations:** TradingView `lightweight-charts` (Equity Curve & Price Action) + Recharts (Setup Win-Rate Bar Charts, Day-of-Week Heatmaps)
- **Forms & Validation:** React Hook Form + Zod
- **Authentication:** Clerk (`@clerk/clerk-react`) with MFA support
- **Backend & Database:** Supabase (PostgreSQL, Row-Level Security, Storage Buckets for trade screenshots)

## 3. Visual Aesthetic & Design System
- **Theme Philosophy:** Ultra-sleek dark-mode financial terminal with subtle glassmorphism, crisp 1px borders, and high-contrast semantic data tokens.
- **Color Palette (CSS Variables / Tailwind Tokens):**
  - `bg-canvas`: `#121212` (Primary background)
  - `bg-surface`: `#141414` (Cards, sidebar, table headers)
  - `bg-elevated`: `rgba(28, 28, 30, 0.75)` with `backdrop-filter: blur(12px)` (Modals, Command Palette, Floating Toolbars)
  - `border-subtle`: `#262626` (1px solid structural hairlines)
  - `text-primary`: `#F4F4F5`
  - `text-muted`: `#A1A1AA`
  - `accent-profit` (Long / Win / Positive Expectancy): `#1DB954` (Vibrant Emerald Green)
  - `accent-warning` (Drawdown Alert / Breakeven / Risk Warning): `#FF8C43` (Warm Amber Orange)
  - `accent-loss` (Short / Loss / Max Drawdown Breach): `#EF4444` (Crimson Red)
- **Typography:**
  - UI & Headings: `Inter` or `Geist Sans`
  - Financial Figures, Prices, PnL, Timestamps: `JetBrains Mono` or `Geist Mono` with `font-variant-numeric: tabular-nums` (CRITICAL: all numbers in tables and KPI cards must align vertically).

## 4. Core Functional Modules
1. **Multi-Account Switcher:** Users can create and switch between accounts (e.g., "Binance Futures", "FTMO 100k Challenge", "Paper Trading") with independent starting balances and risk rules.
2. **Command Palette (`Cmd+K` / `Ctrl+K`):** Global keyboard launcher to log a new trade, switch accounts, filter by ticker, or toggle privacy mode (blurs dollar amounts for streaming/sharing).
3. **High-Density Trade Log (Data Grid):** Sortable, filterable, inline-editable table with expandable rows for trade notes and screenshot previews.
4. **Analytics & KPI Bento Grid:** Real-time calculation of Net PnL, Win Rate %, Profit Factor, Average R-Multiple, Expectancy per Trade, and Max Drawdown.
5. **Playbook & Tagging Engine:** Categorize trades by setup (e.g., "ICT Silver Bullet", "Break & Retest") and psychological state (e.g., "FOMO", "A+ Execution") to spot behavioral leaks.