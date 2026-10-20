# Graph Report - Quantyx  (2026-10-21)

## Corpus Check
- Corpus is ~25,212 words - fits in a single context window. You may not need a graph.

## Summary
- 404 nodes · 854 edges · 26 communities (17 shown, 9 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 9 edges (avg confidence: 0.89)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- UI Primitives & Account Switching
- Trade Ingestion & Supabase Mutations
- App Shell & Page Routing
- Architecture Specs & Core Math
- Package Metadata & Bundler Setup
- Development Tooling & Linters
- Core Runtime Dependencies
- Virtualized Trade Grid & Analytics
- TypeScript Client Configuration
- Flyout Sheet Modal Components
- KPI Bento Grid & Financial Gauges
- TypeScript Node Tooling Config
- Build & Verification Scripts
- Query Client & Root Bootstrap
- Vite & Vitest Tooling Config
- Client Filter & Global UI State
- Playwright E2E Test Suite
- Clerk Authentication Guard
- Vite Environment Typing
- Vitest Test Setup
- Agent Operational Rules
- Terminal Design Tokens
- Multi-Tenant PostgreSQL Accounts

## God Nodes (most connected - your core abstractions)
1. `cn()` - 85 edges
2. `react` - 25 edges
3. `useUiStore` - 25 edges
4. `compilerOptions` - 18 edges
5. `lucide-react` - 17 edges
6. `AccountSwitcher()` - 15 edges
7. `DashboardPage()` - 15 edges
8. `AppShell()` - 13 edges
9. `Trade` - 13 edges
10. `TradeDataGrid()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `public.trades Table & RLS` --shares_data_with--> `Trade`  [INFERRED]
  docs/03-DATABASE-SCHEMA-AND-RLS.md → src/types/index.ts
- `Quantyx High-Density Trading Terminal` --references--> `PRD & Design System`  [EXTRACTED]
  README.md → docs/01-PRD-AND-DESIGN-SYSTEM.md
- `Quantyx High-Density Trading Terminal` --references--> `Serverless Client-Direct Architecture`  [EXTRACTED]
  README.md → docs/02-ARCHITECTURE-AND-DATAFLOW.md
- `Quantyx High-Density Trading Terminal` --references--> `PostgreSQL Schema & RLS`  [EXTRACTED]
  README.md → docs/03-DATABASE-SCHEMA-AND-RLS.md
- `Quantyx High-Density Trading Terminal` --references--> `Multi-Agent Implementation Roadmap`  [EXTRACTED]
  README.md → docs/04-AGENT-EXECUTION-ROADMAP.md

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Financial Math & Invalidation Loop** — src_lib_math, src_hooks_usetrades, src_components_dashboard_kpibentogrid, docs_02_architecture_and_dataflow_calculation_pipeline [INFERRED 0.85]

## Communities (26 total, 9 thin omitted)

### Community 0 - "UI Primitives & Account Switching"
Cohesion: 0.06
Nodes (62): clsx, react, tailwind-merge, @testing-library/react, AccountSwitcher(), getInitialAccounts(), Badge(), BadgeProps (+54 more)

### Community 1 - "Trade Ingestion & Supabase Mutations"
Cohesion: 0.07
Nodes (44): Financial Calculation & Invalidation Pipeline, Clerk to Supabase JWT Auth Flow, @hookform/resolvers, react-hook-form, @supabase/supabase-js, zod, Field(), FormInput() (+36 more)

### Community 2 - "App Shell & Page Routing"
Cohesion: 0.15
Nodes (27): Quantyx Web Shell, lucide-react, react-router-dom, App(), AppShell(), AppShellProps, CommandPalette(), COMMANDS (+19 more)

### Community 3 - "Architecture Specs & Core Math"
Cohesion: 0.11
Nodes (26): PRD & Design System, Serverless Client-Direct Architecture, PostgreSQL Schema & RLS, Multi-Agent Implementation Roadmap, QA & Test Plan (Vitest & Playwright), Quantyx High-Density Trading Terminal, recharts, CalendarHeatmap() (+18 more)

### Community 4 - "Package Metadata & Bundler Setup"
Cohesion: 0.08
Nodes (24): name, private, type, version, autoprefixer, cmdk, eslint, eslint-plugin-react-hooks (+16 more)

### Community 5 - "Development Tooling & Linters"
Cohesion: 0.08
Nodes (24): devDependencies, autoprefixer, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, jsdom, @playwright/test, postcss (+16 more)

### Community 6 - "Core Runtime Dependencies"
Cohesion: 0.09
Nodes (22): dependencies, @clerk/clerk-react, clsx, cmdk, date-fns, @hookform/resolvers, lightweight-charts, lucide-react (+14 more)

### Community 7 - "Virtualized Trade Grid & Analytics"
Cohesion: 0.15
Nodes (19): public.trades Table & RLS, date-fns, @tanstack/react-table, @tanstack/react-virtual, CalendarHeatmapProps, SetupPerformanceChartProps, EquityCurveChartProps, ShareTradeCardModal() (+11 more)

### Community 8 - "TypeScript Client Configuration"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 9 - "Flyout Sheet Modal Components"
Cohesion: 0.15
Nodes (13): SheetClose(), SheetContent(), SheetContentProps, SheetContext, SheetContextValue, SheetDescription(), SheetFooter(), SheetHeader() (+5 more)

### Community 10 - "KPI Bento Grid & Financial Gauges"
Cohesion: 0.36
Nodes (12): EMPTY_STATS, ExpectancyCard(), KpiBentoGrid(), KpiBentoGridProps, KpiCard(), KpiCardProps, MaxDrawdownCard(), NetPnLCard() (+4 more)

### Community 11 - "TypeScript Node Tooling Config"
Cohesion: 0.18
Nodes (10): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit, outDir, skipLibCheck (+2 more)

### Community 12 - "Build & Verification Scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, preview, test:e2e, test:unit, test:unit:coverage (+2 more)

### Community 13 - "Query Client & Root Bootstrap"
Cohesion: 0.28
Nodes (6): react-dom, @tanstack/react-query, @tanstack/react-query-devtools, queryClient, darkAppearance, RootApp()

### Community 14 - "Vite & Vitest Tooling Config"
Cohesion: 0.33
Nodes (3): vite, @vitejs/plugin-react, vitest

### Community 15 - "Client Filter & Global UI State"
Cohesion: 0.29
Nodes (6): zustand, DateRange, defaultFilters, FilterState, TradeDirection, TradeOutcome

### Community 17 - "Clerk Authentication Guard"
Cohesion: 0.50
Nodes (3): @clerk/clerk-react, HAS_CLERK, ProtectedRouteProps

## Knowledge Gaps
- **30 isolated node(s):** `lightweight-charts`, `react-is`, `@tailwindcss/postcss`, `@tailwindcss/vite`, `@testing-library/dom` (+25 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 189 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **9 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `react` connect `UI Primitives & Account Switching` to `Trade Ingestion & Supabase Mutations`, `App Shell & Page Routing`, `Architecture Specs & Core Math`, `Package Metadata & Bundler Setup`, `Virtualized Trade Grid & Analytics`, `Flyout Sheet Modal Components`, `Query Client & Root Bootstrap`, `Clerk Authentication Guard`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **What connects `lightweight-charts`, `react-is`, `@tailwindcss/postcss` to the rest of the system?**
  _30 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `UI Primitives & Account Switching` be split into smaller, more focused modules?**
  _Cohesion score 0.061052631578947365 - nodes in this community are weakly interconnected._
- **Why does `cn()` connect `UI Primitives & Account Switching` to `Trade Ingestion & Supabase Mutations`, `App Shell & Page Routing`, `Architecture Specs & Core Math`, `Virtualized Trade Grid & Analytics`, `Flyout Sheet Modal Components`, `KPI Bento Grid & Financial Gauges`?**
  _High betweenness centrality (0.162) - this node is a cross-community bridge._
- **Should `Trade Ingestion & Supabase Mutations` be split into smaller, more focused modules?**
  _Cohesion score 0.06894049346879536 - nodes in this community are weakly interconnected._
- **Why does `devDependencies` connect `Development Tooling & Linters` to `Package Metadata & Bundler Setup`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Should `App Shell & Page Routing` be split into smaller, more focused modules?**
  _Cohesion score 0.14564564564564564 - nodes in this community are weakly interconnected._