import React, { useState } from 'react'
import {
  Share2,
  Image as ImageIcon,
  Upload,
  Edit3,
  Check,
  X,
} from 'lucide-react'
import { parseISO, differenceInMinutes } from 'date-fns'
import { MarkdownNote } from '@/components/trades/MarkdownNote'
import { ScreenshotLightbox } from '@/components/trades/ScreenshotLightbox'
import { ExecutionRating, PlaybookCell, EmotionCell } from '@/components/trades/InlineTradeCells'
import { uploadTradeScreenshot } from '@/lib/storage'
import { useUpdateTrade } from '@/hooks/useTrades'
import { useUiStore } from '@/store/useUiStore'
import { cn } from '@/lib/cn'
import type { Trade } from '@/types'

interface TradeDetailDrawerProps {
  trade: Trade
  onShare: (trade: Trade) => void
}

export function TradeDetailDrawer({ trade, onShare }: TradeDetailDrawerProps) {
  const { privacyMode } = useUiStore()
  const updateTradeMutation = useUpdateTrade()

  // Notes edit state
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [noteContent, setNoteContent] = useState(trade.notes || '')

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [activeImageIndex, setActiveImageIndex] = useState(0)

  // Upload state
  const [isUploading, setIsUploading] = useState(false)

  // Extract screenshots
  const allScreenshots = React.useMemo(() => {
    const list: string[] = []
    if (trade.screenshot_url) list.push(trade.screenshot_url)
    if (trade.screenshot_urls && Array.isArray(trade.screenshot_urls)) {
      trade.screenshot_urls.forEach((url) => {
        if (url && !list.includes(url)) list.push(url)
      })
    }
    return list
  }, [trade.screenshot_url, trade.screenshot_urls])

  const handleSaveNotes = () => {
    updateTradeMutation.mutate({
      id: trade.id,
      updates: { notes: noteContent },
    })
    setIsEditingNotes(false)
  }

  const handleScreenshotUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    try {
      const result = await uploadTradeScreenshot(file)
      const updatedList = Array.from(new Set([...allScreenshots, result.url]))
      updateTradeMutation.mutate({
        id: trade.id,
        updates: {
          screenshot_url: result.url,
          screenshot_urls: updatedList,
        },
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Calculate trade duration
  const tradeDuration = React.useMemo(() => {
    if (!trade.entry_at || !trade.exit_at) return null
    try {
      const minutes = differenceInMinutes(parseISO(trade.exit_at), parseISO(trade.entry_at))
      if (minutes < 60) return `${minutes}m`
      const hours = Math.floor(minutes / 60)
      const remainingMin = minutes % 60
      return `${hours}h ${remainingMin}m`
    } catch {
      return null
    }
  }, [trade.entry_at, trade.exit_at])

  // Initial risk amount
  const initialRisk =
    trade.stop_price && trade.entry_price && trade.quantity
      ? Math.abs(trade.entry_price - trade.stop_price) * trade.quantity
      : null

  const pnl = trade.pnl ?? 0
  const isPos = pnl >= 0

  return (
    <div className="rounded-lg border border-border/80 bg-[#141414] p-4 text-xs shadow-inner">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Markdown Notes & Checklist Score (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Header row: Playbook, Emotion, Execution Star Rating */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border/50">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#71717A]">
                Setup & State:
              </span>
              <PlaybookCell trade={trade} />
              <EmotionCell trade={trade} />
            </div>

            {/* Execution checklist 1-5 stars */}
            <div className="flex items-center gap-2 bg-[#1C1C1E] px-2.5 py-1 rounded-md border border-border/60">
              <span className="text-[11px] font-medium text-[#A1A1AA]">Execution:</span>
              <ExecutionRating tradeId={trade.id} rating={trade.execution_rating} />
            </div>
          </div>

          {/* Trader's Markdown Notes */}
          <div className="flex-1 flex flex-col bg-[#18181B] rounded-lg border border-border/70 p-3.5">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F4F5]">
                <Edit3 className="h-3.5 w-3.5 text-profit" />
                <span>Trade Journal & Markdown Notes</span>
              </div>
              {!isEditingNotes ? (
                <button
                  type="button"
                  onClick={() => setIsEditingNotes(true)}
                  className="text-[11px] text-profit hover:underline font-medium"
                >
                  Edit Note
                </button>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      setNoteContent(trade.notes || '')
                      setIsEditingNotes(false)
                    }}
                    className="p-1 rounded text-[#71717A] hover:text-[#F4F4F5]"
                    title="Cancel"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNotes}
                    className="flex items-center gap-1 px-2 py-0.5 rounded bg-profit text-[#0A0A0A] font-semibold text-[11px] hover:bg-profit/90"
                  >
                    <Check className="h-3 w-3" strokeWidth={3} />
                    <span>Save</span>
                  </button>
                </div>
              )}
            </div>

            <div className="pt-2.5 min-h-[90px]">
              {isEditingNotes ? (
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Record trade reasoning, context, and checklist adherence... Supports Markdown: # Heading, - List, **Bold**, `Code`"
                  className="w-full h-28 rounded border border-border bg-[#141414] p-2.5 font-mono text-xs text-[#F4F4F5] placeholder-[#71717A] outline-none focus:border-profit"
                />
              ) : trade.notes ? (
                <MarkdownNote content={trade.notes} />
              ) : (
                <p className="text-xs italic text-[#71717A]">
                  No journal notes logged for this execution.{' '}
                  <button
                    type="button"
                    onClick={() => setIsEditingNotes(true)}
                    className="text-profit hover:underline not-italic font-medium"
                  >
                    Add note
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Execution Metrics & Screenshot Carousel (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          {/* Numerical Meta Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-[#18181B] p-3 rounded-lg border border-border/70">
            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-semibold">Entry / Exit</span>
              <p className="font-mono text-xs text-[#F4F4F5] mt-0.5">
                ${Number(trade.entry_price).toFixed(2)} /{' '}
                {trade.exit_price ? `$${Number(trade.exit_price).toFixed(2)}` : 'OPEN'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-semibold">Stop Loss</span>
              <p className="font-mono text-xs text-loss mt-0.5">
                {trade.stop_price ? `$${Number(trade.stop_price).toFixed(2)}` : '—'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-semibold">Initial Risk</span>
              <p className="font-mono text-xs text-[#F4F4F5] mt-0.5">
                {initialRisk ? (
                  <span className={cn(privacyMode && 'blur-sm select-none')}>
                    ${initialRisk.toFixed(2)}
                  </span>
                ) : (
                  '—'
                )}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-semibold">Realized PnL</span>
              <p
                className={cn(
                  'font-mono text-xs font-semibold mt-0.5',
                  isPos ? 'text-profit' : 'text-loss',
                  privacyMode && 'blur-sm select-none',
                )}
              >
                {trade.pnl !== null ? `${isPos ? '+' : ''}$${trade.pnl.toFixed(2)}` : 'OPEN'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-semibold">R-Multiple</span>
              <p
                className={cn(
                  'font-mono text-xs font-semibold mt-0.5',
                  isPos ? 'text-profit' : 'text-loss',
                  privacyMode && 'blur-sm select-none',
                )}
              >
                {trade.r_multiple !== null ? `${trade.r_multiple > 0 ? '+' : ''}${trade.r_multiple.toFixed(2)}R` : '—'}
              </p>
            </div>

            <div>
              <span className="text-[10px] text-[#71717A] uppercase font-semibold">Duration</span>
              <p className="font-mono text-xs text-[#A1A1AA] mt-0.5">
                {tradeDuration || '—'}
              </p>
            </div>
          </div>

          {/* Screenshots Gallery & Lightbox Trigger */}
          <div className="bg-[#18181B] rounded-lg border border-border/70 p-3">
            <div className="flex items-center justify-between pb-2 border-b border-border/40">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-[#F4F4F5]">
                <ImageIcon className="h-3.5 w-3.5 text-profit" />
                <span>Chart Screenshots ({allScreenshots.length})</span>
              </div>

              {/* Upload screenshot button */}
              <label className="flex items-center gap-1 text-[11px] font-medium text-profit hover:underline cursor-pointer">
                <Upload className="h-3 w-3" />
                <span>{isUploading ? 'Uploading…' : 'Attach Chart'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleScreenshotUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-2.5">
              {allScreenshots.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {allScreenshots.map((img, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        setActiveImageIndex(idx)
                        setIsLightboxOpen(true)
                      }}
                      className="group relative h-16 w-24 rounded border border-border overflow-hidden cursor-pointer hover:border-profit transition-all"
                      title="Click to view full size chart in lightbox"
                    >
                      <img
                        src={img}
                        alt="Chart screenshot"
                        className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] text-white font-medium">Zoom</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-4 border border-dashed border-border/60 rounded-md text-[#71717A] text-center">
                  <ImageIcon className="h-5 w-5 mb-1 opacity-40" />
                  <p className="text-[11px]">No chart screenshot attached yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* Share Trade Card Footer CTA */}
          <div className="flex items-center justify-end pt-1">
            <button
              type="button"
              onClick={() => onShare(trade)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-profit/15 hover:bg-profit/25 text-profit border border-profit/30 text-xs font-semibold transition-colors"
            >
              <Share2 className="h-3.5 w-3.5" />
              <span>Generate Share Card</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lightbox Carousel */}
      <ScreenshotLightbox
        images={allScreenshots}
        initialIndex={activeImageIndex}
        isOpen={isLightboxOpen}
        onClose={() => setIsLightboxOpen(false)}
        tradeSymbol={trade.symbol}
      />
    </div>
  )
}
