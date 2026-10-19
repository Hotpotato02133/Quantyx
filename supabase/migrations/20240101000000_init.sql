-- Supabase initial migration
-- Apply via: supabase db push

-- Enums
CREATE TYPE trade_direction AS ENUM ('long', 'short');
CREATE TYPE trade_status AS ENUM ('open', 'closed', 'cancelled');
CREATE TYPE asset_class AS ENUM ('equity', 'futures', 'forex', 'crypto', 'options');

-- Trades table
CREATE TABLE trades (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         TEXT NOT NULL,

  symbol          TEXT NOT NULL,
  asset_class     asset_class NOT NULL,
  direction       trade_direction NOT NULL,
  status          trade_status NOT NULL DEFAULT 'open',

  entry_price     NUMERIC(18, 8) NOT NULL,
  exit_price      NUMERIC(18, 8),
  stop_price      NUMERIC(18, 8),
  target_price    NUMERIC(18, 8),
  quantity        NUMERIC(18, 8) NOT NULL,

  entry_at        TIMESTAMPTZ NOT NULL,
  exit_at         TIMESTAMPTZ,

  pnl             NUMERIC(18, 2),
  r_multiple      NUMERIC(8, 2),

  tags            TEXT[] NOT NULL DEFAULT '{}',
  notes           TEXT,
  screenshot_url  TEXT,

  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX trades_user_id_idx  ON trades (user_id);
CREATE INDEX trades_entry_at_idx ON trades (user_id, entry_at DESC);
CREATE INDEX trades_symbol_idx   ON trades (user_id, symbol);
CREATE INDEX trades_status_idx   ON trades (user_id, status);
CREATE INDEX trades_tags_gin_idx ON trades USING GIN (tags);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row-Level Security
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;

CREATE POLICY "trades_select_own"
  ON trades FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "trades_insert_own"
  ON trades FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "trades_update_own"
  ON trades FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "trades_delete_own"
  ON trades FOR DELETE
  USING (auth.uid()::text = user_id);
