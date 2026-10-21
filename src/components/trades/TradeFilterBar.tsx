import { useEffect, useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Search,
  X,
  Calendar,
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react'
import { DEFAULT_PLAYBOOKS } from '@/lib/playbooks'
import { useFilterStore, type TradeDirection } from '@/store/useFilterStore'
import { cn } from '@/lib/cn'

export interface FilterValues {
  symbol: string
  direction: string
  status: string
  playbook: string
  dateFrom: string
  dateTo: string
}

interface TradeFilterBarProps {
  filters: FilterValues
  onChange: (filters: FilterValues) => void
  totalCount: number
  filteredCount: number
}

const DATE_PRESETS = [
  { label: 'All Time', days: null },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
]

export function TradeFilterBar({
  filters,
  onChange,
  totalCount,
  filteredCount,
}: TradeFilterBarProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const { setSymbol, setDirection, setDateRange } = useFilterStore()

  // 1. Initialize filters from URL search params on mount
  useEffect(() => {
    const urlSymbol = searchParams.get('symbol') || ''
    const urlDirection = searchParams.get('direction') || ''
    const urlStatus = searchParams.get('status') || ''
    const urlPlaybook = searchParams.get('playbook') || ''
    const urlFrom = searchParams.get('from') || ''
    const urlTo = searchParams.get('to') || ''

    if (
      urlSymbol !== filters.symbol ||
      urlDirection !== filters.direction ||
      urlStatus !== filters.status ||
      urlPlaybook !== filters.playbook ||
      urlFrom !== filters.dateFrom ||
      urlTo !== filters.dateTo
    ) {
      onChange({
        symbol: urlSymbol,
        direction: urlDirection,
        status: urlStatus,
        playbook: urlPlaybook,
        dateFrom: urlFrom,
        dateTo: urlTo,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2. Sync changes back to URL search params
  const updateFilter = useCallback(
    (key: keyof FilterValues, value: string) => {
      const updated = { ...filters, [key]: value }
      onChange(updated)

      // Sync with Zustand store
      if (key === 'symbol') setSymbol(value)
      if (key === 'direction') {
        const d = (value === 'long' || value === 'short' ? value : 'all') as TradeDirection
        setDirection(d)
      }
      if (key === 'dateFrom' || key === 'dateTo') {
        setDateRange({
          from: key === 'dateFrom' ? (value || null) : (filters.dateFrom || null),
          to: key === 'dateTo' ? (value || null) : (filters.dateTo || null),
        })
      }

      // Sync with URL query params
      const newParams = new URLSearchParams(searchParams)
      if (value) {
        const paramKey =
          key === 'dateFrom' ? 'from' : key === 'dateTo' ? 'to' : key
        newParams.set(paramKey, value)
      } else {
        const paramKey =
          key === 'dateFrom' ? 'from' : key === 'dateTo' ? 'to' : key
        newParams.delete(paramKey)
      }
      setSearchParams(newParams, { replace: true })
    },
    [filters, onChange, searchParams, setSearchParams, setSymbol, setDirection, setDateRange],
  )

  const handleApplyPreset = (days: number | null) => {
    if (days === null) {
      updateFilter('dateFrom', '')
      updateFilter('dateTo', '')
      return
    }

    const to = new Date()
    const from = new Date()
    from.setDate(from.getDate() - days)

    const fromStr = from.toISOString().split('T')[0]
    const toStr = to.toISOString().split('T')[0]

    const updated = { ...filters, dateFrom: fromStr, dateTo: toStr }
    onChange(updated)

    const newParams = new URLSearchParams(searchParams)
    newParams.set('from', fromStr)
    newParams.set('to', toStr)
    setSearchParams(newParams, { replace: true })
  }

  const handleResetFilters = () => {
    const emptyFilters: FilterValues = {
      symbol: '',
      direction: '',
      status: '',
      playbook: '',
      dateFrom: '',
      dateTo: '',
    }
    onChange(emptyFilters)
    setSymbol('')
    setDirection('all')
    setDateRange({ from: null, to: null })
    setSearchParams(new URLSearchParams(), { replace: true })
  }

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.symbol ||
      filters.direction ||
      filters.status ||
      filters.playbook ||
      filters.dateFrom ||
      filters.dateTo,
    )
  }, [filters])

  return (
    <div className="flex flex-col gap-2.5 p-3.5 border-b border-border bg-[#141414]">
      {/* Top Controls Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {/* Symbol Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-[#71717A] pointer-events-none" />
            <input
              type="text"
              placeholder="Search symbol (e.g. NQ, BTC)…"
              value={filters.symbol}
              onChange={(e) => updateFilter('symbol', e.target.value)}
              className="h-8 rounded-md border border-border bg-[#18181B] pl-8 pr-7 font-mono text-xs text-[#F4F4F5] placeholder-[#71717A] outline-none transition-colors focus:border-profit/60 w-48 sm:w-56"
            />
            {filters.symbol && (
              <button
                type="button"
                onClick={() => updateFilter('symbol', '')}
                className="absolute right-2 text-[#71717A] hover:text-[#F4F4F5]"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>

          {/* Side (Direction) Segmented Buttons */}
          <div className="flex items-center rounded-md border border-border bg-[#18181B] p-0.5 text-xs">
            <button
              type="button"
              onClick={() => updateFilter('direction', '')}
              className={cn(
                'rounded px-2.5 py-1 font-medium transition-colors',
                filters.direction === ''
                  ? 'bg-white/[0.1] text-[#F4F4F5]'
                  : 'text-[#71717A] hover:text-[#A1A1AA]',
              )}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => updateFilter('direction', 'long')}
              className={cn(
                'rounded px-2.5 py-1 font-medium transition-colors',
                filters.direction === 'long'
                  ? 'bg-profit/20 text-profit font-semibold'
                  : 'text-[#71717A] hover:text-profit',
              )}
            >
              Long
            </button>
            <button
              type="button"
              onClick={() => updateFilter('direction', 'short')}
              className={cn(
                'rounded px-2.5 py-1 font-medium transition-colors',
                filters.direction === 'short'
                  ? 'bg-loss/20 text-loss font-semibold'
                  : 'text-[#71717A] hover:text-loss',
              )}
            >
              Short
            </button>
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="h-8 appearance-none rounded-md border border-border bg-[#18181B] pl-3 pr-7 text-xs text-[#D4D4D8] outline-none hover:border-white/[0.2] focus:border-profit/60 cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="closed">Closed Only</option>
              <option value="open">Open Positions</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3 w-3 text-[#71717A]" />
          </div>

          {/* Playbook Setup Dropdown */}
          <div className="relative">
            <select
              value={filters.playbook}
              onChange={(e) => updateFilter('playbook', e.target.value)}
              className="h-8 appearance-none rounded-md border border-border bg-[#18181B] pl-3 pr-7 text-xs text-[#D4D4D8] outline-none hover:border-white/[0.2] focus:border-profit/60 cursor-pointer"
            >
              <option value="">All Playbooks</option>
              {DEFAULT_PLAYBOOKS.map((pb) => (
                <option key={pb.id} value={pb.tag}>
                  {pb.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-2.5 h-3 w-3 text-[#71717A]" />
          </div>
        </div>

        {/* Date Presets & Custom Picker */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Date Presets */}
          <div className="flex items-center rounded-md border border-border bg-[#18181B] p-0.5 text-xs">
            {DATE_PRESETS.map((p) => {
              const isSelected =
                (p.days === null && !filters.dateFrom && !filters.dateTo) ||
                (p.days !== null && filters.dateFrom)
              return (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleApplyPreset(p.days)}
                  className={cn(
                    'rounded px-2 py-1 text-[11px] font-medium transition-colors',
                    isSelected && (p.days === null ? !filters.dateFrom : true)
                      ? 'bg-white/[0.1] text-[#F4F4F5]'
                      : 'text-[#71717A] hover:text-[#A1A1AA]',
                  )}
                >
                  {p.label}
                </button>
              )
            })}
          </div>

          {/* Custom Date Inputs */}
          <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
            <Calendar className="h-3.5 w-3.5 text-[#71717A]" />
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => updateFilter('dateFrom', e.target.value)}
              className="h-8 rounded-md border border-border bg-[#18181B] px-2 text-[11px] font-mono text-[#D4D4D8] outline-none focus:border-profit/60"
              title="From Date"
            />
            <span>–</span>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => updateFilter('dateTo', e.target.value)}
              className="h-8 rounded-md border border-border bg-[#18181B] px-2 text-[11px] font-mono text-[#D4D4D8] outline-none focus:border-profit/60"
              title="To Date"
            />
          </div>
        </div>
      </div>

      {/* Active Filter Status & Reset Row */}
      <div className="flex items-center justify-between pt-1 border-t border-border/40 text-[11px]">
        <div className="flex items-center gap-2 text-[#71717A]">
          <SlidersHorizontal className="h-3 w-3" />
          <span>
            Showing <strong className="text-[#F4F4F5]">{filteredCount.toLocaleString()}</strong> of{' '}
            <strong className="text-[#A1A1AA]">{totalCount.toLocaleString()}</strong> trades
          </span>
          {hasActiveFilters && (
            <span className="inline-flex items-center rounded bg-profit/10 px-1.5 py-0.5 text-[10px] font-medium text-profit border border-profit/20">
              Filtered
            </span>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={handleResetFilters}
            className="flex items-center gap-1 text-[11px] text-profit hover:underline font-medium"
          >
            <RotateCcw className="h-3 w-3" />
            <span>Reset all filters</span>
          </button>
        )}
      </div>
    </div>
  )
}
