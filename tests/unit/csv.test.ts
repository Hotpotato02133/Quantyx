import { describe, it, expect } from 'vitest'
import {
  autoDetectColumns,
  mapRowToTrade,
  parseCsvText,
  SAMPLE_CSV_CONTENT,
} from '@/lib/csv'

describe('CSV Ingestion & Column Auto-Detection (Step 2.4)', () => {
  it('correctly maps Tradovate/NinjaTrader style headers', () => {
    const headers = [
      'Instrument',
      'Action',
      'Open Price',
      'Close Price',
      'Size',
      'Stop Price',
      'Commission',
      'Open Time',
      'Strategy',
    ]

    const mapping = autoDetectColumns(headers)

    expect(mapping.symbol).toBe('Instrument')
    expect(mapping.side).toBe('Action')
    expect(mapping.entryPrice).toBe('Open Price')
    expect(mapping.exitPrice).toBe('Close Price')
    expect(mapping.quantity).toBe('Size')
    expect(mapping.stopLoss).toBe('Stop Price')
    expect(mapping.fees).toBe('Commission')
    expect(mapping.date).toBe('Open Time')
    expect(mapping.tags).toBe('Strategy')
  })

  it('correctly maps MetaTrader style headers', () => {
    const headers = [
      'Item',
      'Type',
      'Open_Price',
      'Close_Price',
      'Lots',
      'SL',
      'Commission',
      'Timestamp',
      'Comment',
    ]

    const mapping = autoDetectColumns(headers)

    expect(mapping.symbol).toBe('Item')
    expect(mapping.side).toBe('Type')
    expect(mapping.entryPrice).toBe('Open_Price')
    expect(mapping.exitPrice).toBe('Close_Price')
    expect(mapping.quantity).toBe('Lots')
    expect(mapping.stopLoss).toBe('SL')
    expect(mapping.fees).toBe('Commission')
    expect(mapping.date).toBe('Timestamp')
    expect(mapping.notes).toBe('Comment')
  })

  it('correctly maps Crypto / Binance style headers', () => {
    const headers = [
      'Pair',
      'Side',
      'Price',
      'Amount',
      'Fee',
      'DateTime',
    ]

    const mapping = autoDetectColumns(headers)

    expect(mapping.symbol).toBe('Pair')
    expect(mapping.side).toBe('Side')
    expect(mapping.entryPrice).toBe('Price')
    expect(mapping.quantity).toBe('Amount')
    expect(mapping.fees).toBe('Fee')
    expect(mapping.date).toBe('DateTime')
  })
})

describe('mapRowToTrade()', () => {
  const mapping = {
    symbol: 'Symbol',
    side: 'Side',
    entryPrice: 'Entry',
    exitPrice: 'Exit',
    quantity: 'Qty',
    stopLoss: 'SL',
    fees: 'Commission',
    date: 'Date',
    tags: 'Tags',
    notes: 'Notes',
  }

  it('maps a closed LONG trade correctly', () => {
    const row = {
      Symbol: 'ES',
      Side: 'Buy',
      Entry: '5850.50',
      Exit: '5870.00',
      Qty: '2',
      SL: '5840.00',
      Commission: '4.50',
      Date: '2026-10-15T14:30:00Z',
      Tags: 'Breakout; OpeningRange',
      Notes: 'Clean trend day',
    }

    const trade = mapRowToTrade(row, mapping, 'acc-123', 'trades.csv')

    expect(trade.account_id).toBe('acc-123')
    expect(trade.symbol).toBe('ES')
    expect(trade.direction).toBe('long')
    expect(trade.status).toBe('closed')
    expect(trade.entry_price).toBe(5850.5)
    expect(trade.exit_price).toBe(5870)
    expect(trade.stop_price).toBe(5840)
    expect(trade.quantity).toBe(2)
    expect(trade.fees).toBe(4.5)
    expect(trade.tags).toEqual(['Breakout', 'OpeningRange'])
    expect(trade.notes).toBe('Clean trend day')
  })

  it('maps a SHORT trade with sell action', () => {
    const row = {
      Symbol: 'NQ',
      Side: 'Sell Short',
      Entry: '20500',
      Exit: '20420',
      Qty: '1',
      SL: '20550',
      Commission: '2.50',
    }

    const trade = mapRowToTrade(row, mapping, null, 'export.csv')

    expect(trade.direction).toBe('short')
    expect(trade.symbol).toBe('NQ')
    expect(trade.status).toBe('closed')
    expect(trade.entry_price).toBe(20500)
    expect(trade.exit_price).toBe(20420)
  })

  it('marks trade as open when exit price is omitted', () => {
    const row = {
      Symbol: 'BTCUSDT',
      Side: 'LONG',
      Entry: '68000',
      Exit: '',
      Qty: '0.5',
    }

    const trade = mapRowToTrade(row, mapping, 'acc-crypto', 'crypto.csv')

    expect(trade.status).toBe('open')
    expect(trade.exit_price).toBeNull()
    expect(trade.exit_at).toBeNull()
  })
})

describe('parseCsvText()', () => {
  it('parses sample CSV data and auto-detects columns', async () => {
    const result = await parseCsvText(SAMPLE_CSV_CONTENT)

    expect(result.headers).toContain('Symbol')
    expect(result.headers).toContain('Side')
    expect(result.headers).toContain('EntryPrice')
    expect(result.headers).toContain('ExitPrice')
    expect(result.data.length).toBe(5)
    expect(result.mapping.symbol).toBe('Symbol')
    expect(result.mapping.entryPrice).toBe('EntryPrice')
  })

  it('rejects empty CSV content', async () => {
    await expect(parseCsvText('')).rejects.toThrow()
  })
})
