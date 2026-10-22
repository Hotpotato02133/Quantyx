# Graph Report - Quantyx  (2026-10-22)

## Corpus Check
- 117 files · ~61,956 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 5 file(s) not represented in the graph (top: (none) 3, .example 1, .css 1)

## Summary
- 596 nodes · 1561 edges · 30 communities (20 shown, 10 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 12 edges (avg confidence: 0.88)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Dashboard Analytics & Bento Revamp
- Virtualized Trade Table & Execution Charts
- Landing Page & Motion UI Components
- Trade Ingestion & Form Mutations
- App Shell & Role Guard Routing
- Architectural Specs & Database Roadmap
- Package Manifest & Bundler Setup
- Core Runtime Dependencies
- Development Tooling & Linters
- Account Switcher & Modal Primitives
- TypeScript App Configuration
- User Settings & Profile State
- Base UI Primitives
- Slideout Sheet Component
- Dropdown Menu Primitives
- Command Palette Primitives
- Tabs Interface Primitives
- TypeScript Node Tooling Config
- Build & Test Lifecycle Scripts
- React Error Boundary
- Vite & Vitest Tooling Config
- Test Environment Mocking
- Playwright E2E Test Suite
- Vite Environment Typings
- Terminal Dark Mode Tokens
- Multi-Tenant Accounts Schema
- Matte Dark Mode Tokens

## God Nodes (most connected - your core abstractions)
1. `cn()` - 117 edges
2. `react` - 49 edges
3. `useUiStore` - 46 edges
4. `lucide-react` - 38 edges
5. `Trade` - 28 edges
6. `useFilterStore` - 26 edges
7. `AppShell()` - 21 edges
8. `DashboardPage()` - 19 edges
9. `react-router-dom` - 18 edges
10. `CsvImportModal()` - 18 edges

## Surprising Connections (you probably didn't know these)
- `Zero Hyphen Copywriting Policy` --conceptually_related_to--> `HeroSection()`  [INFERRED]
  docs/07-LANDING-PAGE-SPECS.md → src/components/landing/HeroSection.tsx
- `Financial Calculation & Invalidation Pipeline` --conceptually_related_to--> `useTrades()`  [INFERRED]
  docs/02-ARCHITECTURE-AND-DATAFLOW.md → src/hooks/useTrades.ts
- `public.trades Table & RLS` --shares_data_with--> `Trade`  [INFERRED]
  docs/03-DATABASE-SCHEMA-AND-RLS.md → src/types/index.ts
- `Quantyx High-Density Trading Terminal` --references--> `App()`  [EXTRACTED]
  README.md → src/App.tsx
- `Multi-Agent Engineering Rules` --references--> `useFilterStore`  [EXTRACTED]
  agents.md → src/store/useFilterStore.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Financial Calculation & Invalidation Loop** — src_lib_math, src_hooks_usetrades_usetrades, src_components_dashboard_kpibentogrid_kpibentogrid, docs_02_architecture_and_dataflow_calculation_pipeline [INFERRED 0.85]
- **Landing Page Motion UI Pipeline** — src_pages_landingpage_landingpage, src_components_landing_herosection_herosection, src_components_ui_aceternity_spotlight_spotlight, src_components_ui_aceternity_containerscroll_containerscroll, docs_07_landing_page_specs_spec [INFERRED 0.85]
- **Dashboard Bento Analytics & Shell Architecture** — src_pages_dashboardpage_dashboardpage, src_components_dashboard_kpibentogrid_kpibentogrid, src_components_dashboard_equitycurvechart_equitycurvechart, docs_06_dashboard_ui_revamp_spec [INFERRED 0.85]

## Communities (30 total, 10 thin omitted)

### Community 0 - "Dashboard Analytics & Bento Revamp"
Cohesion: 0.07
Nodes (68): Financial Calculation & Invalidation Pipeline, Dashboard & AppShell UI Revamp Specification, cmdk, react-router-dom, @tanstack/react-query, @testing-library/react, vitest, CalendarHeatmap() (+60 more)

### Community 1 - "Virtualized Trade Table & Execution Charts"
Cohesion: 0.06
Nodes (61): public.trades Table & RLS, date-fns, html-to-image, lightweight-charts, lucide-react, recharts, @tanstack/react-table, @tanstack/react-virtual (+53 more)

### Community 2 - "Landing Page & Motion UI Components"
Cohesion: 0.07
Nodes (41): Landing Page & Motion UI Specification, Zero Hyphen Copywriting Policy, framer-motion, react, AnalyticsShowcase(), FeatureBentoGrid(), FAQS, Footer() (+33 more)

### Community 3 - "Trade Ingestion & Form Mutations"
Cohesion: 0.09
Nodes (41): Financial Math & Floating-Point Safety Rule, @hookform/resolvers, papaparse, react-hook-form, zod, CsvImportModalProps, Field(), LivePreview() (+33 more)

### Community 4 - "App Shell & Role Guard Routing"
Cohesion: 0.10
Nodes (27): Quantyx Web Shell, @clerk/clerk-react, react-dom, @tanstack/react-query-devtools, App(), RoleGuard(), RoleGuardProps, HAS_CLERK (+19 more)

### Community 5 - "Architectural Specs & Database Roadmap"
Cohesion: 0.11
Nodes (22): Multi-Agent Engineering Rules, PRD & Design System, Serverless Client-Direct Architecture, Clerk to Supabase JWT Auth Flow, PostgreSQL Schema & RLS, Multi-Agent Implementation Roadmap, QA & Test Plan (Vitest & Playwright), Quantyx High-Density Trading Terminal (+14 more)

### Community 6 - "Package Manifest & Bundler Setup"
Cohesion: 0.08
Nodes (25): name, private, type, version, autoprefixer, clsx, eslint, eslint-plugin-react-hooks (+17 more)

### Community 7 - "Core Runtime Dependencies"
Cohesion: 0.08
Nodes (26): dependencies, browser-image-compression, @clerk/clerk-react, clsx, cmdk, date-fns, framer-motion, @hookform/resolvers (+18 more)

### Community 8 - "Development Tooling & Linters"
Cohesion: 0.08
Nodes (25): devDependencies, autoprefixer, eslint, eslint-plugin-react-hooks, eslint-plugin-react-refresh, jsdom, @playwright/test, postcss (+17 more)

### Community 9 - "Account Switcher & Modal Primitives"
Cohesion: 0.18
Nodes (17): AccountSwitcher(), getInitialAccounts(), Button, Dialog(), DialogClose(), DialogContent(), DialogContentProps, DialogContext (+9 more)

### Community 10 - "TypeScript App Configuration"
Cohesion: 0.10
Nodes (20): compilerOptions, allowImportingTsExtensions, baseUrl, isolatedModules, jsx, lib, module, moduleResolution (+12 more)

### Community 11 - "User Settings & Profile State"
Cohesion: 0.19
Nodes (12): zustand, ClerkProfileContent(), DemoProfileContent(), HAS_CLERK, ProfileTabContent(), SettingsModal(), SettingsTab, Switch() (+4 more)

### Community 12 - "Base UI Primitives"
Cohesion: 0.20
Nodes (11): Badge(), BadgeProps, ButtonProps, Table, TableBody, TableCaption, TableCell, TableFooter (+3 more)

### Community 13 - "Slideout Sheet Component"
Cohesion: 0.15
Nodes (13): SheetClose(), SheetContent(), SheetContentProps, SheetContext, SheetContextValue, SheetDescription(), SheetFooter(), SheetHeader() (+5 more)

### Community 14 - "Dropdown Menu Primitives"
Cohesion: 0.21
Nodes (10): DropdownMenu(), DropdownMenuContent(), DropdownMenuContentProps, DropdownMenuContext, DropdownMenuContextValue, DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuSeparator() (+2 more)

### Community 15 - "Command Palette Primitives"
Cohesion: 0.33
Nodes (10): Command(), CommandDialog(), CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+2 more)

