# Quantyx — High-Density Trading Journal & Performance Analytics

A power-user web terminal for tracking, analyzing, and improving trading performance. Built for speed, precision, and financial data integrity.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v3 (dark-mode terminal) |
| Auth | Clerk |
| Database | Supabase (PostgreSQL + RLS) |
| Server State | TanStack Query v5 |
| Client State | Zustand |
| Unit Tests | Vitest |
| E2E Tests | Playwright |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Copy and fill environment variables
cp .env.example .env

# 3. Start the dev server
npm run dev
```

## Commands

```bash
npm run dev          # Start development server
npm run build        # Build production bundle
npm run typecheck    # TypeScript check (must pass with 0 errors)
npm run test:unit    # Run Vitest unit tests
npm run test:e2e     # Run Playwright E2E tests
npm run lint         # Run ESLint
```

## Documentation

All specs live in `/docs`:

- [`docs/01-PRD-AND-DESIGN-SYSTEM.md`](docs/01-PRD-AND-DESIGN-SYSTEM.md) — Product scope & design tokens
- [`docs/02-ARCHITECTURE-AND-DATAFLOW.md`](docs/02-ARCHITECTURE-AND-DATAFLOW.md) — Folder structure & data flow
- [`docs/03-DATABASE-SCHEMA-AND-RLS.md`](docs/03-DATABASE-SCHEMA-AND-RLS.md) — PostgreSQL schema & RLS policies
- [`docs/04-AGENT-EXECUTION-ROADMAP.md`](docs/04-AGENT-EXECUTION-ROADMAP.md) — Implementation checklist
- [`docs/05-QA-AND-TEST-SUITES.md`](docs/05-QA-AND-TEST-SUITES.md) — Test coverage requirements

## Agent Rules

See [`agents.md`](agents.md) for multi-agent engineering rules and handoff protocol.
