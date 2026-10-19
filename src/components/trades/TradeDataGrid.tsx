/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState, useCallback, useRef } from 'react'
import {
  createColumnHelper,
  useTable,
  tableFeatures,
  rowSortingFeature,
  createCoreRowModel,
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
import type { Trade } from '@/types'

const TABLE_FEATURES = tableFeatures({ rowSortingFeature })

// ─── Cell renderers ───────────────────────────────────────────────────────────

function DirectionPill({ direction }: { direction: 'long' | 'short' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider',
        direction === 'long'
          ? 'bg-profit/15 text-profit border border-profit/20'
          : 'bg-loss/15 text-loss border border-loss/20',
      )}
    >
      {direction}
    </span>
  )
}

function StatusPill({ status }: { status: Trade['status'] }) {
  const styles: Record<Trade['status'], string> = {
    closed: 'bg-[#525252]/15 text-[#A1A1AA] border-[#525252]/20',
    open: 'bg-profit/15 text-profit border-profit/20',
    cancelled: 'bg-warning/15 text-warning border-warning/20',
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
        'font-mono text-sm tabular-nums transition-all duration-300',
        isPos ? 'text-profit' : 'text-loss',
        privacyMode && 'blur-md select-none',
      )}
    >
      {isPos ? '+' : ''}${Math.abs(value).toFixed(2)}
    </span>
  )
}

function RCell({ value, privacyMode }: { value: number | null; privacyMode: boolean }) {
  if (value === null) return <span className="text-[#525252]">—</span>
  const isPos = value >= 0
  return (
    <span
      className={cn(
        'font-mono text-sm tabular-nums transition-all duration-300',
        isPos ? 'text-profit' : 'text-loss',
        privacyMode && 'blur-md select-none',
      )}
    >
      {isPos ? '+' : ''}{value.toFixed(2)}R
    </span>
  )
}

function TagPills({ tags }: { tags: string[] }) {
  if (tags.length === 0) return <span className="text-[#525252]">—</span>
  return (
    <div className="flex flex-wrap gap-1">
      {tags.slice(0, 2).map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-white/[0.06] text-[#A1A1AA] border border-border"
        >
          {tag}
        </span>
      ))}
      {tags.length > 2 && <span className="text-[10px] text-[#525252]">+{tags.length - 2}</span>}
    </div>
  )
}

// ─── Filter bar ───────────────────────────────────────────────────────────────

