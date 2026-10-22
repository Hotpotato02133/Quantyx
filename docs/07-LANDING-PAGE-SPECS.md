# 07: Quantyx Landing Page & Motion UI Specification

## 1. Objective & Scope
Build a high converting, institutional grade marketing landing page (`src/pages/LandingPage.tsx` and modular section components in `src/components/landing/`) for **Quantyx**. The design must seamlessly match the newly revamped matte dark mode aesthetic (`#0A0A0A` canvas, `#141414` elevated surfaces, crisp hairline borders, monochrome gradients, and `#1DB954` / `#FF8C43` semantic accents) while leveraging modern animated UI primitives inspired by **Aceternity UI** (`ui.aceternity.com`), **Magic UI** (`magicui.design`), and **Framer Motion** (`motion/react` or `framer-motion`).

### Critical Copywriting Rule (Zero Hyphen Policy)
* **STRICT RULE:** Do NOT use the hyphen, minus, or dash character (`-`, `–`, `—`) anywhere in visible website copy, headings, subheadings, paragraphs, badges, button labels, or footer text.
* Write compound words either as open compounds (`real time`, `multi account`, `high density`, `command palette`, `risk to reward`, `auto sync`, `prop firm`, `win rate`, `data driven`, `one click`) or rephrase cleanly so zero hyphens appear on screen.
* *(Note: Standard CSS/Tailwind class names in code such as `bg-zinc-900` are fine, as they are not visible user facing copy).*

---

## 2. Recommended Dependencies & UI Libraries

Instruct the agent to install or configure the following lightweight packages for Aceternity UI and Magic UI components:

```bash
npm install framer-motion clsx tailwind-merge lucide-react
```

### Core Aceternity UI & Magic UI Primitives to Implement (`src/components/ui/aceternity/`)
1. **`Spotlight.tsx` (Aceternity UI Spotlight):** Subtle SVG radial beam that sweeps across the top left of the Hero canvas on initial load.
2. **`ContainerScroll.tsx` (Aceternity UI 3D Container Scroll):** Tilts the live interactive preview of the Quantyx Dashboard in 3D perspective (`rotateX(20deg) -> rotateX(0deg)`) as the user scrolls down.
3. **`BentoGrid.tsx` & `BentoGridItem.tsx` (Aceternity UI / Magic UI Bento):** Interactive feature cards with mouse tracking radial border glow (`mousemove` spotlight effect) and embedded micro animations.
4. **`MovingBorder.tsx` or `BorderBeam.tsx` (Aceternity / Magic UI):** Animated light beam traveling along the border of the primary CTA button and featured Pro tier card.
5. **`InfiniteMovingCards.tsx` (Aceternity UI Marquee):** Smooth horizontal infinite scroll for supported broker formats and trader testimonials.
6. **`NumberTicker.tsx` (Magic UI):** Spring physics odometer counter for live trading metrics (`tabular-nums`).

---

## 3. Routing & Auth Integration (`src/App.tsx`)

1. **Public Root Route (`/`):** Render `<LandingPage />` at the root path `/`.
2. **Smart Auth Awareness:**
   * If the user is signed out (`<SignedOut>`), clicking primary CTA buttons opens Clerk `<SignUpButton mode="modal">` or navigates to `/sign-up`, while secondary login triggers open `<SignInButton mode="modal">`.
   * If the user is already authenticated (`<SignedIn>`), display a `"Go to Dashboard"` button in the top navigation bar and hero section that routes directly to `/dashboard`.

---

## 4. Section by Section Architecture & Exact Copy

### 4.1 Floating Glass Navbar (`src/components/landing/Navbar.tsx`)
* **Layout:** Fixed top floating pill container (`max-w-5xl mx-auto mt-4 px-5 py-3 rounded-2xl bg-[#121212]/80 backdrop-blur-xl border border-white/[0.08] flex items-center justify-between z-50`).
* **Left:** Quantyx geometric vector icon + `"Quantyx"` (`text-sm font-semibold tracking-tight text-white`).
* **Center Links (`text-xs font-medium text-zinc-400 hover:text-white transition-colors gap-6`):**
  * `Features`
  * `Analytics`
  * `Playbooks`
  * `Pricing`
  * `FAQ`
