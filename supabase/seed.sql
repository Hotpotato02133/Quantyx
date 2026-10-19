-- Supabase seed data for local development
-- Run via: supabase db reset (applies migrations then seed)

-- NOTE: Replace 'test_user_clerk_id' with your actual Clerk user ID
-- from the Clerk dashboard when testing locally.

-- Example trades for development
INSERT INTO trades (
  user_id, symbol, asset_class, direction, status,
  entry_price, exit_price, stop_price, quantity,
  entry_at, exit_at, pnl, r_multiple, tags, notes
) VALUES
  (
    'test_user_clerk_id', 'AAPL', 'equity', 'long', 'closed',
    178.50, 185.00, 175.00, 100,
    '2024-01-15 09:30:00+00', '2024-01-15 14:22:00+00',
    650.00, 1.86,
    ARRAY['earnings-play', 'breakout'], 'Clean breakout above 178 resistance.'
  ),
  (
    'test_user_clerk_id', 'NQ1!', 'futures', 'short', 'closed',
    17800.00, 17650.00, 17900.00, 2,
    '2024-01-16 09:45:00+00', '2024-01-16 11:30:00+00',
    3000.00, 1.50,
    ARRAY['trend-follow'], 'Failed bounce at VWAP.'
  ),
  (
    'test_user_clerk_id', 'BTCUSDT', 'crypto', 'long', 'open',
    42500.00, NULL, 41000.00, 0.5,
    '2024-01-17 08:00:00+00', NULL,
    NULL, NULL,
    ARRAY['swing'], NULL
  );
