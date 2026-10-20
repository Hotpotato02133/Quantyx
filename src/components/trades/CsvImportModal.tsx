import React, { useState, useRef } from 'react'
import Papa from 'papaparse'
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  ArrowLeft,
  FileText,
  SlidersHorizontal,
} from 'lucide-react'
import { useCreateTrade } from '@/hooks/useTrades'
import { useFilterStore } from '@/store/useFilterStore'
import { calculateTradePnL, calculateRMultiple } from '@/lib/math'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'
import type { TradeInsert } from '@/types'

interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ColumnMapping {
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

const SAMPLE_CSV_CONTENT = `Symbol,Side,EntryPrice,ExitPrice,StopLoss,Qty,Fees,Date,Tags
NQ1!,LONG,20250.50,20380.00,20200.00,2,4.50,2026-10-19T13:30:00Z,Breakout;NYOpen
ES1!,SHORT,5860.25,5842.00,5872.00,3,6.00,2026-10-18T15:00:00Z,VWAPReversal
BTCUSDT,LONG,68100.00,69450.00,67400.00,0.5,2.10,2026-10-17T09:15:00Z,LiquiditySweep
AAPL,LONG,232.10,235.80,230.50,100,1.00,2026-10-16T14:15:00Z,TechContinuation
NVDA,SHORT,142.50,139.20,144.00,80,1.20,2026-10-15T15:30:00Z,EarningsFade`

export function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const { accountId } = useFilterStore()
  const createTradeMutation = useCreateTrade()

  const [step, setStep] = useState<'upload' | 'mapping' | 'preview'>('upload')
  const [fileName, setFileName] = useState('')
  const [rawHeaders, setRawHeaders] = useState<string[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [rawData, setRawData] = useState<Record<string, any>[]>([])
  const [mapping, setMapping] = useState<ColumnMapping>({
    symbol: '',
    side: '',
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    stopLoss: '',
    fees: '',
    date: '',
    tags: '',
    notes: '',
  })

  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [importCount, setImportCount] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const resetState = () => {
    setStep('upload')
    setFileName('')
    setRawHeaders([])
    setRawData([])
    setError(null)
    setIsSuccess(false)
    setIsSubmitting(false)
    setImportCount(0)
  }

  const handleClose = () => {
    resetState()
    onClose()
  }

  // Auto-detect matching CSV column names by keywords
  const autoDetectColumns = (headers: string[]): ColumnMapping => {
    const findHeader = (keywords: string[]): string => {
      const match = headers.find((h) => {
        const lower = h.toLowerCase().replace(/[^a-z0-9]/g, '')
        return keywords.some((k) => lower.includes(k))
      })
      return match || ''
    }

    return {
      symbol: findHeader(['symbol', 'ticker', 'instrument', 'pair', 'contract']),
      side: findHeader(['side', 'direction', 'action', 'type', 'buysell']),
      entryPrice: findHeader(['entryprice', 'entry', 'buyprice', 'openprice', 'price']),
      exitPrice: findHeader(['exitprice', 'exit', 'sellprice', 'closeprice']),
      quantity: findHeader(['qty', 'quantity', 'size', 'contracts', 'shares', 'lots', 'amount']),
      stopLoss: findHeader(['stoploss', 'stop', 'sl']),
      fees: findHeader(['fee', 'fees', 'commission', 'comm']),
      date: findHeader(['date', 'time', 'entrydate', 'opentime', 'datetime', 'timestamp']),
      tags: findHeader(['tags', 'tag', 'strategy', 'playbook', 'setup']),
      notes: findHeader(['notes', 'note', 'comment', 'description']),
    }
  }

  // Parse CSV text using PapaParse
  const processCsvText = (csvString: string, name = 'uploaded_trades.csv') => {
    setError(null)
    setFileName(name)

    Papa.parse<Record<string, string>>(csvString, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => {
        if (results.errors.length > 0 && results.data.length === 0) {
          setError(`CSV parsing error: ${results.errors[0].message}`)
          return
        }

        const headers = results.meta.fields ?? []
        if (headers.length === 0 || results.data.length === 0) {
          setError('CSV must contain a header row and at least one valid data row.')
          return
        }

        setRawHeaders(headers)
        setRawData(results.data)
        setMapping(autoDetectColumns(headers))
        setStep('mapping')
      },
      error: (err: Error) => {
        setError(`Failed to parse CSV: ${err.message}`)
      },
    })
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const headers = results.meta.fields ?? []
        if (headers.length === 0 || results.data.length === 0) {
          setError('CSV must contain a header row and data rows.')
          return
        }
        setFileName(file.name)
        setRawHeaders(headers)
        setRawData(results.data)
        setMapping(autoDetectColumns(headers))
        setStep('mapping')
      },
      error: (err: Error) => {
        setError(`Error reading file: ${err.message}`)
      },
    })
  }

  const handleLoadSample = () => {
    processCsvText(SAMPLE_CSV_CONTENT, 'sample_prop_firm_trades.csv')
  }

  // Convert raw row to typed trade insert using current mapping
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRowToTrade = (row: Record<string, any>): TradeInsert => {
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

    const notes = mapping.notes && row[mapping.notes] ? String(row[mapping.notes]).trim() : `Imported from ${fileName}`

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

  const handleBulkImport = async () => {
    if (rawData.length === 0) return
    setIsSubmitting(true)
    setError(null)

    try {
      let count = 0
      for (const row of rawData) {
        const trade = mapRowToTrade(row)
        await createTradeMutation.mutateAsync(trade)
        count++
        setImportCount(count)
      }

      setIsSuccess(true)
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch {
      setError('Error saving imported trades. Please verify broker data and network status.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const previewTrades = rawData.slice(0, 5).map(mapRowToTrade)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-[#141414] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-[#18181B]/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-profit/15 text-profit">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F4F4F5]">Batch CSV Ingestion (PapaParse)</h2>
              <p className="text-xs text-[#A1A1AA]">
                {step === 'upload' && 'Upload broker log files from NinjaTrader, Tradovate, Binance, or MT5'}
                {step === 'mapping' && 'Step 2: Map CSV headers to Quantyx journal attributes'}
                {step === 'preview' && `Step 3: Preview and verify ${rawData.length} trade rows`}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="rounded-md p-1.5 text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#F4F4F5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* STEP 1: UPLOAD */}
          {step === 'upload' && (
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-profit/60 bg-white/[0.02] hover:bg-white/[0.04] p-10 text-center cursor-pointer transition-all group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] group-hover:bg-profit/15 text-[#A1A1AA] group-hover:text-profit mb-3 transition-colors">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-semibold text-[#F4F4F5]">
                  Drop trade history CSV here or click to browse
                </p>
                <p className="text-xs text-[#71717A] mt-1">
                  Supports automated column mapping for any broker format
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-[#A1A1AA]">No broker export file on hand?</span>
                <button
                  type="button"
                  onClick={handleLoadSample}
                  className="flex items-center gap-1.5 text-xs text-profit hover:underline font-medium"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Load Sample Prop Firm Trades (5 rows)
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: COLUMN MAPPING */}
          {step === 'mapping' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-[#18181B] border border-border text-xs">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4 text-profit" />
                  <span className="font-semibold text-[#F4F4F5]">{fileName}</span>
                  <span className="text-[#A1A1AA]">({rawData.length} rows parsed)</span>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('upload')}
                  className="text-xs text-[#A1A1AA] hover:text-white"
                >
                  Change File
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">
                    Symbol / Ticker <span className="text-loss">*</span>
                  </label>
                  <select
                    value={mapping.symbol}
                    onChange={(e) => setMapping({ ...mapping, symbol: e.target.value })}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-[#F4F4F5] focus:border-profit outline-none"
                  >
                    <option value="">Select column…</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">
                    Side / Direction <span className="text-loss">*</span>
                  </label>
                  <select
                    value={mapping.side}
                    onChange={(e) => setMapping({ ...mapping, side: e.target.value })}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-[#F4F4F5] focus:border-profit outline-none"
                  >
                    <option value="">Select column…</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">
                    Entry Price <span className="text-loss">*</span>
                  </label>
                  <select
                    value={mapping.entryPrice}
                    onChange={(e) => setMapping({ ...mapping, entryPrice: e.target.value })}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-[#F4F4F5] focus:border-profit outline-none"
                  >
                    <option value="">Select column…</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">Exit Price</label>
                  <select
                    value={mapping.exitPrice}
                    onChange={(e) => setMapping({ ...mapping, exitPrice: e.target.value })}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-[#F4F4F5] focus:border-profit outline-none"
                  >
                    <option value="">(None / Open trade)</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">
                    Quantity <span className="text-loss">*</span>
                  </label>
                  <select
                    value={mapping.quantity}
                    onChange={(e) => setMapping({ ...mapping, quantity: e.target.value })}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-[#F4F4F5] focus:border-profit outline-none"
                  >
                    <option value="">Select column…</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">Stop Loss</label>
                  <select
                    value={mapping.stopLoss}
                    onChange={(e) => setMapping({ ...mapping, stopLoss: e.target.value })}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-[#F4F4F5] focus:border-profit outline-none"
                  >
                    <option value="">(None)</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">Fees / Commission</label>
                  <select
                    value={mapping.fees}
                    onChange={(e) => setMapping({ ...mapping, fees: e.target.value })}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-[#F4F4F5] focus:border-profit outline-none"
                  >
                    <option value="">(None / $0.00)</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-[#A1A1AA] mb-1">
                    Execution Date <span className="text-loss">*</span>
                  </label>
                  <select
                    value={mapping.date}
                    onChange={(e) => setMapping({ ...mapping, date: e.target.value })}
                    className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-[#F4F4F5] focus:border-profit outline-none"
                  >
                    <option value="">Select column…</option>
                    {rawHeaders.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: PREVIEW DATA TABLE */}
          {step === 'preview' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#A1A1AA]">
                  Showing first 5 mapped rows out of <strong className="text-white">{rawData.length}</strong> trades
                </span>
                <Badge variant="profit" tabular>
                  {rawData.length} Rows Ready
                </Badge>
              </div>

              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#18181B] text-[#A1A1AA] border-b border-border">
                    <tr>
                      <th className="px-3 py-2 font-medium">Symbol</th>
                      <th className="px-3 py-2 font-medium">Side</th>
                      <th className="px-3 py-2 font-medium text-right">Entry</th>
                      <th className="px-3 py-2 font-medium text-right">Exit</th>
                      <th className="px-3 py-2 font-medium text-right">Qty</th>
                      <th className="px-3 py-2 font-medium text-right">Net PnL</th>
                      <th className="px-3 py-2 font-medium text-right">R-Mult</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {previewTrades.map((trade, idx) => {
                      const pnlResult =
                        trade.exit_price !== null
                          ? calculateTradePnL(
                              trade.direction,
                              trade.entry_price,
                              trade.exit_price,
                              trade.quantity,
                              trade.fees ?? 0,
                            )
                          : null
                      const rMult =
                        pnlResult && trade.stop_price
                          ? calculateRMultiple(
                              pnlResult.net_pnl,
                              trade.entry_price,
                              trade.stop_price,
                              trade.quantity,
                            )
                          : null

                      return (
                        <tr key={idx} className="hover:bg-white/[0.03]">
                          <td className="px-3 py-2 font-semibold text-[#F4F4F5]">{trade.symbol}</td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                                trade.direction === 'long'
                                  ? 'bg-profit/15 text-profit'
                                  : 'bg-loss/15 text-loss',
                              )}
                            >
                              {trade.direction}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#A1A1AA]">
                            ${trade.entry_price.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#A1A1AA]">
                            {trade.exit_price !== null ? `$${trade.exit_price.toFixed(2)}` : 'OPEN'}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#A1A1AA]">
                            {trade.quantity}
                          </td>
                          <td
                            className={cn(
                              'px-3 py-2 text-right tabular-nums font-semibold',
                              pnlResult
                                ? pnlResult.net_pnl >= 0
                                  ? 'text-profit'
                                  : 'text-loss'
                                : 'text-[#71717A]',
                            )}
                          >
                            {pnlResult
                              ? `${pnlResult.net_pnl >= 0 ? '+' : ''}$${pnlResult.net_pnl.toFixed(2)}`
                              : '—'}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#A1A1AA]">
                            {rMult !== null ? `${rMult >= 0 ? '+' : ''}${rMult.toFixed(2)}R` : '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-loss/10 border border-loss/30 text-loss text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSuccess && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-profit/10 border border-profit/30 text-profit text-xs">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>
                {importCount || rawData.length} trades bulk-inserted successfully into your journal!
              </span>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-[#18181B]/50">
          {step === 'upload' ? (
            <Button variant="ghost" size="sm" onClick={handleClose}>
              Cancel
            </Button>
          ) : step === 'mapping' ? (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('upload')}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  if (!mapping.symbol || !mapping.entryPrice) {
                    setError('Please map at least Symbol and Entry Price columns.')
                    return
                  }
                  setError(null)
                  setStep('preview')
                }}
                className="flex items-center gap-1.5"
              >
                <span>Preview Data</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('mapping')}
                className="flex items-center gap-1.5"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Adjust Mapping
              </Button>
              <Button
                variant="default"
                size="sm"
                loading={isSubmitting}
                disabled={isSubmitting || isSuccess}
                onClick={handleBulkImport}
                className="flex items-center gap-1.5"
              >
                <FileSpreadsheet className="h-3.5 w-3.5" />
                <span>{isSubmitting ? `Importing (${importCount}/${rawData.length})…` : `Bulk Insert ${rawData.length} Trades`}</span>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