function FilterBar({
  symbolFilter,
  onSymbolChange,
  directionFilter,
  onDirectionChange,
  statusFilter,
  onStatusChange,
}: {
  symbolFilter: string; onSymbolChange: (v: string) => void
  directionFilter: string; onDirectionChange: (v: string) => void
  statusFilter: string; onStatusChange: (v: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-2 p-3 border-b border-border bg-surface">
      <input
        placeholder="Filter by symbol…"
        value={symbolFilter}
        onChange={(e) => onSymbolChange(e.target.value)}
        className="rounded-md border border-border bg-canvas px-3 py-1.5 font-mono text-sm text-[#F4F4F5] placeholder-[#525252] outline-none focus:border-profit/50 w-[180px]"
        aria-label="Filter by symbol"
      />
      <select
        value={directionFilter}
        onChange={(e) => onDirectionChange(e.target.value)}
        className="rounded-md border border-border bg-canvas px-2 py-1.5 text-sm text-[#F4F4F5] outline-none cursor-pointer"
        aria-label="Filter by direction"
      >
        <option value="">All Sides</option>
        <option value="long">Long</option>
        <option value="short">Short</option>
      </select>
      <select
        value={statusFilter}
        onChange={(e) => onStatusChange(e.target.value)}
        className="rounded-md border border-border bg-canvas px-2 py-1.5 text-sm text-[#F4F4F5] outline-none cursor-pointer"
        aria-label="Filter by status"
      >
        <option value="">All Status</option>
        <option value="closed">Closed</option>
        <option value="open">Open</option>
      </select>
    </div>
  )
}

// ─── Main DataGrid ────────────────────────────────────────────────────────────

interface TradeDataGridProps {
  trades: Trade[]
  isLoading?: boolean
}

export function TradeDataGrid({ trades, isLoading }: TradeDataGridProps) {
  const { privacyMode } = useUiStore()
  const [sorting, setSorting] = useState<SortingState>([{ id: 'entry_at', desc: true }])
  const [symbolFilter, setSymbolFilter] = useState('')
  const [directionFilter, setDirectionFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [expandedRow, setExpandedRow] = useState<string | null>(null)
  const tableContainerRef = useRef<HTMLDivElement>(null)

  const filteredData = useMemo(() => {
    return trades.filter((t) => {
      if (symbolFilter && !t.symbol.toLowerCase().includes(symbolFilter.toLowerCase())) return false
      if (directionFilter && t.direction !== directionFilter) return false
      if (statusFilter && t.status !== statusFilter) return false
      return true
    })
  }, [trades, symbolFilter, directionFilter, statusFilter])

  const columnHelper = createColumnHelper<Trade>()

  const columns: any[] = useMemo(() => [
    columnHelper.accessor('entry_at', {
      header: 'Date',
      cell: (info: any) => (
        <span className="font-mono text-xs text-[#A1A1AA] tabular-nums">
          {format(parseISO(info.getValue()), 'MMM d, HH:mm')}
        </span>
      ),
    }),
    columnHelper.accessor('symbol', {
      header: 'Symbol',
      cell: (info: any) => (
        <span className="font-mono text-sm font-semibold text-[#F4F4F5] uppercase">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('direction', {
      header: 'Side',
      cell: (info: any) => <DirectionPill direction={info.getValue()} />,
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: (info: any) => <StatusPill status={info.getValue()} />,
    }),
    columnHelper.accessor('entry_price', {
      header: 'Entry',
      cell: (info: any) => (
        <span className="font-mono text-sm tabular-nums text-[#F4F4F5]">
          ${Number(info.getValue()).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
        </span>
      ),
    }),
    columnHelper.accessor('exit_price', {
      header: 'Exit',
      cell: (info: any) => {
        const v = info.getValue()
        return v ? (
          <span className="font-mono text-sm tabular-nums text-[#F4F4F5]">
            ${Number(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}
          </span>
        ) : <span className="text-[#525252]">—</span>
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
      header: 'R',
      cell: (info: any) => <RCell value={info.getValue()} privacyMode={privacyMode} />,
    }),
    columnHelper.accessor('tags', {
      header: 'Tags',
      cell: (info: any) => <TagPills tags={info.getValue() as string[]} />,
    }),
    columnHelper.display({
      id: 'expand',
      cell: (info: any) => (
        <button
          onClick={() => setExpandedRow(expandedRow === info.row.id ? null : info.row.id)}
          className="flex h-5 w-5 items-center justify-center rounded text-[#525252] hover:text-[#A1A1AA] transition-colors"
          aria-label="Expand row details"
        >
          <ChevronRight
            className={cn('h-3.5 w-3.5 transition-transform duration-200', expandedRow === info.row.id && 'rotate-90')}
            strokeWidth={2}
          />
        </button>
      ),
    }),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ], [privacyMode, expandedRow])

  const table: any = useTable({
    _features: TABLE_FEATURES,
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: createCoreRowModel(),
    getSortedRowModel: createSortedRowModel(),
  } as any)

  const { rows } = table.getRowModel()

  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => tableContainerRef.current,
    estimateSize: useCallback(() => 44, []),
    overscan: 10,
  })

  const virtualItems = virtualizer.getVirtualItems()
  const totalSize = virtualizer.getTotalSize()
  const paddingTop = virtualItems.length > 0 ? (virtualItems[0]?.start ?? 0) : 0
  const paddingBottom = virtualItems.length > 0 ? totalSize - (virtualItems[virtualItems.length - 1]?.end ?? 0) : 0

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center gap-2 text-[#A1A1AA] text-sm">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading trades…
      </div>
    )
  }

  return (
    <div id="trade-data-grid" className="rounded-xl border border-border bg-surface overflow-hidden">
      <FilterBar
        symbolFilter={symbolFilter}
        onSymbolChange={setSymbolFilter}
        directionFilter={directionFilter}
        onDirectionChange={setDirectionFilter}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />

      <div className="px-3 py-2 border-b border-border flex items-center gap-2">
        <span className="text-[11px] text-[#525252]">
          {filteredData.length.toLocaleString()} trade{filteredData.length !== 1 ? 's' : ''}
        </span>
        {(symbolFilter || directionFilter || statusFilter) && (
          <button
            onClick={() => { setSymbolFilter(''); setDirectionFilter(''); setStatusFilter('') }}
            className="text-[11px] text-profit hover:underline"
          >
            Clear filters
          </button>
        )}
      </div>

      <div ref={tableContainerRef} className="overflow-auto" style={{ maxHeight: '520px' }}>
        <table className="w-full table-fixed border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-[#181818]">
            {table.getHeaderGroups().map((hg: any) => (
              <tr key={hg.id} className="border-b border-border">
                {hg.headers.map((header: any) => (
                  <th
                    key={header.id}
                    className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-[#525252] select-none whitespace-nowrap"
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={cn(
                          'flex items-center gap-1',
                          header.column.getCanSort() && 'cursor-pointer hover:text-[#A1A1AA] transition-colors',
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
            {virtualItems.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-16 text-center text-sm text-[#525252]">
                  No trades found. Log your first trade with{' '}
                  <kbd className="font-mono text-[11px] rounded border border-border px-1">Ctrl+N</kbd>
                </td>
              </tr>
            ) : (
              virtualItems.map((virtualRow: any) => {
                const row = rows[virtualRow.index] as any
                const trade = row.original as Trade
                const isExpanded = expandedRow === row.id
                return (
                  <>
                    <tr
                      key={row.id}
                      data-index={virtualRow.index}
                      ref={virtualizer.measureElement}
                      className={cn(
                        'border-b border-border/50 transition-colors duration-100 hover:bg-white/[0.025]',
                        isExpanded && 'bg-white/[0.03]',
                      )}
                    >
                      {row.getVisibleCells().map((cell: any) => (
                        <td key={cell.id} className="px-3 py-2.5 align-middle">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && (
                      <tr key={`${row.id}-expanded`} className="border-b border-border/50 bg-white/[0.015]">
                        <td colSpan={columns.length} className="px-4 py-3">
                          <div className="flex flex-col gap-2">
                            {trade.notes && (
                              <p className="text-sm text-[#A1A1AA] leading-relaxed">{trade.notes}</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-[11px] text-[#525252]">
                              <span>Class: <span className="text-[#A1A1AA]">{trade.asset_class}</span></span>
                              {trade.stop_price && (
                                <span>Stop: <span className="font-mono text-loss">${Number(trade.stop_price).toFixed(4)}</span></span>
                              )}
                              {trade.target_price && (
                                <span>Target: <span className="font-mono text-profit">${Number(trade.target_price).toFixed(4)}</span></span>
                              )}
                              {trade.exit_at && (
                                <span>Closed: <span className="font-mono text-[#A1A1AA]">{format(parseISO(trade.exit_at), 'MMM d, HH:mm')}</span></span>
                              )}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                )
              })
            )}
            {paddingBottom > 0 && <tr><td style={{ height: paddingBottom }} /></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
