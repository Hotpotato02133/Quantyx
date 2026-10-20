/**
 * src/types/database.ts — Supabase Database schema TypeScript definitions
 * Corresponds to supabase/migrations/0001_init_journal.sql & docs/03-DATABASE-SCHEMA-AND-RLS.md
 */

export interface Database {
  public: {
    Tables: {
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          broker: string | null
          currency: string
          initial_balance: number
          max_daily_drawdown_pct: number | null
          is_archived: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          broker?: string | null
          currency?: string
          initial_balance?: number
          max_daily_drawdown_pct?: number | null
          is_archived?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          broker?: string | null
          currency?: string
          initial_balance?: number
          max_daily_drawdown_pct?: number | null
          is_archived?: boolean
          created_at?: string
        }
      }
      playbooks: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color_hex: string
          rules_checklist: Array<{ id: string; rule: string; required?: boolean }>
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          description?: string | null
          color_hex?: string
          rules_checklist?: Array<{ id: string; rule: string; required?: boolean }>
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color_hex?: string
          rules_checklist?: Array<{ id: string; rule: string; required?: boolean }>
          created_at?: string
        }
      }
      trades: {
        Row: {
          id: string
          user_id: string
          account_id: string
          playbook_id: string | null
          symbol: string
          asset_class: 'CRYPTO' | 'FOREX' | 'EQUITIES' | 'FUTURES' | 'equity' | 'futures' | 'forex' | 'crypto' | 'options'
          side: 'LONG' | 'SHORT' | 'long' | 'short'
          status: 'OPEN' | 'WIN' | 'LOSS' | 'BREAKEVEN' | 'open' | 'closed' | 'cancelled'
          entry_date: string
          exit_date: string | null
          entry_price: number
          exit_price: number | null
          stop_loss: number | null
          take_profit: number | null
          quantity: number
          fees: number
          gross_pnl: number | null
          net_pnl: number | null
          initial_risk: number | null
          r_multiple: number | null
          emotion_tag: string | null
          execution_rating: number | null
          notes: string | null
          screenshot_urls: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          account_id: string
          playbook_id?: string | null
          symbol: string
          asset_class?: 'CRYPTO' | 'FOREX' | 'EQUITIES' | 'FUTURES' | 'equity' | 'futures' | 'forex' | 'crypto' | 'options'
          side: 'LONG' | 'SHORT' | 'long' | 'short'
          status: 'OPEN' | 'WIN' | 'LOSS' | 'BREAKEVEN' | 'open' | 'closed' | 'cancelled'
          entry_date: string
          exit_date?: string | null
          entry_price: number
          exit_price?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          quantity: number
          fees?: number
          gross_pnl?: number | null
          net_pnl?: number | null
          initial_risk?: number | null
          r_multiple?: number | null
          emotion_tag?: string | null
          execution_rating?: number | null
          notes?: string | null
          screenshot_urls?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          account_id?: string
          playbook_id?: string | null
          symbol?: string
          asset_class?: 'CRYPTO' | 'FOREX' | 'EQUITIES' | 'FUTURES' | 'equity' | 'futures' | 'forex' | 'crypto' | 'options'
          side?: 'LONG' | 'SHORT' | 'long' | 'short'
          status?: 'OPEN' | 'WIN' | 'LOSS' | 'BREAKEVEN' | 'open' | 'closed' | 'cancelled'
          entry_date?: string
          exit_date?: string | null
          entry_price?: number
          exit_price?: number | null
          stop_loss?: number | null
          take_profit?: number | null
          quantity?: number
          fees?: number
          gross_pnl?: number | null
          net_pnl?: number | null
          initial_risk?: number | null
          r_multiple?: number | null
          emotion_tag?: string | null
          execution_rating?: number | null
          notes?: string | null
          screenshot_urls?: string[]
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      trade_side: 'LONG' | 'SHORT'
      trade_status: 'OPEN' | 'WIN' | 'LOSS' | 'BREAKEVEN'
      asset_class: 'CRYPTO' | 'FOREX' | 'EQUITIES' | 'FUTURES'
    }
  }
}