### Community 16 - "Tabs Interface Primitives"
Cohesion: 0.22
Nodes (10): Tabs(), TabsContent, TabsContentProps, TabsContext, TabsContextValue, TabsList, TabsProps, TabsTrigger (+2 more)

### Community 17 - "TypeScript Node Tooling Config"
Cohesion: 0.18
Nodes (10): compilerOptions, allowSyntheticDefaultImports, composite, module, moduleResolution, noEmit, outDir, skipLibCheck (+2 more)

### Community 18 - "Build & Test Lifecycle Scripts"
Cohesion: 0.20
Nodes (10): scripts, build, dev, lint, preview, test:e2e, test:unit, test:unit:coverage (+2 more)

### Community 19 - "React Error Boundary"
Cohesion: 0.22
Nodes (3): ErrorBoundary, Props, State

## Knowledge Gaps
- **31 isolated node(s):** `react-is`, `@tailwindcss/postcss`, `@tailwindcss/vite`, `@testing-library/dom`, `@testing-library/user-event` (+26 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 245 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Command Palette Primitives` to `Dashboard Analytics & Bento Revamp`, `Virtualized Trade Table & Execution Charts`, `Landing Page & Motion UI Components`, `Trade Ingestion & Form Mutations`, `App Shell & Role Guard Routing`, `Account Switcher & Modal Primitives`, `User Settings & Profile State`, `Base UI Primitives`, `Slideout Sheet Component`, `Dropdown Menu Primitives`, `Tabs Interface Primitives`?**
  _High betweenness centrality (0.184) - this node is a cross-community bridge._
- **What connects `react-is`, `@tailwindcss/postcss`, `@tailwindcss/vite` to the rest of the system?**
  _31 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Dashboard Analytics & Bento Revamp` be split into smaller, more focused modules?**
  _Cohesion score 0.06591865357643759 - nodes in this community are weakly interconnected._
- **Why does `react` connect `Landing Page & Motion UI Components` to `Dashboard Analytics & Bento Revamp`, `Virtualized Trade Table & Execution Charts`, `Trade Ingestion & Form Mutations`, `App Shell & Role Guard Routing`, `Architectural Specs & Database Roadmap`, `Package Manifest & Bundler Setup`, `Account Switcher & Modal Primitives`, `User Settings & Profile State`, `Base UI Primitives`, `Slideout Sheet Component`, `Dropdown Menu Primitives`, `Command Palette Primitives`, `Tabs Interface Primitives`, `React Error Boundary`?**
  _High betweenness centrality (0.168) - this node is a cross-community bridge._
- **Should `Virtualized Trade Table & Execution Charts` be split into smaller, more focused modules?**
  _Cohesion score 0.05672926447574335 - nodes in this community are weakly interconnected._
- **Why does `lucide-react` connect `Virtualized Trade Table & Execution Charts` to `Dashboard Analytics & Bento Revamp`, `Landing Page & Motion UI Components`, `Trade Ingestion & Form Mutations`, `App Shell & Role Guard Routing`, `Package Manifest & Bundler Setup`, `Account Switcher & Modal Primitives`, `User Settings & Profile State`, `Slideout Sheet Component`, `Command Palette Primitives`, `React Error Boundary`?**
  _High betweenness centrality (0.091) - this node is a cross-community bridge._
- **Should `Landing Page & Motion UI Components` be split into smaller, more focused modules?**
  _Cohesion score 0.07071887784921099 - nodes in this community are weakly interconnected._