* **Right Actions:**
  * `"Sign In"` (`text-xs font-medium text-zinc-300 hover:text-white px-3 py-1.5`)
  * `"Start Journaling"` (`bg-white text-black hover:bg-zinc-200 text-xs font-semibold px-4 py-2 rounded-xl transition-all`)

---

### 4.2 Hero Section with Spotlight & 3D Dashboard Preview (`src/components/landing/HeroSection.tsx`)
* **Background Visuals:**
  * Aceternity `<Spotlight className="-top-40 left-0 md:left-60 md:-top-20" fill="white" />`
  * Subtle radial dot matrix background (`bg-[radial-gradient(#ffffff12_1px,transparent_1px)] [background-size:24px_24px]`) masked with a radial gradient fade toward the edges.
* **Top Announcement Pill (Animated Shimmer Badge):**
  * Copy: `"Quantyx 2.0 is live with instant broker CSV sync"`
* **Main Headline (`text-4xl sm:text-6xl lg:text-7xl font-semibold tracking-tight text-center bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-zinc-500 max-w-4xl mx-auto leading-[1.08]`):**
  * Copy: `"Precision trade journaling for relentless market edge"`
* **Subheadline (`text-base sm:text-lg text-zinc-400 text-center max-w-2xl mx-auto mt-6 font-normal leading-relaxed`):**
  * Copy: `"Turn raw executions into institutional analytics. Track your risk multiple, audit your trading psychology, and scale every funded account from one ultra fast workspace."`
* **CTA Row (`flex flex-wrap items-center justify-center gap-4 mt-8`):**
  * **Primary CTA (with Aceternity Moving Border / Shimmer):** `"Launch Your Journal Free"`
  * **Secondary CTA (`bg-[#141414] hover:bg-[#1C1C1C] text-zinc-200 border border-white/[0.08] px-6 py-3 rounded-xl text-sm font-medium`):** `"Explore Live Demo"`
* **3D Scroll Showcase (`ContainerScroll`):**
  * Directly beneath the CTAs, render a high resolution interactive mockup frame of the newly revamped Quantyx Dashboard (showing the 3 KPI cards, the monochrome `"Net PnL over time"` area chart with floating tooltip `"Tue, Feb 17 • Net PnL $28,917"`, and the bottom split analytics cards) wrapped in a glowing border beam container.

---

### 4.3 Broker & Prop Firm Compatibility Strip (`src/components/landing/LogoMarquee.tsx`)
* **Section Label (`text-xs font-medium uppercase tracking-widest text-zinc-500 text-center mb-6`):**
  * Copy: `"Seamless execution imports for modern futures, forex, and equity traders"`
* **Marquee Items (Monochrome zinc badges with subtle icons):**
  * `TradingView` • `MetaTrader 5` • `NinjaTrader` • `Tradovate` • `Interactive Brokers` • `cTrader` • `Thinkorswim` • `Topstep` • `Apex Trader Funding` • `FTMO`

---

### 4.4 Motion Graphic Bento Grid (`src/components/landing/FeatureBentoGrid.tsx`)
Use a 12 column Aceternity Bento Grid (`grid-cols-1 md:grid-cols-12 gap-4 max-w-6xl mx-auto`) where each card has a mouse tracking radial border highlight (`#141414` surface, `border-white/[0.07]`, `rounded-2xl p-6 overflow-hidden`).

* **Section Header:**
  * Eyebrow Badge: `"Engineered for Speed"`
  * Heading: `"Every metric that matters in one unified command center"`
  * Paragraph: `"Built with keyboard first navigation and millisecond state updates so you spend less time logging trades and more time refining your best setups."`

