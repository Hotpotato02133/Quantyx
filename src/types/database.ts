/**
 * src/types/database.ts — Supabase generated types placeholder
 *
 * This file should be regenerated from the actual schema using:
 *   npx supabase gen types typescript --local > src/types/database.ts
 *
 * Until the schema is finalized, this provides a minimal stub.
 */

export interface Database {
  public: {
    Tables: {
      trades: {
        Row: import('./index').Trade
        Insert: import('./index').TradeInsert
        Update: import('./index').TradeUpdate
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      trade_direction: 'long' | 'short'
      trade_status: 'open' | 'closed' | 'cancelled'
      asset_class: 'equity' | 'futures' | 'forex' | 'crypto' | 'options'
    }
  }
}
