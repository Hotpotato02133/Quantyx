/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useCallback, useRef } from 'react'
import {
  createColumnHelper,
  useTable,
  tableFeatures,
  rowSortingFeature,
  columnVisibilityFeature,
  createSortedRowModel,
  flexRender,
} from '@tanstack/react-table'
import type { SortingState } from '@tanstack/react-table'
import { useVirtualizer } from '@tanstack/react-virtual'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronRight,
  Loader2,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/store/useUiStore'
import { ShareTradeCardModal } from '@/components/trades/ShareTradeCardModal'
import { TradeFilterBar, type FilterValues } from '@/components/trades/TradeFilterBar'
import { TradeDetailDrawer } from '@/components/trades/TradeDetailDrawer'
import { PlaybookCell, EmotionCell } from '@/components/trades/InlineTradeCells'
import type { Trade } from '@/types'

const TABLE_FEATURES = tableFeatures({
  rowSortingFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
})

// ─── Cell Renderers ──────────────────────────────────────────────────────────

function SymbolAndSideCell({ trade }: { trade: Trade }) {
  const isLong = String(trade.direction).toLowerCase() === 'long'
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm font-semibold tracking-tight text-[#F4F4F5] uppercase">
        {trade.symbol}
      </span>
      <span
        className={cn(
          'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider border',
          isLong
            ? 'bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/25'
            : 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/25',
        )}
      >
        {isLong ? 'LONG' : 'SHORT'}
      </span>
    </div>
  )
}

function StatusPill({ status }: { status: Trade['status'] }) {
  const styles: Record<string, string> = {
    closed: 'bg-[#525252]/15 text-[#A1A1AA] border-[#525252]/20',
    open: 'bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/25',
    cancelled: 'bg-[#FF8C43]/15 text-[#FF8C43] border-[#FF8C43]/25',
    OPEN: 'bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/25',
    WIN: 'bg-[#1DB954]/15 text-[#1DB954] border-[#1DB954]/25',
    LOSS: 'bg-[#EF4444]/15 text-[#EF4444] border-[#EF4444]/25',
    BREAKEVEN: 'bg-[#FF8C43]/15 text-[#FF8C43] border-[#FF8C43]/25',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider border',
        styles[status] ?? styles.closed,
      )}
    >
      {status}
    </span>
  )
}

function PnLCell({ value, privacyMode }: { value: number | null; privacyMode: boolean }) {
  if (value === null) return <span className="text-[#525252]">—</span>
  const isPos = value >= 0
  return (
    <span
      className={cn(
        'font-mono text-sm tabular-nums font-semibold transition-all duration-300',
        isPos ? 'text-profit' : 'text-loss',
        privacyMode && 'blur-md select-none',
      )}
    >
      {isPos ? '+' : '-'}${Math.abs(value).toFixed(2)}
    </span>
  )
}


function RCell({ value, privacyMode }: { value: number | null; privacyMode: boolean }) {
  if (value === null) return <span className="text-[#525252]">—</span>
  const isPos = value >= 0
  return (
    <span
      className={cn(
        'font-mono text-sm tabular-nums font-semibold transition-all duration-300',
        isPos ? 'text-profit' : 'text-loss',
        privacyMode && 'blur-md select-none',
      )}
    >
      {isPos ? '+' : ''}{value.toFixed(2)}R
    </span>
  )
}

// ─── Main TradeDataGrid Component ───────────────────────────────────────────

interface TradeDataGridProps {
  trades: Trade[]
  isLoading?: boolean
}

