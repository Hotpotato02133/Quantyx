import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Share2,
  ExternalLink,
  Star,
  Flame,
  ArrowUpRight,
  TrendingUp,
} from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/cn'
import { useUiStore } from '@/store/useUiStore'
import { getPlaybookById, getPlaybookByTag } from '@/lib/playbooks'
import type { Trade } from '@/types'

interface RecentTradesWidgetProps {
  trades: Trade[]
  limit?: number
}

export function RecentTradesWidget({ trades, limit = 5 }: RecentTradesWidgetProps) {
  const navigate = useNavigate()
  const { privacyMode, setSharingTrade } = useUiStore()

  // Get most recent executions
  const recentTrades = React.useMemo(() => {
    return [...trades]
      .sort((a, b) => new Date(b.entry_at).getTime() - new Date(a.entry_at).getTime())
      .slice(0, limit)
  }, [trades, limit])

  if (recentTrades.length === 0) {
    return (
      <div id="recent-trades-widget" className="rounded-2xl border border-white/[0.06] bg-[#141414] p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-white/[0.06]">
          <div>
            <h2 className="text-xs font-medium text-zinc-400">Recent Executions</h2>
            <p className="text-[11px] text-zinc-500 mt-0.5">Latest trade entries and outcomes</p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/journal')}
            className="flex items-center gap-1 text-xs text-emerald-400 hover:underline font-medium"
          >
            <span>Open Journal</span>
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        <div className="flex h-36 flex-col items-center justify-center text-zinc-500 text-center">
          <TrendingUp className="h-7 w-7 mb-2 opacity-30 text-zinc-400" />
          <p className="text-xs">No recent executions recorded</p>
          <p className="text-[11px] text-zinc-600 mt-0.5">
            Log a new trade with Ctrl+N to view live feed
          </p>
        </div>
      </div>
    )
  }

  return (
    <div id="recent-trades-widget" className="rounded-2xl border border-white/[0.06] bg-[#141414] shadow-sm overflow-hidden select-none">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06] bg-[#161616]">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xs font-medium text-zinc-400">Recent Executions</h2>
          <span className="rounded bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] text-zinc-400 border border-white/[0.06]">
            {recentTrades.length} of {trades.length}
          </span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/journal')}
          className="flex items-center gap-1.5 text-xs text-[#A1A1AA] hover:text-[#F4F4F5] font-medium transition-colors"
        >
          <span>View All in Journal</span>
          <ExternalLink className="h-3.5 w-3.5 text-profit" />
        </button>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-border/40 text-[10px] uppercase font-semibold text-[#71717A] bg-[#111113]">
              <th className="px-4 py-2.5">Symbol & Side</th>
              <th className="px-4 py-2.5">Date & Time</th>
              <th className="px-4 py-2.5">Entry / Exit</th>
              <th className="px-4 py-2.5">Net PnL & R</th>
              <th className="px-4 py-2.5">Playbook</th>
              <th className="px-4 py-2.5">Score</th>
              <th className="px-4 py-2.5 text-right">Share</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {recentTrades.map((trade) => {
              const isWin = (trade.pnl ?? 0) >= 0
              const playbook =
                getPlaybookById(trade.playbook_id) ||
                (trade.tags.length > 0 ? getPlaybookByTag(trade.tags[0]) : undefined)

              return (
                <tr
                  key={trade.id}
                  className="hover:bg-white/[0.03] transition-colors group cursor-pointer"
                  onClick={() => navigate('/journal')}
                >
                  {/* Symbol & Side */}
                  <td className="px-4 py-3 align-middle font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#F4F4F5] text-xs tracking-tight">
                        {trade.symbol}
                      </span>
                      <span
                        className={cn(
                          'px-1.5 py-0.2 rounded text-[10px] font-bold uppercase tracking-wider',
                          trade.direction === 'long'
                            ? 'bg-profit/15 text-profit border border-profit/25'
                            : 'bg-loss/15 text-loss border border-loss/25',
                        )}
                      >
                        {trade.direction}
                      </span>
                    </div>
                  </td>

                  {/* Date & Time */}
                  <td className="px-4 py-3 align-middle text-[#A1A1AA] text-[11px] font-mono">
                    {format(parseISO(trade.entry_at), 'MMM d, HH:mm')}
                  </td>

                  {/* Entry / Exit */}
                  <td className="px-4 py-3 align-middle font-mono text-[11px] text-[#A1A1AA]">
                    <div className="flex items-center gap-1">
                      <span>${trade.entry_price.toLocaleString('en-US')}</span>
                      <span>→</span>
                      <span className="text-[#F4F4F5]">
                        {trade.exit_price ? `$${trade.exit_price.toLocaleString('en-US')}` : '—'}
                      </span>
                    </div>
                  </td>

                  {/* Net PnL & R */}
                  <td className="px-4 py-3 align-middle font-mono">
                    <div className="flex items-baseline gap-1.5">
                      <span
                        className={cn(
                          'font-bold tabular-nums text-xs',
                          isWin ? 'text-profit' : 'text-loss',
                          privacyMode && 'blur-sm select-none',
                        )}
                      >
                        {trade.pnl !== null
                          ? `${trade.pnl >= 0 ? '+' : '-'}$${Math.abs(trade.pnl).toFixed(2)}`
                          : '—'}
                      </span>
                      {trade.r_multiple !== null && (
                        <span
                          className={cn(
                            'text-[10px] tabular-nums',
                            isWin ? 'text-profit/80' : 'text-loss/80',
                            privacyMode && 'blur-sm select-none',
                          )}
                        >
                          ({trade.r_multiple >= 0 ? '+' : ''}{trade.r_multiple.toFixed(2)}R)
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Playbook */}
                  <td className="px-4 py-3 align-middle">
                    {playbook ? (
                      <span
                        className="inline-flex items-center gap-1 rounded px-2 py-0.5 font-mono text-[10px] font-medium border"
                        style={{
                          backgroundColor: `${playbook.color}15`,
                          borderColor: `${playbook.color}35`,
                          color: playbook.color,
                        }}
                      >
                        <Flame className="h-2.5 w-2.5" />
                        <span className="truncate max-w-[110px]">{playbook.name}</span>
                      </span>
                    ) : (
                      <span className="text-[#525252] text-[11px] font-mono">—</span>
                    )}
                  </td>

                  {/* Execution Rating */}
                  <td className="px-4 py-3 align-middle">
                    <div className="flex items-center gap-0.5 text-warning">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            'h-2.5 w-2.5',
                            i < (trade.execution_rating ?? 5)
                              ? 'fill-warning text-warning'
                              : 'text-[#3F3F46]',
                          )}
                        />
                      ))}
                    </div>
                  </td>

                  {/* Share CTA */}
                  <td className="px-4 py-3 align-middle text-right">
                    <button
                      type="button"
                      title="Share Trade Card"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSharingTrade(trade)
                      }}
                      className="p-1 rounded text-[#71717A] hover:text-profit hover:bg-profit/10 transition-colors"
                    >
                      <Share2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
