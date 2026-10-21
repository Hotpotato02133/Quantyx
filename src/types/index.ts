/**
 * src/types/index.ts — Shared TypeScript types for Quantyx
 *
 * These are the application-level types that mirror the Supabase DB schema.
 * Keep in sync with docs/03-DATABASE-SCHEMA-AND-RLS.md.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TradeDirection = 'long' | 'short' | 'LONG' | 'SHORT'
export type TradeStatus =
  | 'open'
  | 'closed'
  | 'cancelled'
  | 'OPEN'
  | 'WIN'
  | 'LOSS'
  | 'BREAKEVEN'
export type AssetClass =
  | 'equity'
  | 'futures'
  | 'forex'
  | 'crypto'
  | 'options'
  | 'CRYPTO'
  | 'FOREX'
  | 'EQUITIES'
  | 'FUTURES'

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface TradingAccount {
  id: string
  user_id?: string
  name: string
  broker: string
  currency: string
  initial_balance: number
  current_balance: number
  max_daily_drawdown_pct: number
  is_archived: boolean
  created_at: string
}

export interface PlaybookRule {
  id: string
  rule: string
  required?: boolean
}

export interface Playbook {
  id: string
  user_id?: string
  name: string
  description: string | null
  color_hex: string
  rules_checklist: PlaybookRule[]
  created_at: string
}

export interface Trade {
  id: string
  user_id: string           // Clerk user ID — must match auth.uid() in RLS
  account_id?: string       // Foreign key to TradingAccount
  playbook_id?: string | null // Foreign key to Playbook
  symbol: string            // e.g. "AAPL", "NQ1!", "BTCUSDT"
  asset_class: AssetClass
  direction: 'long' | 'short'
  status: TradeStatus

  // Position details
  entry_price: number
  exit_price: number | null
  stop_price: number | null
  target_price: number | null
  quantity: number
  fees?: number

  // Timestamps
  entry_at: string          // ISO 8601
  exit_at: string | null    // ISO 8601

  // Computed (stored for fast queries — must match src/lib/math.ts output)
  pnl: number | null
  gross_pnl?: number | null
  net_pnl?: number | null
  initial_risk?: number | null
  r_multiple: number | null

  // Metadata
  tags: string[]
  emotion_tag?: string | null
  execution_rating?: number | null
  notes: string | null
  screenshot_url: string | null
  screenshot_urls?: string[]

  created_at: string
  updated_at: string
}

export type TradeInsert = Omit<
  Trade,
  'id' | 'user_id' | 'pnl' | 'r_multiple' | 'created_at' | 'updated_at'
>

export type TradeUpdate = Partial<TradeInsert>

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface TradeStats {
  totalTrades: number
  winsCount?: number
  lossesCount?: number
  breakevenCount?: number
  winRate: number           // 0–100
  profitFactor: number
  expectancy: number        // $ per trade
  rExpectancy?: number | null // R per trade
  totalPnL: number
  pnlPct?: number           // Total return % on account
  maxDrawdown: number
  maxDrawdownPct: number
  currentDrawdownPct?: number
  maxDailyDrawdownPct?: number
  avgWin: number
  avgLoss: number
  bestTrade: number
  worstTrade: number
  avgRMultiple: number | null
  sparklineData?: number[]
}


// ─── Filter / Query ────────────────────────────────────────────────────────────

export interface TradeFilters {
  accountId?: string | null
  direction?: TradeDirection | 'all'
  status?: TradeStatus | 'all'
  symbol?: string
  dateFrom?: string
  dateTo?: string
  tags?: string[]
}

// ─── Database type placeholder ─────────────────────────────────────────────────
export type { Database } from './database'
