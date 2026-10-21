# 06 — Quantyx Dashboard & AppShell UI Revamp Specification

## 1. Objective & Scope
Revamp the **Quantyx** application shell (`AppShell.tsx`, `Sidebar.tsx`, `Topbar.tsx`) and main dashboard (`DashboardPage.tsx`, `KpiBentoGrid.tsx`, `EquityCurveChart.tsx`, `DashboardCharts.tsx`) to strictly match the ultra-clean, matte dark-mode SaaS dashboard reference design while integrating seamlessly with Quantyx's existing trading domain data (`useTrades`, `useFilterStore`, `calculatePortfolioMetrics`, `useUiStore`).

### Pre-Execution Instructions for the Agent
1. **Analyze First:** Before modifying any files, inspect `src/components/layout/`, `src/components/dashboard/`, `src/pages/DashboardPage.tsx`, `src/lib/math.ts`, and `src/store/`.
2. **Preserve Core Business Logic:** Do NOT remove Clerk auth protection, `useFilterStore` state bindings, Privacy Blur (`Cmd+B` / `isPrivacyMode`), or `useTrades` React Query hooks.
3. **Component Architecture:** Refactor existing components in-place or modularize cleanly so all existing unit and E2E test selectors (`data-testid` attributes) remain intact or are updated consistently.

---

## 2. Visual Language & Design Tokens

The reference design relies on subtle surface elevation, ultra-low-contrast hairline borders, crisp typography, and restrained semantic color accents (green/red badges only where performance deltas appear, while main charts use a sleek monochrome white/silver gradient).

| Token Purpose | Value / Tailwind Class | Usage Details |
| :--- | :--- | :--- |
| **App Background (Canvas)** | `#0A0A0A` (`bg-[#0A0A0A]`) | Outer shell, sidebar background, and main page background. |
| **Card Surface (Primary)** | `#141414` (`bg-[#141414]`) | KPI cards, Equity Curve container, and bottom analytics cards. |
| **Elevated / Inner Surface** | `#1A1A1A` (`bg-[#1A1A1A]`) | Active sidebar nav pill, search trigger input, inner sub-cards, and "What's new" box. |
| **Hairline Border** | `rgba(255,255,255,0.06)` (`border-white/[0.06]`) | All card borders, inner sub-cards, and sidebar divider border. |
| **Hover Border** | `rgba(255,255,255,0.12)` (`hover:border-white/[0.12]`) | Interactive cards and switcher pills. |
| **Text Primary** | `#FAFAFA` (`text-zinc-50`) | Main KPI metrics, active nav item, chart headlines, and active tab label. |
| **Text Secondary** | `#A1A1AA` (`text-zinc-400`) | Card titles, inactive sidebar items, axis labels, and legends. |
| **Text Muted** | `#71717A` (`text-zinc-500`) | Section headers (`Platform`, `System`), delta comparison text (`vs last week`). |
| **Positive Semantic Accent** | `#1DB954` / `#10B981` (`text-emerald-400`) | Upward trend icon pill (`bg-emerald-500/15 text-emerald-400`) & positive inline delta (`+24`). |
| **Negative Semantic Accent** | `#EF4444` / `#F43F5E` (`text-rose-400`) | Downward trend icon pill (`bg-rose-500/15 text-rose-400`) & negative inline delta. |
| **Brand Secondary Accent** | `#FF8C43` (`text-[#FF8C43]`) | Subtle highlights or pro badges where applicable. |
| **Card Radius & Padding** | `rounded-2xl p-6` (`16px` radius, `24px` padding) | Uniform across all dashboard bento cards. |
| **Numeric Typography** | `font-mono tabular-nums tracking-tight` | Mandatory on all prices, PnL values, win rates, R-multiples, and dates. |

---

## 3. Left Sidebar Revamp (`src/components/layout/Sidebar.tsx`)

Refactor `Sidebar.tsx` to match the exact vertical hierarchy and spacing of the reference layout (`w-[260px] shrink-0 bg-[#0A0A0A] border-r border-white/[0.06] flex flex-col justify-between p-4 select-none`):