#### Card 1 (`md:col-span-7`): Instant Risk & Expectancy Engine
* **Heading:** `"Automated Risk Multiple and PnL Math"`
* **Body Copy:** `"Log your entry, exit, stop loss, and position size. Quantyx automatically computes gross profit, net return after fees, and exact risk multiple precision across long and short positions."`
* **Embedded Motion Graphic:** Animated live trade ticket where numbers count up using `<NumberTicker />` (`+3.42R`, `$4,280.00 Net Profit`, `68% Win Rate`) with a smooth glowing emerald pill transition.

#### Card 2 (`md:col-span-5`): Command Palette & Keyboard Speed
* **Heading:** `"Zero Friction Keyboard Workflow"`
* **Body Copy:** `"Press Command K to filter by symbol, switch between funded accounts, log a quick execution, or activate privacy blur during live stream sessions."`
* **Embedded Motion Graphic:** Interactive floating `<CommandPalette />` preview with animated keystroke highlights (`⌘K`, `⌘N`, `⌘B`) cycling through actions automatically via Framer Motion.

#### Card 3 (`md:col-span-5`): Playbook & Psychology Auditing
* **Heading:** `"Setup Grading and Emotion Tagging"`
* **Body Copy:** `"Discover which playbook setups generate your highest expectancy and isolate costly emotional leaks like FOMO or early exits before they hurt your drawdown."`
* **Embedded Motion Graphic:** Animated segmented progress bar and 2x2 sub cards cycling between `Status`, `Setups`, and `Psychology` tabs.

#### Card 4 (`md:col-span-7`): Virtualized High Density Data Grid
* **Heading:** `"Ten Thousand Executions with Zero Lag"`
* **Body Copy:** `"Powered by virtualized table rendering and optimistic database mutations. Filter thousands of historical executions by date, direction, setup, or custom tag in under sixteen milliseconds."`
* **Embedded Motion Graphic:** Sleek scrolling micro table rows with `LONG` and `SHORT` semantic badges, tabular monospace figures, and instant privacy blur toggle animation.

---

### 4.5 Interactive Analytics Deep Dive (`src/components/landing/AnalyticsShowcase.tsx`)
A split 2 column showcase with interactive tab switching (`Equity Curve`, `Session Consistency`, `Shareable Trade Cards`).

* **Section Heading:** `"Institutional clarity for every trading session"`
* **Section Subheading:** `"Visualize cumulative account growth, compare performance across London and New York market hours, and export verified execution cards for your trading community."`
* **Interactive Tabs:**
  1. **Tab 1: `"Cumulative Equity Curve"`**
     * Copy: `"Switch effortlessly between dollar return and risk multiple curves with high contrast crosshair inspection."`
  2. **Tab 2: `"Plan Compliance & Sessions"`**
     * Copy: `"Measure rule adherence week over week and spot which market sessions produce your cleanest winners."`
  3. **Tab 3: `"Verified Trade Recap Cards"`**
     * Copy: `"Generate sleek dark mode execution snapshots with one click to share on social media or store in your private review vault."`

---

### 4.6 Live Quantyx by the Numbers Strip (`src/components/landing/MetricsStrip.tsx`)
A 4 column minimalist stat bar (`bg-[#141414] border-y border-white/[0.06] py-12`) using Magic UI `<NumberTicker />`:

1. **`16ms`** — `"Optimistic UI response time"`
2. **`100%`** — `"Row level data isolation"`
3. **`10,000+`** — `"Virtualized rows at 60 FPS"`
4. **`24/7`** — `"Cloud sync across devices"`

---

### 4.7 Transparent Pricing Section (`src/components/landing/PricingSection.tsx`)
2 clean tiers (`Starter` and `Pro Trader`) styled in the `#141414` matte card aesthetic, with an animated Aceternity `BorderBeam` highlighting the `Pro Trader` card.

