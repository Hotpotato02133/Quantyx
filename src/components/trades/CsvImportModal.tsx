import { useState, useRef } from 'react'
import {
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight,
  FileText,
} from 'lucide-react'
import { useCreateTrade } from '@/hooks/useTrades'
import { cn } from '@/lib/cn'

interface CsvImportModalProps {
  isOpen: boolean
  onClose: () => void
}

interface ParsedRow {
  symbol: string
  direction: 'long' | 'short'
  entry_price: number
  exit_price: number
  quantity: number
  pnl: number
  entry_at: string
  tags: string[]
}

const SAMPLE_CSV_CONTENT = `Symbol,Side,EntryPrice,ExitPrice,Qty,PnL,Date,Tags
NQ1!,LONG,20250.50,20380.00,2,518.00,2026-10-19T13:30:00Z,Breakout;NYOpen
ES1!,SHORT,5860.25,5842.00,3,547.50,2026-10-18T15:00:00Z,VWAPReversal
BTCUSDT,LONG,68100.00,69450.00,0.5,675.00,2026-10-17T09:15:00Z,LiquiditySweep
AAPL,LONG,232.10,235.80,100,370.00,2026-10-16T14:15:00Z,TechContinuation
NVDA,SHORT,142.50,139.20,80,264.00,2026-10-15T15:30:00Z,EarningsFade`

