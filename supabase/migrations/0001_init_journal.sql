-- 0001_init_journal.sql
-- Quantyx Trading Journal & Performance Analytics
-- Schema: accounts, playbooks, trades with RLS and Indexes

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PORTFOLIOS / TRADING ACCOUNTS TABLE
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT (auth.jwt() ->> 'sub'),
    name TEXT NOT NULL,
    broker TEXT,
    currency TEXT NOT NULL DEFAULT 'USD',
    initial_balance NUMERIC(18, 4) NOT NULL DEFAULT 10000.0000,
    max_daily_drawdown_pct NUMERIC(5, 2) DEFAULT 5.00,
    is_archived BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PLAYBOOKS / STRATEGIES TABLE
CREATE TABLE IF NOT EXISTS public.playbooks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT (auth.jwt() ->> 'sub'),
    name TEXT NOT NULL,
    description TEXT,
    color_hex TEXT NOT NULL DEFAULT '#1DB954',
    rules_checklist JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. TRADES TABLE
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL DEFAULT (auth.jwt() ->> 'sub'),
    account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
    playbook_id UUID REFERENCES public.playbooks(id) ON DELETE SET NULL,
    
    symbol TEXT NOT NULL,                          -- e.g., 'BTCUSDT', 'AAPL', 'EURUSD'
    asset_class TEXT NOT NULL DEFAULT 'CRYPTO',    -- 'CRYPTO', 'FOREX', 'EQUITIES', 'FUTURES'
    side TEXT NOT NULL CHECK (side IN ('LONG', 'SHORT')),
    status TEXT NOT NULL CHECK (status IN ('OPEN', 'WIN', 'LOSS', 'BREAKEVEN')),
    
    entry_date TIMESTAMPTZ NOT NULL,
    exit_date TIMESTAMPTZ,
    
    entry_price NUMERIC(18, 8) NOT NULL,
    exit_price NUMERIC(18, 8),
    stop_loss NUMERIC(18, 8),
    take_profit NUMERIC(18, 8),
    quantity NUMERIC(18, 8) NOT NULL,
    fees NUMERIC(18, 4) NOT NULL DEFAULT 0.0000,
    
    gross_pnl NUMERIC(18, 4) DEFAULT 0.0000,
    net_pnl NUMERIC(18, 4) DEFAULT 0.0000,
    initial_risk NUMERIC(18, 4),                   -- Dollar risk at entry
    r_multiple NUMERIC(10, 2),                     -- net_pnl / initial_risk
    
    emotion_tag TEXT,                              -- 'CALM', 'FOMO', 'REVENGE', 'HESITANT'
    execution_rating SMALLINT CHECK (execution_rating BETWEEN 1 AND 5),
    notes TEXT,
    screenshot_urls TEXT[] DEFAULT '{}',
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PERFORMANCE INDEXES FOR HIGH-DENSITY FILTERING
CREATE INDEX IF NOT EXISTS idx_trades_user_account_date ON public.trades (user_id, account_id, entry_date DESC);
CREATE INDEX IF NOT EXISTS idx_trades_symbol ON public.trades (user_id, symbol);
CREATE INDEX IF NOT EXISTS idx_trades_playbook ON public.trades (user_id, playbook_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user ON public.accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_playbooks_user ON public.playbooks (user_id);

-- Auto-update updated_at on trades
CREATE OR REPLACE FUNCTION update_trades_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_trades_updated_at ON public.trades;
CREATE TRIGGER trg_trades_updated_at
  BEFORE UPDATE ON public.trades
  FOR EACH ROW EXECUTE FUNCTION update_trades_updated_at();

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.playbooks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'accounts' AND policyname = 'Users can manage their own accounts') THEN
    CREATE POLICY "Users can manage their own accounts" ON public.accounts
      FOR ALL USING ((SELECT auth.jwt() ->> 'sub') = user_id)
      WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'playbooks' AND policyname = 'Users can manage their own playbooks') THEN
    CREATE POLICY "Users can manage their own playbooks" ON public.playbooks
      FOR ALL USING ((SELECT auth.jwt() ->> 'sub') = user_id)
      WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'trades' AND policyname = 'Users can manage their own trades') THEN
    CREATE POLICY "Users can manage their own trades" ON public.trades
      FOR ALL USING ((SELECT auth.jwt() ->> 'sub') = user_id)
      WITH CHECK ((SELECT auth.jwt() ->> 'sub') = user_id);
  END IF;
END $$;