* **Section Heading:** `"Simple pricing built for serious traders"`
* **Section Subheading:** `"Start journaling on your first account for free and upgrade when you scale across multiple prop firm evaluations."`

| Feature / Aspect | Tier 1: **Core Trader** (`$0 / forever`) | Tier 2: **Pro Quantitative** (`$19 / month`) |
| :--- | :--- | :--- |
| **Summary Copy** | `"Everything you need to build consistent journaling habits on a single trading account."` | `"Unlimited multi account analytics, playbook grading, and bulk CSV automation for funded traders."` |
| **Included Items** | • `"One active trading account"`<br>• `"Up to one hundred logged trades per month"`<br>• `"Core equity curve and win rate metrics"`<br>• `"Command palette and privacy blur mode"`<br>• `"Shareable trade recap cards"` | • `"Unlimited prop firm and personal accounts"`<br>• `"Unlimited trade executions and CSV imports"`<br>• `"Playbook expectancy and psychology analytics"`<br>• `"High resolution chart screenshot storage"`<br>• `"Priority feature access and data export"` |
| **CTA Button** | `"Start Free Forever"` | `"Unlock Pro Analytics"` |

---

### 4.8 Final CTA & Minimalist Footer (`src/components/landing/Footer.tsx`)
* **Final Callout Card:**
  * Container: `max-w-5xl mx-auto rounded-3xl bg-gradient-to-b from-[#181818] to-[#101010] border border-white/[0.08] p-12 text-center relative overflow-hidden`
  * Heading: `"Ready to trade with undeniable data?"`
  * Paragraph: `"Join disciplined traders who use Quantyx to eliminate emotional mistakes and compound their edge every single session."`
  * Button: `"Create Your Free Account"`
* **Footer Bottom Bar (`border-t border-white/[0.06] py-8 mt-16 text-xs text-zinc-500 flex flex-col sm:flex-row items-center justify-between max-w-6xl mx-auto px-6`):**
  * Left: Quantyx Brand Mark + `"© 2026 Quantyx Analytics. Crafted for precision market execution."`
  * Right Links: `Dashboard` • `Trade Journal` • `Analytics` • `Playbooks` • `Privacy` • `Terms`

---

## 5. Step-by-Step Implementation Plan for the Agent

1. **Step 1: Verify & Install Motion Dependencies**
   * Ensure `framer-motion` is installed in `package.json`.
2. **Step 2: Create Aceternity / Magic UI Primitives (`src/components/ui/aceternity/`)**
   * Create `Spotlight.tsx` (SVG radial spotlight entrance animation).
   * Create `ContainerScroll.tsx` (Framer Motion `useScroll` + `useTransform` 3D perspective card wrapper).
   * Create `BorderBeam.tsx` (CSS/Framer Motion perimeter light beam for hero mockup and Pro pricing card).
   * Create `NumberTicker.tsx` (Spring animated monospace counter with `tabular-nums`).
3. **Step 3: Build Modular Landing Page Sections (`src/components/landing/`)**
   * Build `Navbar.tsx`, `HeroSection.tsx`, `LogoMarquee.tsx`, `FeatureBentoGrid.tsx`, `AnalyticsShowcase.tsx`, `PricingSection.tsx`, and `Footer.tsx`.
   * **Audit all text strings** across every component to guarantee zero `-`, `–`, or `—` characters appear in any rendered copy.
4. **Step 4: Assemble `src/pages/LandingPage.tsx` & Wire Routing in `src/App.tsx`**
   * Mount `<LandingPage />` on `/` while preserving `/dashboard`, `/journal`, `/analytics`, and `/playbooks` inside the authenticated `<AppShell />`.
5. **Step 5: Run Verification Checks**
   * Run a regex check on `src/pages/LandingPage.tsx` and `src/components/landing/` text nodes to verify the Zero Hyphen Policy.
   * Run `npm run build` and `npm run test` to confirm zero TypeScript or test errors.