export function CsvImportModal({ isOpen, onClose }: CsvImportModalProps) {
  const [fileName, setFileName] = useState('')
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const createTradeMutation = useCreateTrade()

  if (!isOpen) return null

  const parseCsv = (text: string, name = 'uploaded_trades.csv') => {
    setError(null)
    setFileName(name)

    try {
      const lines = text.trim().split('\n')
      if (lines.length < 2) {
        setError('CSV must contain at least a header and one data row.')
        return
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
      const rows: ParsedRow[] = []

      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const cols = line.split(',').map((c) => c.trim())

        // Basic mapping by expected header positions or named matching
        const symbolIdx = headers.findIndex((h) => h.includes('symbol') || h.includes('ticker'))
        const sideIdx = headers.findIndex((h) => h.includes('side') || h.includes('direction'))
        const entryIdx = headers.findIndex((h) => h.includes('entry'))
        const exitIdx = headers.findIndex((h) => h.includes('exit'))
        const qtyIdx = headers.findIndex((h) => h.includes('qty') || h.includes('quantity'))
        const pnlIdx = headers.findIndex((h) => h.includes('pnl') || h.includes('profit'))
        const dateIdx = headers.findIndex((h) => h.includes('date') || h.includes('time'))
        const tagsIdx = headers.findIndex((h) => h.includes('tag'))

        const symbol = symbolIdx >= 0 ? cols[symbolIdx] : cols[0] || 'TICKER'
        const sideRaw = (sideIdx >= 0 ? cols[sideIdx] : cols[1] || 'LONG').toLowerCase()
        const direction = sideRaw.includes('short') ? 'short' : 'long'
        const entry_price = parseFloat(entryIdx >= 0 ? cols[entryIdx] : cols[2]) || 100
        const exit_price = parseFloat(exitIdx >= 0 ? cols[exitIdx] : cols[3]) || entry_price
        const quantity = parseFloat(qtyIdx >= 0 ? cols[qtyIdx] : cols[4]) || 1
        const pnl = parseFloat(pnlIdx >= 0 ? cols[pnlIdx] : cols[5]) || (exit_price - entry_price) * quantity
        const dateStr = dateIdx >= 0 ? cols[dateIdx] : new Date().toISOString()
        const tagsRaw = tagsIdx >= 0 ? cols[tagsIdx] : 'CsvImport'
        const tags = tagsRaw.split(';').map((t) => t.trim()).filter(Boolean)

        rows.push({
          symbol: symbol.toUpperCase(),
          direction,
          entry_price,
          exit_price,
          quantity,
          pnl,
          entry_at: isNaN(new Date(dateStr).getTime()) ? new Date().toISOString() : dateStr,
          tags,
        })
      }

      setParsedRows(rows)
    } catch {
      setError('Failed to parse CSV file. Please verify format.')
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      parseCsv(text, file.name)
    }
    reader.readAsText(file)
  }

  const handleLoadSample = () => {
    parseCsv(SAMPLE_CSV_CONTENT, 'sample_prop_firm_trades.csv')
  }

  const handleImport = async () => {
    if (parsedRows.length === 0) return
    setIsSubmitting(true)
    setError(null)

    try {
      for (const row of parsedRows) {
        await createTradeMutation.mutateAsync({
          symbol: row.symbol,
          asset_class: 'futures',
          direction: row.direction,
          status: 'closed',
          entry_price: row.entry_price,
          exit_price: row.exit_price,
          stop_price: row.direction === 'long' ? row.entry_price * 0.99 : row.entry_price * 1.01,
          target_price: row.exit_price,
          quantity: row.quantity,
          entry_at: row.entry_at,
          exit_at: row.entry_at,
          tags: row.tags,
          notes: `Batch imported from ${fileName}`,
          screenshot_url: null,
        })
      }

      setIsSuccess(true)
      setTimeout(() => {
        setIsSuccess(false)
        onClose()
      }, 1500)
    } catch {
      setError('Error saving imported trades. Check connection.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-[#141414] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-profit/15 text-profit">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-[#F4F4F5]">Import Trades CSV</h2>
              <p className="text-xs text-[#A1A1AA]">
                Upload broker trade logs from Tradovate, Binance, NinjaTrader, or MetaTrader
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#F4F4F5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {parsedRows.length === 0 ? (
            /* Upload State */
            <div className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border hover:border-profit/60 bg-white/[0.02] hover:bg-white/[0.04] p-8 text-center cursor-pointer transition-all group"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.05] group-hover:bg-profit/15 text-[#A1A1AA] group-hover:text-profit mb-3 transition-colors">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-[#F4F4F5]">
                  Click to browse or drag and drop your CSV
                </p>
                <p className="text-xs text-[#71717A] mt-1">
                  Supports headers: Symbol, Side, EntryPrice, ExitPrice, Qty, PnL, Date
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
                <span className="text-xs text-[#A1A1AA]">Want to test without a broker file?</span>
                <button
                  onClick={handleLoadSample}
                  className="flex items-center gap-1.5 text-xs text-profit hover:underline font-medium"
                >
                  <FileText className="h-3.5 w-3.5" />
                  Load Sample Trades CSV (5 rows)
                </button>
              </div>
            </div>
          ) : (
            /* Preview State */
            <div className="space-y-4">
              <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/[0.04] border border-border text-xs">
                <div className="flex items-center gap-2">
                  <FileSpreadsheet className="h-4 w-4 text-profit" />
                  <span className="font-semibold text-[#F4F4F5]">{fileName}</span>
                  <span className="text-[#A1A1AA]">({parsedRows.length} trades detected)</span>
                </div>
                <button
                  onClick={() => {
                    setParsedRows([])
                  }}
                  className="text-xs text-[#A1A1AA] hover:text-loss"
                >
                  Clear & Re-upload
                </button>
              </div>

              {/* Table preview */}
              <div className="rounded-lg border border-border overflow-hidden">
                <div className="max-h-56 overflow-y-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#18181B] text-[#A1A1AA] border-b border-border sticky top-0">
                      <tr>
                        <th className="px-3 py-2 font-medium">Symbol</th>
                        <th className="px-3 py-2 font-medium">Side</th>
                        <th className="px-3 py-2 font-medium text-right">Entry</th>
                        <th className="px-3 py-2 font-medium text-right">Exit</th>
                        <th className="px-3 py-2 font-medium text-right">Qty</th>
                        <th className="px-3 py-2 font-medium text-right">PnL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {parsedRows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-white/[0.03]">
                          <td className="px-3 py-2 font-semibold text-[#F4F4F5]">{row.symbol}</td>
                          <td className="px-3 py-2">
                            <span
                              className={cn(
                                'px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                                row.direction === 'long'
                                  ? 'bg-profit/15 text-profit'
                                  : 'bg-loss/15 text-loss',
                              )}
                            >
                              {row.direction}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#A1A1AA]">
                            ${row.entry_price.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#A1A1AA]">
                            ${row.exit_price.toFixed(2)}
                          </td>
                          <td className="px-3 py-2 text-right tabular-nums text-[#A1A1AA]">
                            {row.quantity}
                          </td>
                          <td
                            className={cn(
                              'px-3 py-2 text-right tabular-nums font-semibold',
                              row.pnl >= 0 ? 'text-profit' : 'text-loss',
                            )}
                          >
                            {row.pnl >= 0 ? `+$${row.pnl.toFixed(2)}` : `-$${Math.abs(row.pnl).toFixed(2)}`}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
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
              <span>{parsedRows.length} trades imported successfully into your journal!</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-[#18181B]/50">
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={parsedRows.length === 0 || isSubmitting || isSuccess}
            onClick={handleImport}
            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-profit text-[#0A0A0A] text-xs font-semibold hover:bg-profit/90 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? 'Importing…' : `Import ${parsedRows.length} Trades`}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