### 3.1 Top Brand & Collapse Row
* **Left:** Quantyx geometric pixel/vector brand mark (`w-6 h-6 text-white`).
* **Right:** Sidebar panel toggle icon button (`PanelLeft` from `lucide-react`, `w-8 h-8 rounded-lg text-zinc-400 hover:text-white hover:bg-white/[0.05]`).

### 3.2 Command Palette Search Trigger
* Full-width interactive button (`onClick={() => setCommandPaletteOpen(true)}`) styled as a sleek input pill:
  * Classes: `w-full h-9 px-3 rounded-xl bg-[#161616] border border-white/[0.06] flex items-center justify-between text-sm text-zinc-400 hover:border-white/[0.12] transition-colors mt-4 mb-6`
  * Left: `<Search className="w-4 h-4 text-zinc-500 mr-2" />` + `"Search..."`
  * Right: Keyboard shortcut kbd badges (`⌘` `K`) in subtle dark squares (`bg-white/[0.06] px-1.5 py-0.5 rounded text-[11px] font-mono text-zinc-400`).

### 3.3 Navigation Groups
1. **Group 1 Header:** `Platform` (`text-[11px] font-medium text-zinc-500 px-3 mb-2`)
   * **Dashboard** (`/dashboard`, `LayoutGrid` icon) — Active state uses `bg-[#1C1C1C] text-white font-medium rounded-xl px-3 py-2 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)]`.
   * **Trade Journal** (`/journal`, `BookOpen` or `Handshake` icon) — Inactive state uses `text-zinc-400 hover:text-zinc-200 hover:bg-white/[0.03] rounded-xl px-3 py-2`.
   * **Calendar** (`/journal?view=calendar` or scroll/filter trigger, `Calendar` icon).
   * **Analytics & Reports** (`/analytics`, `BarChart2` icon).
   * **Playbooks** (`/playbooks`, `GitBranch` or `Workflow` icon, analogous to "Workflows" in the reference).
2. **Group 2 Header:** `System` (`text-[11px] font-medium text-zinc-500 px-3 mt-6 mb-2`)
   * **Settings** (`Settings` icon on left, `ChevronRight` on right).

### 3.4 Bottom Stack (Changelog Card, Links & Account Switcher)
* **"What's new?" Callout Card:**
  * Container: `bg-[#141414] border border-white/[0.06] rounded-2xl p-4 mb-3`
  * Header: `<Sparkles className="w-3.5 h-3.5 text-zinc-400 inline mr-2" />` + `What's new?` (`text-xs font-medium text-zinc-400 mb-2.5`)
  * Bullet List (`space-y-2 text-xs text-zinc-300`):
    * `• Execution R-Multiple tracking`
    * `• CSV broker auto-sync`
    * `• Full changelog` (`hover:text-white cursor-pointer`)
* **Utility Links:**
  * `Help Center` (`HelpCircle` icon, `text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1.5 flex items-center gap-2`)
  * `Documentation` (`BookOpen` icon, `text-xs text-zinc-400 hover:text-zinc-200 px-2 py-1.5 flex items-center gap-2 mb-2`)
* **Bottom Floating Account Switcher Card (`AccountSwitcher.tsx`):**
  * Styled after the bottom-left `"Customizer"` pill in the reference image:
  * Container: `w-full bg-[#141414] hover:bg-[#1A1A1A] border border-white/[0.08] rounded-xl p-2.5 flex items-center justify-between transition-colors cursor-pointer`
  * Left: Swatch/Account icon (`Wallet` or `Layers` in a `w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center`), Title (`Active Account Name`, e.g., `Apex 50k Eval`, `text-xs font-semibold text-white`), Subtitle (`Prop Firm • USD`, `text-[11px] text-zinc-500`).
  * Right: Shortcut badge or `ChevronsUpDown` (`w-4 h-4 text-zinc-500`).

---

## 4. Main Dashboard Layout & Header (`src/pages/DashboardPage.tsx`)

Remove heavy topbars or cluttered filter banners so the main canvas flows cleanly like the reference:

* **Page Container:** `flex-1 overflow-y-auto bg-[#0A0A0A] px-8 py-6`
* **Header Row:**
  * Left: `h1` with text `"Dashboard"` (`text-lg font-medium text-zinc-100 tracking-tight`).
  * Right: Minimal quick actions (Privacy Mode toggle icon `Cmd+B`, Date Range pill, and `+ Log Trade` subtle button).
* **Grid Architecture:**
  1. **Row 1 (Top KPI Row):** `grid grid-cols-1 md:grid-cols-3 gap-4 mt-5`
  2. **Row 2 (Hero Chart Row):** `mt-4` full-width single card (`EquityCurveChart`)
  3. **Row 3 (Bottom Split Analytics Row):** `grid grid-cols-1 lg:grid-cols-12 gap-4 mt-4` (Left Card: `lg:col-span-7`, Right Card: `lg:col-span-5`)

---

## 5. Component Specifications

### 5.1 Row 1: 3-Column KPI Metric Cards (`src/components/dashboard/KpiBentoGrid.tsx`)
Match the exact 3-card layout from the reference (`Leads`, `Conversion Rate`, `CLV`) mapped to Quantyx trading metrics:

* **Card Container:** `bg-[#141414] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between h-[132px]`
* **Top Row inside Card:**
  * Left: Metric Label (`text-xs font-medium text-zinc-400 flex items-center gap-1.5`). Include an `<Info className="w-3.5 h-3.5 text-zinc-500" />` tooltip icon on the 3rd card.
  * Right: Trend Pill Badge:
    * Positive: `<span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-emerald-400"><ArrowUpCircle className="w-3.5 h-3.5 fill-emerald-500/20 text-emerald-400" /> 8.0%</span>`
    * Negative: `<span className="inline-flex items-center gap-1 text-xs font-mono font-medium text-rose-400"><ArrowDownCircle className="w-3.5 h-3.5 fill-rose-500/20 text-rose-400" /> 4.0%</span>`
* **Bottom Row inside Card (Baseline-aligned Value + Inline Comparison):**
  * Primary Value: `text-3xl font-semibold text-white font-mono tabular-nums tracking-tight`
  * Inline Sub-label (immediately to the right, `ml-2 text-xs font-mono`):
    * Highlighted delta in emerald (`text-emerald-400`) or rose (`text-rose-400`), followed by muted period text (`text-zinc-500`), e.g.: `<span className="text-emerald-400">+24</span> <span className="text-zinc-500">vs last week</span>`

**Data Mapping for the 3 Cards:**
1. **Card 1 — Total Trades (or Logged Executions):**
   * Title: `Total Trades`
   * Primary Value: `{metrics.totalTrades}` (e.g., `129`)
   * Inline Delta: `+{weeklyTradeDelta} vs last week`
   * Top-Right Badge: Percentage change in trade count.
2. **Card 2 — Win Rate (analogous to Conversion Rate):**
   * Title: `Win Rate`
   * Primary Value: `{Math.round(metrics.winRate)}%` (e.g., `64%`)
   * Inline Delta: `+{winRateDelta}% vs last week`
   * Top-Right Badge: Win rate percentage delta.
3. **Card 3 — Profit Factor / Expectancy (with Info TooltipIcon, analogous to CLV):**
   * Title: `Profit Factor` (with `<Info />` icon)
   * Primary Value: `{metrics.profitFactor.toFixed(2)}R` (or average hold time / expectancy)
   * Inline Delta: `+{pfDelta} vs last week`
   * Top-Right Badge: Delta percentage.

---

### 5.2 Row 2: Hero Monochrome Area Chart (`src/components/dashboard/EquityCurveChart.tsx`)
Match the `"Revenue over time"` hero chart from the reference image:

* **Card Container:** `bg-[#141414] border border-white/[0.06] rounded-2xl p-6`
* **Header Section:**
  * Top-Left Title: `Net PnL over time` (or `Cumulative Equity`) in `text-xs font-medium text-zinc-400 flex items-center gap-1.5` with `<Info className="w-3.5 h-3.5 text-zinc-500" />`.
  * Top-Left Headline Value: Formatted total Net PnL (e.g., `$30,240`) in `text-2xl font-semibold text-white font-mono tabular-nums mt-1` (respecting `isPrivacyMode` blur when active).
  * Top-Right Trend Badge + Unit Toggle:
    * Trend badge: `<ArrowUpCircle /> 7.5% vs last month` in `text-xs text-emerald-400`.
    * Optional subtle pill switch (`$` / `R`) tucked cleanly beside it.
* **Chart Visual Styling:**
  * **Line Stroke:** Crisp white/silver stroke (`#FFFFFF` or `#E4E4E7`, `strokeWidth: 2`).
  * **Area Gradient Fill:** Vertical linear gradient from `rgba(255, 255, 255, 0.14)` at the top to `rgba(255, 255, 255, 0.0)` at the baseline.
  * **Grid Lines:** Horizontal dashed/hairline grid lines only (`rgba(255, 255, 255, 0.05)`), no vertical grid lines.
  * **Y-Axis:** Left-aligned labels (`0`, `10k`, `20k`, `30k`, `40k`) in `text-[11px] font-mono text-zinc-500`.
  * **X-Axis & Active Date Pill:** Bottom date labels (`Feb 14`, `Feb 17`, `Feb 20`, etc.) in `text-[11px] font-mono text-zinc-500`. When hovering a data point, highlight the active date on the X-axis with a high-contrast white pill badge (`bg-white text-black font-semibold px-3 py-1 rounded-full text-xs`) and draw a vertical white crosshair line (`rgba(255,255,255,0.4)`).
  * **Floating Dark Glass Tooltip:**
    * Styled exactly like the reference tooltip:
    * Date header above (`Tue, Feb 17` in `text-xs text-zinc-300 mb-1`).
    * Dark pill container (`bg-[#0A0A0A]/95 border border-white/[0.1] rounded-xl px-3.5 py-2 shadow-2xl flex items-center gap-2.5`):
      * White dot indicator (`w-2 h-2 rounded-full bg-white`)
      * Label (`Net PnL` in `text-xs text-zinc-400`)
      * Value (`$28,917` in `text-xs font-mono font-semibold text-white`)

---

### 5.3 Row 3 (Left, 7 Cols): Trade & Playbook Management Card (`src/components/dashboard/DashboardCharts.tsx`)
Modeled directly after the `"Leads Management"` card in the bottom-left of the reference:

* **Card Container:** `lg:col-span-7 bg-[#141414] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between`
* **Card Title:** `Trade Execution & Setups` (`text-xs font-medium text-zinc-400 mb-4`)
* **Underline Tab Bar:**
  * 3 Tabs: **`Status`** (Wins / Losses / Breakeven), **`Setups`** (Playbook tags), **`Psychology`** (Emotion tags).
  * Active Tab: `text-xs font-medium text-white border-b-2 border-white pb-2.5`
  * Inactive Tab: `text-xs font-medium text-zinc-500 hover:text-zinc-300 pb-2.5`
* **Segmented Multi-Bar Progress Indicator:**
  * Directly below the tabs, render a horizontal 3-segment progress bar (`flex gap-2 w-full my-5`):
    * Segment 1 (Primary/Winners): `h-1.5 rounded-full bg-zinc-400` (width proportional to share)
    * Segment 2 (Secondary/Breakeven): `h-1.5 rounded-full bg-zinc-600`
    * Segment 3 (Tertiary/Highlight): `h-1.5 rounded-full bg-white`
* **2x2 Sub-Card Grid (`grid grid-cols-2 gap-3`):**
  * Each sub-card (`bg-[#181818] border border-white/[0.06] rounded-xl p-4`) features:
    * Top mini pill indicator (`w-4 h-1 rounded-full bg-zinc-500 mb-3`)
    * Category Label (`text-xs text-zinc-400`, e.g., `Winning Trades`, `Losing Trades`, `A+ Playbook`, `Rule Violated`)
    * Bottom Value (`text-xl font-mono font-semibold text-white mt-1`, e.g., `114` followed by `trades` in `text-xs font-sans font-normal text-zinc-500`).

