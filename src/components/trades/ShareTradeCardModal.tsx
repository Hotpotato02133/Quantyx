import { useState } from 'react'
import {
  X,
  Share2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Flame,
  TrendingUp,
  Award,
} from 'lucide-react'
import type { Trade } from '@/types'
import { format, parseISO } from 'date-fns'
import { cn } from '@/lib/cn'

interface ShareTradeCardModalProps {
  trade: Trade | null
  isOpen: boolean
  onClose: () => void
}

export function ShareTradeCardModal({ trade, isOpen, onClose }: ShareTradeCardModalProps) {
  const [copied, setCopied] = useState(false)
  const [hideDollars, setHideDollars] = useState(false)

  if (!isOpen || !trade) return null

  const isWin = (trade.pnl ?? 0) >= 0
  const returnPct =
    trade.exit_price && trade.entry_price
      ? trade.direction === 'long'
        ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100
        : ((trade.entry_price - trade.exit_price) / trade.entry_price) * 100
      : 0

  const handleCopyLink = () => {
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-[#121212] shadow-2xl overflow-hidden">
        {/* Modal Topbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-[#141414]">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-profit" />
            <span className="text-sm font-semibold text-[#F4F4F5]">Share Trade Card</span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#F4F4F5]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* The Sleek Card Preview (This is what traders screenshot / export) */}
        <div className="p-6">
          <div
            id="quantyx-trade-card"
            className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-b from-[#18181B] via-[#141414] to-[#0D0D0E] p-6 shadow-2xl"
          >
            {/* Ambient background glow */}
            <div
              className={cn(
                'absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl opacity-20 pointer-events-none',
                isWin ? 'bg-profit' : 'bg-loss',
              )}
            />

            {/* Header: Brand & Timestamp */}
            <div className="flex items-center justify-between relative z-10 pb-4 border-b border-white/[0.06]">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-profit/20 border border-profit/30 text-profit font-mono font-bold text-xs">
                  Q
                </div>
                <span className="font-mono text-xs font-bold tracking-wider text-[#F4F4F5]">
                  QUANTYX<span className="text-profit">.AI</span>
                </span>
              </div>
              <span className="font-mono text-[11px] text-[#A1A1AA]">
                {format(parseISO(trade.entry_at), 'MMM d, yyyy')}
              </span>
            </div>

            {/* Symbol & Direction Hero */}
            <div className="flex items-center justify-between pt-5 pb-4 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-2xl font-extrabold tracking-tight text-[#F4F4F5]">
                    {trade.symbol}
                  </h3>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded font-mono text-[11px] font-bold uppercase tracking-wider',
                      trade.direction === 'long'
                        ? 'bg-profit/15 text-profit border border-profit/25'
                        : 'bg-loss/15 text-loss border border-loss/25',
                    )}
                  >
                    {trade.direction}
                  </span>
                </div>
                <span className="text-xs text-[#71717A] uppercase tracking-wider font-mono">
                  {trade.asset_class}
                </span>
              </div>

              {/* Big Result Badge */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {isWin ? (
                    <Award className="h-5 w-5 text-profit" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-loss rotate-180" />
                  )}
                  <span
                    className={cn(
                      'font-mono text-2xl font-black tabular-nums tracking-tight',
                      isWin ? 'text-profit' : 'text-loss',
                    )}
                  >
                    {hideDollars
                      ? trade.r_multiple
                        ? `${trade.r_multiple >= 0 ? '+' : ''}${trade.r_multiple.toFixed(2)}R`
                        : `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%`
                      : trade.pnl !== null
                      ? trade.pnl >= 0
                        ? `+$${trade.pnl.toFixed(2)}`
                        : `-$${Math.abs(trade.pnl).toFixed(2)}`
                      : '0.00'}
                  </span>
                </div>
                <div className="flex items-center justify-end gap-2 text-[11px] font-mono text-[#A1A1AA]">
                  {trade.r_multiple !== null && (
                    <span className="text-profit font-semibold">
                      {trade.r_multiple >= 0 ? '+' : ''}
                      {trade.r_multiple.toFixed(2)}R
                    </span>
                  )}
                  <span>({returnPct >= 0 ? '+' : ''}{returnPct.toFixed(2)}%)</span>
                </div>
              </div>
            </div>

            {/* Metrics Bento Row */}
            <div className="grid grid-cols-3 gap-2 py-3 px-3 rounded-lg bg-black/40 border border-white/[0.05] relative z-10 font-mono text-xs">
              <div>
                <span className="block text-[10px] text-[#71717A] uppercase">Entry Price</span>
                <span className="text-[#F4F4F5] font-semibold tabular-nums">
                  ${trade.entry_price.toLocaleString('en-US')}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#71717A] uppercase">Exit Price</span>
                <span className="text-[#F4F4F5] font-semibold tabular-nums">
                  {trade.exit_price ? `$${trade.exit_price.toLocaleString('en-US')}` : '—'}
                </span>
              </div>
              <div>
                <span className="block text-[10px] text-[#71717A] uppercase">Quantity</span>
                <span className="text-[#F4F4F5] font-semibold tabular-nums">{trade.quantity}</span>
              </div>
            </div>

            {/* Tags & Playbook */}
            {trade.tags && trade.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-3.5 relative z-10">
                {trade.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 rounded bg-white/[0.05] border border-white/[0.08] px-2 py-0.5 font-mono text-[10px] text-[#A1A1AA]"
                  >
                    <Flame className="h-2.5 w-2.5 text-profit" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modal Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-[#141414]">
          <button
            onClick={() => setHideDollars(!hideDollars)}
            className="flex items-center gap-2 text-xs text-[#A1A1AA] hover:text-[#F4F4F5] transition-colors"
          >
            {hideDollars ? (
              <EyeOff className="h-4 w-4 text-warning" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span>{hideDollars ? 'Showing R-Multiple Only' : 'Show R-Multiple Only (Hide $)'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.06] hover:bg-white/[0.1] text-xs font-medium text-[#F4F4F5] transition-colors"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-profit" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied Card!' : 'Copy Summary'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-profit text-[#0A0A0A] text-xs font-semibold hover:bg-profit/90 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
