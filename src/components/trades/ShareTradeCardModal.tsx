import { useState, useRef, useMemo } from 'react'
import { toPng, toBlob } from 'html-to-image'
import {
  X,
  Share2,
  Copy,
  Check,
  Eye,
  EyeOff,
  Flame,
  Award,
  Download,
  Image as ImageIcon,
  Star,
  Clock,
  ShieldCheck,
  TrendingUp,
  MessageSquare,
} from 'lucide-react'
import { format, parseISO, differenceInMinutes } from 'date-fns'
import type { Trade } from '@/types'
import { getPlaybookById, getPlaybookByTag } from '@/lib/playbooks'
import { cn } from '@/lib/cn'

interface ShareTradeCardModalProps {
  trade: Trade | null
  isOpen: boolean
  onClose: () => void
}

type MetricMode = 'dollars' | 'r-multiple' | 'percent'
type CardTheme = 'emerald' | 'obsidian' | 'cyan'

export function ShareTradeCardModal({ trade, isOpen, onClose }: ShareTradeCardModalProps) {
  const cardRef = useRef<HTMLDivElement>(null)

  // Customization controls
  const [metricMode, setMetricMode] = useState<MetricMode>('dollars')
  const [hideDollars, setHideDollars] = useState(false)
  const [showScreenshot, setShowScreenshot] = useState(true)
  const [theme, setTheme] = useState<CardTheme>('emerald')

  // Action status states
  const [isExporting, setIsExporting] = useState(false)
  const [isCopyingImage, setIsCopyingImage] = useState(false)
  const [copyStatus, setCopyStatus] = useState<'idle' | 'image-copied' | 'text-copied'>('idle')

  // Calculations
  const calculations = useMemo(() => {
    if (!trade) return null

    const pnl = trade.pnl ?? 0
    const isWin = pnl >= 0
    const returnPct =
      trade.exit_price && trade.entry_price
        ? trade.direction === 'long'
          ? ((trade.exit_price - trade.entry_price) / trade.entry_price) * 100
          : ((trade.entry_price - trade.exit_price) / trade.entry_price) * 100
        : 0

    // Trade duration
    let durationStr = ''
    if (trade.entry_at && trade.exit_at) {
      try {
        const mins = differenceInMinutes(parseISO(trade.exit_at), parseISO(trade.entry_at))
        if (mins < 60) durationStr = `${mins}m duration`
        else {
          const hrs = Math.floor(mins / 60)
          const rem = mins % 60
          durationStr = `${hrs}h ${rem}m duration`
        }
      } catch {
        // Ignore date parse issues
      }
    }

    // Risk : Reward ratio
    let rrRatio = ''
    if (trade.entry_price && trade.stop_price && trade.exit_price) {
      const riskPerUnit = Math.abs(trade.entry_price - trade.stop_price)
      const rewardPerUnit =
        trade.direction === 'long'
          ? trade.exit_price - trade.entry_price
          : trade.entry_price - trade.exit_price
      if (riskPerUnit > 0) {
        const ratio = rewardPerUnit / riskPerUnit
        rrRatio = `1 : ${ratio.toFixed(1)}`
      }
    }

    // Playbook resolution
    const playbook =
      getPlaybookById(trade.playbook_id) ||
      (trade.tags.length > 0 ? getPlaybookByTag(trade.tags[0]) : undefined)

    return {
      pnl,
      isWin,
      returnPct,
      durationStr,
      rrRatio,
      playbook,
    }
  }, [trade])

  if (!isOpen || !trade || !calculations) return null

  const { pnl, isWin, returnPct, durationStr, rrRatio, playbook } = calculations

  // Active display metric
  const displayMode = hideDollars && metricMode === 'dollars' ? 'r-multiple' : metricMode

  // Primary headline text
  let heroValue = ''
  let heroSub = ''

  if (displayMode === 'r-multiple') {
    heroValue = trade.r_multiple !== null ? `${trade.r_multiple >= 0 ? '+' : ''}${trade.r_multiple.toFixed(2)}R` : `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%`
    heroSub = `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}% Return`
  } else if (displayMode === 'percent') {
    heroValue = `${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%`
    heroSub = trade.r_multiple !== null ? `${trade.r_multiple >= 0 ? '+' : ''}${trade.r_multiple.toFixed(2)}R Gain` : ''
  } else {
    heroValue = `${pnl >= 0 ? '+' : '-'}$${Math.abs(pnl).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
    heroSub = `${trade.r_multiple !== null ? `${trade.r_multiple >= 0 ? '+' : ''}${trade.r_multiple.toFixed(2)}R • ` : ''}${returnPct >= 0 ? '+' : ''}${returnPct.toFixed(2)}%`
  }

  // Screenshots available
  const hasScreenshot = Boolean(trade.screenshot_url || (trade.screenshot_urls && trade.screenshot_urls.length > 0))
  const activeScreenshot = trade.screenshot_url || (trade.screenshot_urls && trade.screenshot_urls[0])

  // Download high-res PNG (2x pixelRatio)
  const handleDownloadPng = async () => {
    if (!cardRef.current) return
    setIsExporting(true)
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      })
      const link = document.createElement('a')
      link.download = `quantyx-trade-${trade.symbol}-${format(new Date(), 'yyyyMMdd-HHmm')}.png`
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Error generating card image:', err)
    } finally {
      setIsExporting(false)
    }
  }

  // Copy PNG image directly to clipboard
  const handleCopyImage = async () => {
    if (!cardRef.current) return
    setIsCopyingImage(true)
    try {
      const blob = await toBlob(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
      })
      if (blob && navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        const item = new ClipboardItem({ 'image/png': blob })
        await navigator.clipboard.write([item])
        setCopyStatus('image-copied')
        setTimeout(() => setCopyStatus('idle'), 2500)
        return
      }
      handleCopyText()
    } catch (err) {
      console.warn('Clipboard image copy not permitted by browser, falling back to text:', err)
      handleCopyText()
    } finally {
      setIsCopyingImage(false)
    }
  }

  // Copy social media / Discord formatted text
  const handleCopyText = () => {
    const emoji = isWin ? '🟢' : '🔴'
    const sign = isWin ? '+' : ''
    const rText = trade.r_multiple !== null ? ` | ${sign}${trade.r_multiple.toFixed(2)}R` : ''
    const pnlText = !hideDollars ? ` (${sign}$${pnl.toFixed(2)})` : ''
    const stars = trade.execution_rating ? `★`.repeat(trade.execution_rating) : ''
    const pbText = playbook ? `\n📊 Strategy: ${playbook.name}` : ''
    const emotionText = trade.emotion_tag ? `\n🧠 Mindset: ${trade.emotion_tag}` : ''
    const starsText = stars ? `\n⭐ Execution: ${stars}` : ''

    const message = `${emoji} $${trade.symbol} ${trade.direction.toUpperCase()}${rText}${pnlText}${pbText}${emotionText}${starsText}\nVerified via @Quantyx Terminal`

    navigator.clipboard.writeText(message)
    setCopyStatus('text-copied')
    setTimeout(() => setCopyStatus('idle'), 2500)
  }

  // Theme gradient tokens
  const themeGlow = {
    emerald: isWin ? 'rgba(29, 185, 84, 0.22)' : 'rgba(239, 68, 68, 0.22)',
    obsidian: 'rgba(255, 255, 255, 0.08)',
    cyan: isWin ? 'rgba(6, 182, 212, 0.22)' : 'rgba(244, 63, 94, 0.22)',
  }[theme]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#121214] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Topbar */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.08] bg-[#141416]">
          <div className="flex items-center gap-2">
            <Share2 className="h-4 w-4 text-profit" />
            <span className="text-sm font-semibold text-[#F4F4F5]">Share Trade Card</span>
            <span className="rounded bg-profit/15 px-2 py-0.5 text-[10px] font-mono font-semibold text-profit border border-profit/25">
              TradeZella Style
            </span>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#F4F4F5] transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Card Customization Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-2.5 bg-[#18181B]/80 border-b border-white/[0.06] text-xs">
          {/* Display metric mode */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#71717A] text-[11px] font-medium">Display:</span>
            <div className="flex rounded-md border border-white/[0.08] bg-black/40 p-0.5 text-[11px]">
              <button
                type="button"
                onClick={() => {
                  setMetricMode('dollars')
                  setHideDollars(false)
                }}
                className={cn(
                  'px-2 py-0.5 rounded font-medium transition-all',
                  !hideDollars && metricMode === 'dollars' ? 'bg-profit/20 text-profit font-semibold' : 'text-[#A1A1AA] hover:text-white',
                )}
              >
                Dollar ($)
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('r-multiple')}
                className={cn(
                  'px-2 py-0.5 rounded font-medium transition-all',
                  metricMode === 'r-multiple' ? 'bg-profit/20 text-profit font-semibold' : 'text-[#A1A1AA] hover:text-white',
                )}
              >
                R-Multiple
              </button>
              <button
                type="button"
                onClick={() => setMetricMode('percent')}
                className={cn(
                  'px-2 py-0.5 rounded font-medium transition-all',
                  metricMode === 'percent' ? 'bg-profit/20 text-profit font-semibold' : 'text-[#A1A1AA] hover:text-white',
                )}
              >
                Percent (%)
              </button>
            </div>
          </div>

          {/* Privacy Toggle: Hide Dollars */}
          <button
            type="button"
            onClick={() => setHideDollars(!hideDollars)}
            className={cn(
              'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border transition-all',
              hideDollars
                ? 'bg-warning/15 border-warning/30 text-warning font-medium'
                : 'bg-white/[0.04] border-white/[0.08] text-[#A1A1AA] hover:text-white',
            )}
          >
            {hideDollars ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
            <span>{hideDollars ? 'Protected Capital (On)' : 'Hide $ (Privacy)'}</span>
          </button>

          {/* Screenshot toggle */}
          {hasScreenshot && (
            <button
              type="button"
              onClick={() => setShowScreenshot(!showScreenshot)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] border transition-all',
                showScreenshot
                  ? 'bg-profit/15 border-profit/30 text-profit font-medium'
                  : 'bg-white/[0.04] border-white/[0.08] text-[#71717A] hover:text-[#A1A1AA]',
              )}
            >
              <ImageIcon className="h-3 w-3" />
              <span>Chart {showScreenshot ? 'Shown' : 'Hidden'}</span>
            </button>
          )}

          {/* Theme selector */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setTheme('emerald')}
              className={cn(
                'h-4 w-4 rounded-full bg-profit transition-transform',
                theme === 'emerald' ? 'ring-2 ring-white scale-110' : 'opacity-60',
              )}
              title="Emerald Theme"
            />
            <button
              type="button"
              onClick={() => setTheme('cyan')}
              className={cn(
                'h-4 w-4 rounded-full bg-cyan-400 transition-transform',
                theme === 'cyan' ? 'ring-2 ring-white scale-110' : 'opacity-60',
              )}
              title="Cyan Theme"
            />
            <button
              type="button"
              onClick={() => setTheme('obsidian')}
              className={cn(
                'h-4 w-4 rounded-full bg-zinc-600 transition-transform',
                theme === 'obsidian' ? 'ring-2 ring-white scale-110' : 'opacity-60',
              )}
              title="Obsidian Theme"
            />
          </div>
        </div>

        {/* The Card Preview (Captured by html-to-image) */}
        <div className="p-6 overflow-y-auto flex items-center justify-center bg-[#09090B]">
          <div
            ref={cardRef}
            id="quantyx-trade-card"
            style={{
              background: 'radial-gradient(circle at 85% 15%, var(--glow) 0%, #111114 60%, #0A0A0C 100%)',
              ['--glow' as string]: themeGlow,
            }}
            className="w-full max-w-[520px] rounded-2xl border border-white/12 p-6 shadow-2xl relative overflow-hidden select-none"
          >
            {/* Ambient Lighting Orbs */}
            <div
              className="absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl pointer-events-none"
              style={{ backgroundColor: themeGlow }}
            />

            {/* Header: Logo, Verified Execution & Timestamp */}
            <div className="flex items-center justify-between pb-4 border-b border-white/[0.08] relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-profit/20 border border-profit/35 text-profit font-mono font-bold text-xs shadow-inner">
                  Q
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-black tracking-wider text-[#F4F4F5]">
                      QUANTYX<span className="text-profit">.AI</span>
                    </span>
                    <span className="inline-flex items-center gap-1 rounded bg-profit/15 px-1.5 py-0.2 font-mono text-[9px] font-bold text-profit border border-profit/25">
                      <ShieldCheck className="h-2.5 w-2.5" />
                      VERIFIED
                    </span>
                  </div>
                  <span className="text-[10px] text-[#71717A] tracking-wider uppercase font-mono block">
                    Institutional Terminal
                  </span>
                </div>
              </div>

              <div className="text-right font-mono text-[11px] text-[#A1A1AA]">
                <div className="text-white font-medium">
                  {format(parseISO(trade.entry_at), 'MMM d, yyyy')}
                </div>
                {durationStr && (
                  <div className="text-[10px] text-[#71717A] flex items-center justify-end gap-1 mt-0.5">
                    <Clock className="h-2.5 w-2.5" />
                    <span>{durationStr}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Hero Section: Symbol + Side + Return */}
            <div className="flex items-center justify-between pt-5 pb-4 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-3xl font-black tracking-tight text-white">
                    {trade.symbol}
                  </h3>
                  <span
                    className={cn(
                      'px-2.5 py-0.5 rounded-md font-mono text-xs font-extrabold uppercase tracking-wider',
                      trade.direction === 'long'
                        ? 'bg-profit/20 text-profit border border-profit/35 shadow-sm'
                        : 'bg-loss/20 text-loss border border-loss/35 shadow-sm',
                    )}
                  >
                    {trade.direction}
                  </span>
                </div>

                <div className="mt-1 flex items-center gap-2">
                  <span className="text-[11px] text-[#71717A] font-mono uppercase tracking-wider">
                    {trade.asset_class}
                  </span>
                  {hideDollars && (
                    <span className="rounded bg-white/[0.06] border border-white/[0.08] px-1.5 py-0.2 text-[9px] font-mono text-[#A1A1AA]">
                      🔒 Capital Protected
                    </span>
                  )}
                </div>
              </div>

              {/* Big Result Badge */}
              <div className="text-right">
                <div className="flex items-center justify-end gap-1.5">
                  {isWin ? (
                    <Award className="h-6 w-6 text-profit shrink-0" />
                  ) : (
                    <TrendingUp className="h-6 w-6 text-loss rotate-180 shrink-0" />
                  )}
                  <span
                    className={cn(
                      'font-mono text-3xl font-black tabular-nums tracking-tight',
                      isWin ? 'text-profit' : 'text-loss',
                    )}
                  >
                    {heroValue}
                  </span>
                </div>

                {heroSub && (
                  <p className="text-[11px] font-mono text-[#A1A1AA] mt-0.5 font-medium">
                    {heroSub}
                  </p>
                )}
              </div>
            </div>

            {/* Metrics Bento Row (Entry, Exit, R:R, Execution Rating) */}
            <div className="grid grid-cols-4 gap-2 py-3 px-3.5 rounded-xl bg-black/50 border border-white/[0.07] relative z-10 font-mono text-xs">
              <div>
                <span className="block text-[10px] text-[#71717A] uppercase font-semibold">Entry</span>
                <span className="text-[#F4F4F5] font-bold tabular-nums">
                  ${trade.entry_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-[#71717A] uppercase font-semibold">Exit</span>
                <span className="text-[#F4F4F5] font-bold tabular-nums">
                  {trade.exit_price ? `$${trade.exit_price.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-[#71717A] uppercase font-semibold">R : R</span>
                <span className="text-profit font-bold tabular-nums">
                  {rrRatio || (trade.r_multiple ? `1 : ${Math.abs(trade.r_multiple).toFixed(1)}` : '1 : 2.5')}
                </span>
              </div>

              <div>
                <span className="block text-[10px] text-[#71717A] uppercase font-semibold">Rating</span>
                <div className="flex items-center gap-0.5 text-warning pt-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        'h-3 w-3',
                        i < (trade.execution_rating ?? 5)
                          ? 'fill-warning text-warning'
                          : 'text-[#3F3F46]',
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Strategy & Mindset Bento Row */}
            <div className="mt-2.5 flex items-center justify-between gap-2 relative z-10">
              <div className="flex flex-wrap items-center gap-1.5">
                {playbook && (
                  <span
                    className="inline-flex items-center gap-1 rounded-md px-2 py-0.8 font-mono text-[10px] font-semibold border"
                    style={{
                      backgroundColor: `${playbook.color}20`,
                      borderColor: `${playbook.color}40`,
                      color: playbook.color,
                    }}
                  >
                    <Flame className="h-3 w-3" />
                    <span>{playbook.name}</span>
                  </span>
                )}

                {trade.emotion_tag && (
                  <span className="inline-flex items-center gap-1 rounded-md bg-white/[0.06] border border-white/[0.1] px-2 py-0.8 font-mono text-[10px] text-[#D4D4D8]">
                    <span>{trade.emotion_tag}</span>
                  </span>
                )}
              </div>

              <span className="text-[10px] font-mono text-[#71717A]">
                Qty: {trade.quantity}
              </span>
            </div>

            {/* Attached Screenshot Preview (If enabled and available) */}
            {hasScreenshot && showScreenshot && activeScreenshot && (
              <div className="mt-3 relative z-10 rounded-lg overflow-hidden border border-white/10 bg-black/60 max-h-36">
                <img
                  src={activeScreenshot}
                  alt={`Chart ${trade.symbol}`}
                  className="w-full h-full object-cover object-top opacity-90"
                  crossOrigin="anonymous"
                />
              </div>
            )}

            {/* Footer Watermark */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between text-[10px] font-mono text-[#71717A] relative z-10">
              <span>quantyx.trade</span>
              <span>Proprietary Analytics Terminal</span>
            </div>
          </div>
        </div>

        {/* Modal Action Controls Footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-t border-white/[0.08] bg-[#141416]">
          {/* Status feedback message */}
          <div className="text-xs text-[#A1A1AA]">
            {copyStatus === 'image-copied' && (
              <span className="inline-flex items-center gap-1 text-profit font-medium animate-in fade-in">
                <Check className="h-3.5 w-3.5" />
                Image copied to clipboard! Paste directly into Discord (Ctrl+V)
              </span>
            )}
            {copyStatus === 'text-copied' && (
              <span className="inline-flex items-center gap-1 text-profit font-medium animate-in fade-in">
                <Check className="h-3.5 w-3.5" />
                Social Markdown summary copied to clipboard!
              </span>
            )}
            {copyStatus === 'idle' && (
              <span className="text-[#71717A]">
                Ready to share on Discord, X, or Telegram
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Copy Social Text */}
            <button
              type="button"
              onClick={handleCopyText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] hover:bg-white/[0.08] text-xs font-medium text-[#F4F4F5] transition-all"
              title="Copy text summary for Discord"
            >
              <MessageSquare className="h-3.5 w-3.5 text-[#A1A1AA]" />
              <span>Copy Text</span>
            </button>

            {/* Copy Image Button */}
            <button
              type="button"
              onClick={handleCopyImage}
              disabled={isCopyingImage}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-profit/30 bg-profit/15 hover:bg-profit/25 text-xs font-semibold text-profit transition-all disabled:opacity-50"
            >
              {copyStatus === 'image-copied' ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>{isCopyingImage ? 'Copying…' : 'Copy Image'}</span>
            </button>

            {/* Download PNG Button */}
            <button
              type="button"
              onClick={handleDownloadPng}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-profit text-[#0A0A0A] text-xs font-bold hover:bg-profit/90 active:scale-95 transition-all disabled:opacity-50"
            >
              <Download className="h-3.5 w-3.5" strokeWidth={2.5} />
              <span>{isExporting ? 'Generating…' : 'Download PNG'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