---

### 5.4 Row 3 (Right, 5 Cols): Discipline / Win Consistency Grouped Bar Chart (`src/components/dashboard/DashboardCharts.tsx`)
Modeled directly after the `"Retention Rate"` card in the bottom-right of the reference:

* **Card Container:** `lg:col-span-5 bg-[#141414] border border-white/[0.06] rounded-2xl p-6 flex flex-col justify-between`
* **Header Row:**
  * Left: `Plan Compliance Rate` (or `Win Rate Consistency`) in `text-xs font-medium text-zinc-400`.
  * Right: Three-dot action menu button (`MoreVertical` icon, `w-4 h-4 text-zinc-500 hover:text-zinc-300`).
* **Headline Metric & Legend:**
  * Value: `{complianceRate}%` (e.g., `95%`) in `text-3xl font-semibold text-white font-mono tabular-nums` + inline delta `<span className="text-xs font-mono text-emerald-400 ml-1.5">+12%</span> <span className="text-xs text-zinc-500">vs last month</span>`.
  * Horizontal Legend (`flex items-center gap-4 mt-3 text-[11px] text-zinc-400`):
    * `<span className="w-2 h-2 rounded-[2px] bg-zinc-600 inline-block mr-1.5" /> London Session` (or `Longs`)
    * `<span className="w-2 h-2 rounded-[2px] bg-white inline-block mr-1.5" /> NY Session` (or `Shorts`)
    * `<span className="w-2 h-2 rounded-[2px] bg-zinc-400 inline-block mr-1.5" /> Asia Session` (or `Breakouts`)
* **Grouped Vertical Thin-Bar Chart:**
  * Render 6–7 time buckets across the bottom (`flex items-end justify-between h-36 pt-6 gap-3 border-b border-white/[0.06]`):
  * Each bucket contains 3 slim vertical bars (`w-1.5 rounded-t-sm`) in the 3 monochrome tones (`bg-zinc-600`, `bg-white`, `bg-zinc-500`) with heights scaled to each session/setup's performance percentage.

---

## 6. Step-by-Step Implementation Plan for the Agent

1. **Step 1 — Update Theme & CSS Utilities (`src/index.css` & `tailwind.config.ts`):**
   * Verify `#0A0A0A` canvas background and `#141414` card surface tokens are applied cleanly.
2. **Step 2 — Refactor `Sidebar.tsx`, `AccountSwitcher.tsx`, and `AppShell.tsx`:**
   * Implement the exact left sidebar layout: Brand + collapse button, `Search... ⌘K` trigger, `Platform` & `System` nav groups, `"What's new?"` card, `Help Center` / `Documentation` links, and the bottom `AccountSwitcher` pill card.
3. **Step 3 — Rebuild `KpiBentoGrid.tsx`:**
   * Replace the previous 5-card grid with the streamlined 3-card header row matching the reference (`Total Trades`, `Win Rate`, `Profit Factor`), complete with top-right circular arrow delta badges and baseline-aligned `vs last week` comparisons.
4. **Step 4 — Restyle `EquityCurveChart.tsx`:**
   * Implement the monochrome white line + subtle white vertical gradient fill, top-left headline PnL metric, floating dark pill tooltip (`Tue, Feb 17 • Net PnL $28,917`), and highlighted white X-axis date pill on hover.
5. **Step 5 — Build the Bottom Split Analytics Row in `DashboardCharts.tsx`:**
   * Left (7 cols): `Trade Execution & Setups` card with `Status | Setups | Psychology` tabs, 3-segment progress bar, and 2x2 sub-cards.
   * Right (5 cols): `Plan Compliance Rate` card with headline percentage, 3-item monochrome square legend, and grouped slim vertical bar chart.
6. **Step 6 — Verify Responsiveness & Tests:**
   * Run `npm run build` and `npm run test` to confirm zero TypeScript or Vitest regressions.