export function TradeDataGrid({ trades, isLoading }: TradeDataGridProps) {
  const { privacyMode } = useUiStore()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'entry_at', desc: true }])
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const [sharingTrade, setSharingTrade] = useState<Trade | null>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  // Multi-faceted filter state synced with URL query parameters
  const [filters, setFilters] = useState<FilterValues>({
    symbol: '',
    direction: '',
    status: '',
    playbook: '',
    dateFrom: '',
    dateTo: '',
  })

  // Filtered dataset
  const filteredData = useMemo(() => {
    return trades.filter((t) => {
      // 1. Symbol search
      if (filters.symbol && !t.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
        return false
      }
      // 2. Direction filter
      if (filters.direction && t.direction.toLowerCase() !== filters.direction.toLowerCase()) {
        return false
      }
      // 3. Status filter
      if (filters.status && t.status.toLowerCase() !== filters.status.toLowerCase()) {
        return false
      }
      // 4. Playbook filter (matches playbook tag, playbook_id, or tags array)
      if (filters.playbook) {
        const pbLower = filters.playbook.toLowerCase()
        const hasMatch =
          (t.playbook_id && t.playbook_id.toLowerCase().includes(pbLower)) ||
          t.tags?.some((tg) => tg.toLowerCase().includes(pbLower))
        if (!hasMatch) return false
      }
      // 5. Date From
      if (filters.dateFrom) {
        const tradeDate = new Date(t.entry_at).toISOString().split('T')[0]
        if (tradeDate < filters.dateFrom) return false
      }
      // 6. Date To
      if (filters.dateTo) {
        const tradeDate = new Date(t.entry_at).toISOString().split('T')[0]
        if (tradeDate > filters.dateTo) return false
      }
      return true
    })
  }, [trades, filters])

  const columnHelper = createColumnHelper<typeof TABLE_FEATURES, Trade>()

  const columns: any[] = useMemo(() => [
    columnHelper.accessor('entry_at', {
      header: 'Date / Time',
      cell: (info: any) => (
        <span className="font-mono text-xs text-[#A1A1AA] tabular-nums whitespace-nowrap">
          {format(parseISO(info.getValue()), 'MMM d, HH:mm')}
        </span>
      ),
    }),
    columnHelper.display({
      id: 'symbol_and_side',
      header: 'Symbol & Side',
      cell: (info: any) => <SymbolAndSideCell trade={info.row.original} />,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info: any) => <StatusPill status={info.getValue()} />,
    }),
    columnHelper.accessor('entry_price', {
      header: 'Entry',
      cell: (info: any) => (
        <span className="font-mono text-sm tabular-nums text-[#F4F4F5]">
          ${Number(info.getValue()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
        </span>
      ),
    }),
    columnHelper.accessor('exit_price', {
      header: 'Exit',
      cell: (info: any) => {
        const v = info.getValue()
        return v ? (
          <span className="font-mono text-sm tabular-nums text-[#F4F4F5]">
            ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
          </span>
        ) : (
          <span className="text-[#525252]">—</span>
        )
      },
    }),
    columnHelper.accessor('quantity', {
      header: 'Qty',
      cell: (info: any) => (
        <span className="font-mono text-sm tabular-nums text-[#A1A1AA]">
          {Number(info.getValue()).toLocaleString()}
        </span>
      ),
    }),
    columnHelper.accessor('pnl', {
      header: 'Net PnL',
      cell: (info: any) => <PnLCell value={info.getValue()} privacyMode={privacyMode} />,
    }),
    columnHelper.accessor('r_multiple', {
      header: 'R-Mult',
      cell: (info: any) => <RCell value={info.getValue()} privacyMode={privacyMode} />,
    }),
    columnHelper.display({
      id: 'playbook',
      header: 'Playbook',
      cell: (info: any) => <PlaybookCell trade={info.row.original} />,
    }),
    columnHelper.display({
      id: 'emotion',
      header: 'Emotion',
      cell: (info: any) => <EmotionCell trade={info.row.original} />,
    }),
    columnHelper.display({
      id: 'expand',
      header: '',
      cell: (info: any) => {
        const isExpanded = expandedRow === info.row.id
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setExpandedRow(isExpanded ? null : info.row.id)
            }}
            className="flex h-6 w-6 items-center justify-center rounded text-[#71717A] hover:text-[#F4F4F5] hover:bg-white/[0.05] transition-colors"
            aria-label="Expand row details"
          >
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 transition-transform duration-200',
                isExpanded && 'rotate-90 text-profit',
              )}
              strokeWidth={2.5}
            />
          </button>
        )
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [privacyMode, expandedRow])

  const table = useTable({
    features: TABLE_FEATURES,
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
  })

  const { rows } = table.getRowModel()

  // High-performance virtualization (TC-E2E-04: keeps DOM node count under 50 for 5,000+ rows)
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: useCallback(() => 48, []),
    overscan: 10,
    initialRect: { width: 1000, height: 600 },
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const paddingTop = virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0
  const paddingBottom = virtualItems.length > 0 ? totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0) : 0

  // Fallback to rows when virtualizer hasn't measured layout yet (e.g. in test/jsdom)
  const itemsToRender =
    virtualItems.length > 0
      ? virtualItems
      : rows.map((_, index) => ({
          index,
          start: index * 48,
          size: 48,
          end: (index + 1) * 48,
          key: index,
        }))

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-[#A1A1AA] text-sm rounded-xl border border-border bg-surface">
        <Loader2 className="h-5 w-5 animate-spin text-profit" />
        <span>Loading trade log…</span>
      </div>
    )
  }

  return (
    <div id="trade-data-grid" className="rounded-xl border border-border bg-surface overflow-hidden shadow-2xl">
      {/* Multi-faceted filter bar synced to URL */}
      <TradeFilterBar
        filters={filters}
        onChange={setFilters}
        totalCount={trades.length}
        filteredCount={filteredData.length}
      />

      {/* Virtualized Table Container */}
      <div
        ref={tableContainerRef}
        className="overflow-auto scrollbar-thin scrollbar-thumb-white/10"
        style={{ maxHeight: '600px' }}
      >
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="sticky top-0 z-20 bg-[#161618] border-b border-border shadow-sm">
            {table.getHeaderGroups().map((hg: any) => (
              <tr key={hg.id}>
                {hg.headers.map((header: any) => (
                  <th
                    key={header.id}
                    className="px-3 py-3 text-[11px] font-semibold uppercase tracking-wider text-[#71717A] select-none whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-1.5',
                          header.column.getCanSort() && 'cursor-pointer hover:text-[#F4F4F5] transition-colors',
                        )}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          header.column.getIsSorted() === 'asc' ? (
                            <ArrowUp className="h-3 w-3 text-profit" />
                          ) : header.column.getIsSorted() === 'desc' ? (
                            <ArrowDown className="h-3 w-3 text-profit" />
                          ) : (
                            <ArrowUpDown className="h-3 w-3 opacity-30" />
                          )
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody>
            {paddingTop > 0 && <tr><td style={{ height: paddingTop }} /></tr>}
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-20 text-center text-sm text-[#71717A]">
                  No matching executions found. Log a new trade with{' '}
                  <kbd className="font-mono text-[11px] rounded border border-border bg-white/[0.05] px-1.5 py-0.5 text-[#F4F4F5]">
                    Ctrl+N
                  </kbd>
                </td>
              </tr>
            ) : (
              itemsToRender.map((virtualRow: any) => {
                const row = rows[virtualRow.index] as any
                const trade = row.original as Trade
                const isExpanded = expandedRow === row.id

                return (
                  <tr
                    key={row.id}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    className={cn(
                      'border-b border-border/40 transition-colors duration-100 hover:bg-white/[0.02]',
                      isExpanded && 'bg-white/[0.03]',
                    )}
                  >
                    {isExpanded ? (
                      <td colSpan={columns.length} className="p-3">
                        {/* Summary Bar */}
                        <div
                          onClick={() => setExpandedRow(null)}
                          className="flex items-center justify-between pb-3 mb-3 border-b border-border/50 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <span className="font-mono text-sm font-bold text-[#F4F4F5] uppercase">
                              {trade.symbol}
                            </span>
                            <span
                              className={cn(
                                'rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase',
                                trade.direction === 'long'
                                  ? 'bg-[#1DB954]/20 text-[#1DB954]'
                                  : 'bg-[#EF4444]/20 text-[#EF4444]',
                              )}
                            >
                              {trade.direction.toUpperCase()}
                            </span>
                            <span className="text-xs text-[#71717A]">
                              {format(parseISO(trade.entry_at), 'MMM d, yyyy · HH:mm')}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <PnLCell value={trade.pnl} privacyMode={privacyMode} />
                            <ChevronRight className="h-4 w-4 rotate-90 text-profit" />
                          </div>
                        </div>

                        {/* Interactive Drawer Content */}
                        <TradeDetailDrawer
                          trade={trade}
                          onShare={(t) => setSharingTrade(t)}
                        />
                      </td>
                    ) : (
                      row.getVisibleCells().map((cell: any) => (
                        <td
                          key={cell.id}
                          className="px-3 py-2.5 align-middle cursor-pointer"
                          onClick={() => setExpandedRow(row.id)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))
                    )}
                  </tr>
                )
              })
            )}
            {paddingBottom > 0 && <tr><td style={{ height: paddingBottom }} /></tr>}
          </tbody>
        </table>
      </div>

      {/* Share Trade Card Lightbox Modal */}
      <ShareTradeCardModal
        trade={sharingTrade}
        isOpen={Boolean(sharingTrade)}
        onClose={() => setSharingTrade(null)}
      />
    </div>
  )
}
