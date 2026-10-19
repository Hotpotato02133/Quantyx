/**
 * src/types/index.ts — Shared TypeScript types for Quantyx
 *
 * These are the application-level types that mirror the Supabase DB schema.
 * Keep in sync with docs/03-DATABASE-SCHEMA-AND-RLS.md.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

export type TradeDirection = 'long' | 'short'
export type TradeStatus = 'open' | 'closed' | 'cancelled'
export type AssetClass = 'equity' | 'futures' | 'forex' | 'crypto' | 'options'

// ─── Core Entities ────────────────────────────────────────────────────────────

export interface Trade {
  id: string
  user_id: string           // Clerk user ID — must match auth.uid() in RLS
  symbol: string            // e.g. "AAPL", "NQ1!", "BTCUSDT"
  asset_class: AssetClass
  direction: TradeDirection
  status: TradeStatus

  // Position details
  entry_price: number
  exit_price: number | null
  stop_price: number | null
  target_price: number | null
  quantity: number

  // Timestamps
  entry_at: string          // ISO 8601
  exit_at: string | null    // ISO 8601

  // Computed (stored for fast queries — must match src/lib/math.ts output)
  pnl: number | null
  r_multiple: number | null

  // Metadata
  tags: string[]
  notes: string | null
  screenshot_url: string | null

  created_at: string
  updated_at: string
}

export interface TradeInsert
  extends Omit<
    Trade,
    | 'id'
    | 'user_id'
    | 'pnl'
    | 'r_multiple'
    | 'created_at'
    | 'updated_at'
  > {}

export interface TradeUpdate extends Partial<TradeInsert> {}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface TradeStats {
  totalTrades: number
  winRate: number           // 0–100
  profitFactor: number
  expectancy: number        // $ per trade
  totalPnL: number
  maxDrawdown: number
  maxDrawdownPct: number
  avgWin: number
  avgLoss: number
  bestTrade: number
  worstTrade: number
  avgRMultiple: number | null
}

// ─── Filter / Query ────────────────────────────────────────────────────────────

export interface TradeFilters {
  direction?: TradeDirection | 'all'
  status?: TradeStatus | 'all'
  symbol?: string
  dateFrom?: string
  dateTo?: string
  tags?: string[]
}

// ─── Database type placeholder ─────────────────────────────────────────────────
// Generated from Supabase CLI: `supabase gen types typescript --local > src/types/database.ts`
// This file is a placeholder until the schema is finalized.
export type { Database } from './database'
