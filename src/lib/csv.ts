/**
 * src/lib/csv.ts — PapaParse CSV Parser & Trade Mapper (Step 2.4)
 *
 * Provides broker-agnostic auto-detection of column headers and transforms
 * arbitrary CSV trade history exports into typed TradeInsert objects.
 */

import Papa from 'papaparse'
import type { TradeInsert } from '@/types'

export interface ColumnMapping {
  symbol: string
  side: string
  entryPrice: string
  exitPrice: string
  quantity: string
  stopLoss: string
  fees: string
  date: string
  tags: string
  notes: string
}

export const SAMPLE_CSV_CONTENT = `Symbol,Side,EntryPrice,ExitPrice,StopLoss,Qty,Fees,Date,Tags
NQ1!,LONG,20250.50,20380.00,20200.00,2,4.50,2026-10-19T13:30:00Z,Breakout;NYOpen
ES1!,SHORT,5860.25,5842.00,5872.00,3,6.00,2026-10-18T15:00:00Z,VWAPReversal
BTCUSDT,LONG,68100.00,69450.00,67400.00,0.5,2.10,2026-10-17T09:15:00Z,LiquiditySweep
AAPL,LONG,232.10,235.80,230.50,100,1.00,2026-10-16T14:15:00Z,TechContinuation
NVDA,SHORT,142.50,139.20,144.00,80,1.20,2026-10-15T15:30:00Z,EarningsFade`

/**
 * Auto-detects matching CSV column names by common keywords across popular brokers
 * (Tradovate, NinjaTrader, MetaTrader 4/5, Interactive Brokers, Binance, Bybit).
 */
export function autoDetectColumns(headers: string[]): ColumnMapping {
  const findHeader = (keywords: string[]): string => {
    const match = headers.find((h) => {
      const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '')
      return keywords.some((k) => lower.includes(k))
    })
    return match || ''
  }

  return {
    symbol: findHeader(['symbol', 'ticker', 'instrument', 'pair', 'contract', 'item']),
    side: findHeader(['side', 'direction', 'action', 'type', 'buysell', 'order']),
    entryPrice: findHeader(['entryprice', 'entry', 'buyprice', 'openprice', 'open_price', 'price']),
    exitPrice: findHeader(['exitprice', 'exit', 'sellprice', 'closeprice', 'close_price']),
    quantity: findHeader(['qty', 'quantity', 'size', 'contracts', 'shares', 'lots', 'amount', 'volume']),
    stopLoss: findHeader(['stoploss', 'stop', 'sl', 'stop_price']),
    fees: findHeader(['fee', 'fees', 'commission', 'comm']),
    date: findHeader(['date', 'time', 'entrydate', 'opentime', 'open_time', 'datetime', 'timestamp']),
    tags: findHeader(['tags', 'tag', 'strategy', 'playbook', 'setup']),
    notes: findHeader(['notes', 'note', 'comment', 'description']),
  }
}

/**
 * Maps an individual CSV record into a strongly-typed TradeInsert object.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapRowToTrade(row: Record<string, any>, mapping: ColumnMapping, accountId?: string | null, sourceName = 'CSV Import'): TradeInsert {
  const symbol = (mapping.symbol && row[mapping.symbol] ? String(row[mapping.symbol]) : 'TICKER').toUpperCase().trim()
  const sideRaw = mapping.side && row[mapping.side] ? String(row[mapping.side]).toLowerCase() : 'long'
  const direction: 'long' | 'short' = sideRaw.includes('short') || sideRaw.includes('sell') ? 'short' : 'long'

  const entry_price = parseFloat(mapping.entryPrice && row[mapping.entryPrice] ? row[mapping.entryPrice] : '100') || 100
  const exitPriceRaw = mapping.exitPrice && row[mapping.exitPrice] ? parseFloat(row[mapping.exitPrice]) : null
  const exit_price = exitPriceRaw && !isNaN(exitPriceRaw) ? exitPriceRaw : null

  const stopLossRaw = mapping.stopLoss && row[mapping.stopLoss] ? parseFloat(row[mapping.stopLoss]) : null
  const stop_price = stopLossRaw && !isNaN(stopLossRaw) ? stopLossRaw : null

  const quantity = parseFloat(mapping.quantity && row[mapping.quantity] ? row[mapping.quantity] : '1') || 1
  const fees = parseFloat(mapping.fees && row[mapping.fees] ? row[mapping.fees] : '0') || 0

  const dateVal = mapping.date && row[mapping.date] ? String(row[mapping.date]) : new Date().toISOString()
  const validDate = isNaN(new Date(dateVal).getTime()) ? new Date().toISOString() : new Date(dateVal).toISOString()

  const rawTags = mapping.tags && row[mapping.tags] ? String(row[mapping.tags]) : ''
  const tags = rawTags
    ? rawTags
        .split(/[,;]/)
        .map((t) => t.trim())
        .filter(Boolean)
    : ['CsvImport']

  const notes = mapping.notes && row[mapping.notes] ? String(row[mapping.notes]).trim() : `Imported from ${sourceName}`

  return {
    account_id: accountId ?? undefined,
    symbol,
    asset_class: 'futures',
    direction,
    status: exit_price !== null ? 'closed' : 'open',
    entry_price,
    exit_price,
    stop_price,
    target_price: null,
    quantity,
    fees,
    entry_at: validDate,
    exit_at: exit_price !== null ? validDate : null,
    tags,
    notes,
    screenshot_url: null,
  }
}

/**
 * Parses raw CSV string using PapaParse and returns headers, rows, and auto-detected mapping.
 */
export function parseCsvText(csvString: string): Promise<{
  headers: string[]
  data: Record<string, string>[]
  mapping: ColumnMapping
}> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          reject(new Error(results.errors[0].message))
          return
        }

        const headers = results.meta.fields ?? []
        if (headers.length === 0 || results.data.length === 0) {
          reject(new Error('CSV must contain a header row and at least one data row.'))
          return
        }

        const mapping = autoDetectColumns(headers)
        resolve({
          headers,
          data: results.data,
          mapping,
        })
      },
      error: (err: Error) => reject(err),
    })
  })
}
