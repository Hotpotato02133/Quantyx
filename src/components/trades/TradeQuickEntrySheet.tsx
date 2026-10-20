import React, { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  X,
  TrendingUp,
  TrendingDown,
  Calculator,
  UploadCloud,
  CheckCircle2,
  Trash2,
} from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { useFilterStore } from '@/store/useFilterStore'
import { useCreateTrade } from '@/hooks/useTrades'
import { calculateTradePnL, calculateRMultiple, round } from '@/lib/math'
import { uploadTradeScreenshot, type ImageUploadResult } from '@/lib/storage'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/cn'

// ─── Zod Schema with Financial Constraints ─────────────────────────────────────

const tradeSchema = z
  .object({
    symbol: z.string().min(1, 'Symbol is required').max(12, 'Symbol too long'),
    asset_class: z.enum(['crypto', 'equity', 'futures', 'forex', 'options'] as const),
    direction: z.enum(['long', 'short'] as const),
    entry_price: z.coerce.number().positive('Entry price must be > 0'),
    exit_price: z.coerce.number().positive('Exit price must be > 0').optional().or(z.literal('')),
    stop_price: z.coerce.number().positive('Stop loss must be > 0').optional().or(z.literal('')),
    target_price: z.coerce.number().positive('Take profit must be > 0').optional().or(z.literal('')),
    quantity: z.coerce.number().positive('Quantity must be > 0'),
    fees: z.coerce.number().min(0, 'Fees cannot be negative').optional().or(z.literal('')),
    entry_at: z.string().min(1, 'Entry date required'),
    exit_at: z.string().optional().or(z.literal('')),
    emotion_tag: z.enum(['CALM', 'FOMO', 'REVENGE', 'HESITANT', 'CONFIDENT']).optional(),
    tags: z.string().optional(),
    screenshot_url: z.string().optional(),
    notes: z.string().optional(),
  })
  .refine(
    (data) => {
      if (!data.stop_price || !data.entry_price) return true
      const stop = Number(data.stop_price)
      const entry = Number(data.entry_price)
      if (data.direction === 'long') {
        return stop < entry
      } else {
        return stop > entry
      }
    },
    {
      message: 'Stop loss is on the wrong side of entry for this direction',
      path: ['stop_price'],
    },
  )

type TradeFormValues = z.infer<typeof tradeSchema>

// ─── Input Primitives ──────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
  required,
}: {
  label: string
  error?: string
  children: React.ReactNode
  required?: boolean
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
        {label} {required && <span className="text-loss">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-loss">{error}</p>}
    </div>
  )
}

// ─── Live Preview Component ───────────────────────────────────────────────────

interface LivePreviewProps {
  direction: 'long' | 'short'
  entry: number
  exit?: number
  stop?: number
  qty: number
  fees?: number
}

function LivePreview({ direction, entry, exit, stop, qty, fees = 0 }: LivePreviewProps) {
  if (!entry || !qty) return null

  const hasExit = exit && exit > 0
  const hasStop = stop && stop > 0

  const pnlCalc = hasExit
    ? calculateTradePnL(direction, entry, exit, qty, fees)
    : null
  const rMultiple =
    pnlCalc !== null && hasStop
      ? calculateRMultiple(pnlCalc.net_pnl, entry, stop!, qty)
      : null
  const riskDollar = hasStop ? Math.abs(entry - stop!) * qty : null
  const riskPct = hasStop && entry > 0 ? (Math.abs(entry - stop!) / entry) * 100 : null

  return (
    <div className="rounded-lg border border-border bg-[#18181B]/80 p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Calculator className="h-3.5 w-3.5 text-profit" strokeWidth={2} />
          <span className="text-xs font-semibold text-[#F4F4F5]">Live Execution Preview</span>
        </div>
        {riskDollar !== null && (
          <span className="text-[11px] font-mono text-[#A1A1AA] tabular-nums">
            Risk: ${round(riskDollar, 2).toFixed(2)}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        {pnlCalc !== null && (
          <Badge
            variant={pnlCalc.net_pnl >= 0 ? 'profit' : 'destructive'}
            tabular
            className="text-xs px-2.5 py-1"
          >
            {pnlCalc.net_pnl >= 0 ? '+' : ''}${pnlCalc.net_pnl.toFixed(2)} Net PnL
          </Badge>
        )}

        {rMultiple !== null && (
          <Badge
            variant={rMultiple >= 0 ? 'profit' : 'destructive'}
            tabular
            className="text-xs px-2.5 py-1"
          >
            {rMultiple >= 0 ? '+' : ''}
            {rMultiple.toFixed(2)}R
          </Badge>
        )}

        {riskPct !== null && (
          <Badge
            variant="warning"
            tabular
            className="text-xs px-2.5 py-1"
          >
            {riskPct.toFixed(2)}% Risk
          </Badge>
        )}

        {pnlCalc === null && !hasStop && (
          <span className="text-xs text-[#71717A] italic">
            Enter Exit Price or Stop Loss to calculate projections
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main Quick Entry Sheet ───────────────────────────────────────────────────

export function TradeQuickEntrySheet() {
  const { tradeSheetOpen, setTradeSheetOpen } = useUiStore()
  const { accountId } = useFilterStore()
  const createTrade = useCreateTrade()

  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadResult, setUploadResult] = useState<ImageUploadResult | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TradeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tradeSchema) as any,
    defaultValues: {
      asset_class: 'futures',
      direction: 'long',
      entry_at: new Date().toISOString().slice(0, 16),
      fees: 0,
    },
  })

  const [direction, entry, exit, stop, qty, fees, screenshotUrl] = watch([
    'direction',
    'entry_price',
    'exit_price',
    'stop_price',
    'quantity',
    'fees',
    'screenshot_url',
  ])

  // Reset form when sheet opens
  useEffect(() => {
    if (tradeSheetOpen) {
      reset({
        asset_class: 'futures',
        direction: 'long',
        entry_at: new Date().toISOString().slice(0, 16),
        fees: 0,
      })
      setUploadResult(null)
    }
  }, [tradeSheetOpen, reset])

  // Handle client-side WebP compression and Supabase storage upload
  const handleImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingImage(true)
    try {
      const result = await uploadTradeScreenshot(file)
      setUploadResult(result)
      setValue('screenshot_url', result.url)
    } catch {
      // Fallback
    } finally {
      setUploadingImage(false)
    }
  }

  const handleRemoveScreenshot = () => {
    setValue('screenshot_url', '')
    setUploadResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const onSubmit = async (values: TradeFormValues) => {
    const hasExit = Boolean(values.exit_price && Number(values.exit_price) > 0)
    const status = hasExit ? 'closed' : 'open'

    await createTrade.mutateAsync({
      account_id: accountId ?? undefined,
      symbol: values.symbol.toUpperCase().trim(),
      asset_class: values.asset_class,
      direction: values.direction,
      status: status as 'open' | 'closed',
      entry_price: Number(values.entry_price),
      exit_price: values.exit_price ? Number(values.exit_price) : null,
      stop_price: values.stop_price ? Number(values.stop_price) : null,
      target_price: values.target_price ? Number(values.target_price) : null,
      quantity: Number(values.quantity),
      fees: values.fees ? Number(values.fees) : 0,
      entry_at: new Date(values.entry_at).toISOString(),
      exit_at: values.exit_at ? new Date(values.exit_at).toISOString() : null,
      emotion_tag: values.emotion_tag ?? null,
      notes: values.notes?.trim() || null,
      tags: values.tags
        ? values.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
      screenshot_url: values.screenshot_url?.trim() || null,
    })

    setTradeSheetOpen(false)
  }

  if (!tradeSheetOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-fade-in"
        onClick={() => setTradeSheetOpen(false)}
        aria-hidden="true"
      />

      {/* Sliding Sheet Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Log new trade"
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-[500px]',
          'border-l border-border bg-[#141414] shadow-2xl',
          'flex flex-col animate-slide-up duration-200',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#F4F4F5]">Log Trade Execution</h2>
            <p className="text-[11px] text-[#A1A1AA] mt-0.5">
              Quick Entry drawer • Trigger anytime with{' '}
              <kbd className="font-mono text-[10px] rounded border border-border bg-[#1C1C1E] px-1 py-0.5">
                Ctrl+N
              </kbd>
            </p>
          </div>
          <button
            type="button"
            onClick={() => setTradeSheetOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#F4F4F5] transition-colors"
            aria-label="Close sheet"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form
          onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
          className="flex-1 overflow-y-auto px-6 py-5 space-y-4"
        >
          {/* Direction toggle */}
          <div className="grid grid-cols-2 gap-2">
            <label className="cursor-pointer">
              <input type="radio" value="long" className="sr-only" {...register('direction')} />
              <div
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150',
                  direction === 'long'
                    ? 'border-profit/40 bg-profit/15 text-profit shadow-sm'
                    : 'border-border bg-[#18181B] text-[#A1A1AA] hover:border-profit/30',
                )}
              >
                <TrendingUp className="h-4 w-4" strokeWidth={2.5} />
                LONG
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="radio" value="short" className="sr-only" {...register('direction')} />
              <div
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border py-2.5 text-xs font-semibold uppercase tracking-wider transition-all duration-150',
                  direction === 'short'
                    ? 'border-loss/40 bg-loss/15 text-loss shadow-sm'
                    : 'border-border bg-[#18181B] text-[#A1A1AA] hover:border-loss/30',
                )}
              >
                <TrendingDown className="h-4 w-4" strokeWidth={2.5} />
                SHORT
              </div>
            </label>
          </div>

          {/* Symbol + Asset Class */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Symbol" error={errors.symbol?.message} required>
              <input
                placeholder="NQ1!, BTCUSDT..."
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 font-mono text-sm text-[#F4F4F5] placeholder-[#525252] outline-none uppercase focus:border-profit"
                {...register('symbol')}
              />
            </Field>
            <Field label="Asset Class">
              <select
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-[#F4F4F5] outline-none focus:border-profit cursor-pointer"
                {...register('asset_class')}
              >
                <option value="futures">Futures</option>
                <option value="crypto">Crypto</option>
                <option value="equity">Equities</option>
                <option value="forex">Forex</option>
                <option value="options">Options</option>
              </select>
            </Field>
          </div>

          {/* Entry Price, Exit Price, Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Entry Price" error={errors.entry_price?.message} required>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 font-mono text-sm text-[#F4F4F5] placeholder-[#525252] outline-none focus:border-profit tabular-nums"
                {...register('entry_price')}
              />
            </Field>
            <Field label="Exit Price" error={errors.exit_price?.message}>
              <input
                type="number"
                step="any"
                placeholder="0.00 (optional)"
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 font-mono text-sm text-[#F4F4F5] placeholder-[#525252] outline-none focus:border-profit tabular-nums"
                {...register('exit_price')}
              />
            </Field>
            <Field label="Quantity" error={errors.quantity?.message} required>
              <input
                type="number"
                step="any"
                placeholder="1.0"
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 font-mono text-sm text-[#F4F4F5] placeholder-[#525252] outline-none focus:border-profit tabular-nums"
                {...register('quantity')}
              />
            </Field>
          </div>

          {/* Stop Loss, Take Profit, Fees */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Stop Loss" error={errors.stop_price?.message}>
              <input
                type="number"
                step="any"
                placeholder="0.00"
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 font-mono text-sm text-[#F4F4F5] placeholder-[#525252] outline-none focus:border-profit tabular-nums"
                {...register('stop_price')}
              />
            </Field>
            <Field label="Take Profit">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 font-mono text-sm text-[#F4F4F5] placeholder-[#525252] outline-none focus:border-profit tabular-nums"
                {...register('target_price')}
              />
            </Field>
            <Field label="Fees ($)">
              <input
                type="number"
                step="any"
                placeholder="0.00"
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 font-mono text-sm text-[#F4F4F5] placeholder-[#525252] outline-none focus:border-profit tabular-nums"
                {...register('fees')}
              />
            </Field>
          </div>

          {/* Live Preview Badges */}
          <LivePreview
            direction={direction ?? 'long'}
            entry={Number(entry) || 0}
            exit={Number(exit) || undefined}
            stop={Number(stop) || undefined}
            qty={Number(qty) || 0}
            fees={Number(fees) || 0}
          />

          {/* Entry & Exit Timestamps */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entry Timestamp" error={errors.entry_at?.message} required>
              <input
                type="datetime-local"
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 font-mono text-xs text-[#F4F4F5] outline-none focus:border-profit"
                {...register('entry_at')}
              />
            </Field>
            <Field label="Exit Timestamp">
              <input
                type="datetime-local"
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 font-mono text-xs text-[#F4F4F5] outline-none focus:border-profit"
                {...register('exit_at')}
              />
            </Field>
          </div>

          {/* Psychology / Emotion Tag */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Psychological State">
              <select
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-xs text-[#F4F4F5] outline-none focus:border-profit cursor-pointer"
                {...register('emotion_tag')}
              >
                <option value="CALM">CALM (Disciplined)</option>
                <option value="CONFIDENT">CONFIDENT (A+ Setup)</option>
                <option value="FOMO">FOMO (Chasing)</option>
                <option value="REVENGE">REVENGE (Tilt)</option>
                <option value="HESITANT">HESITANT (Late Entry)</option>
              </select>
            </Field>
            <Field label="Playbook / Tags">
              <input
                placeholder="e.g. ICT, FVG, NYOpen"
                className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-xs text-[#F4F4F5] placeholder-[#525252] outline-none focus:border-profit"
                {...register('tags')}
              />
            </Field>
          </div>

          {/* Chart Screenshot Compression & Upload (Step 2.3) */}
          <div className="space-y-2 pt-1 border-t border-border/70">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-[#A1A1AA]">
                Chart Screenshot (WebP Compressed)
              </label>
              {uploadResult && (
                <span className="text-[10px] text-profit flex items-center gap-1 font-mono">
                  <CheckCircle2 className="h-3 w-3" />
                  Saved {uploadResult.compressionRatioPct}% ({uploadResult.originalSizeKB}KB → {uploadResult.compressedSizeKB}KB)
                </span>
              )}
            </div>

            {screenshotUrl ? (
              <div className="relative rounded-lg border border-border overflow-hidden bg-black/40 group">
                <img
                  src={screenshotUrl}
                  alt="Chart Screenshot"
                  className="w-full max-h-40 object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveScreenshot}
                  className="absolute top-2 right-2 p-1.5 rounded bg-black/80 text-loss hover:bg-black transition-colors"
                  title="Remove screenshot"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className={cn(
                  'cursor-pointer border-2 border-dashed border-border hover:border-profit/40 rounded-lg p-4 text-center transition-colors bg-[#18181B]/50',
                  uploadingImage && 'opacity-60 pointer-events-none',
                )}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageFile}
                  className="hidden"
                />
                <div className="flex flex-col items-center justify-center gap-1">
                  {uploadingImage ? (
                    <div className="flex items-center gap-2 text-xs text-profit py-1">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-profit border-t-transparent" />
                      <span>Compressing to WebP & uploading…</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="h-6 w-6 text-[#71717A]" />
                      <p className="text-xs font-medium text-[#F4F4F5]">
                        Drop chart screenshot or click to upload
                      </p>
                      <p className="text-[10px] text-[#A1A1AA]">
                        Auto-compressed client-side to WebP for instant loading
                      </p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Trade Notes */}
          <Field label="Execution Notes">
            <textarea
              placeholder="What was the setup trigger? How was risk managed?"
              rows={3}
              className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-xs text-[#F4F4F5] placeholder-[#525252] outline-none resize-none focus:border-profit"
              {...register('notes')}
            />
          </Field>
        </form>

        {/* Footer Actions */}
        <div className="flex items-center gap-3 border-t border-border px-6 py-4 bg-[#141414]">
          <Button
            type="button"
            variant="ghost"
            onClick={() => setTradeSheetOpen(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="default"
            loading={isSubmitting}
            onClick={() =>
              handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])()
            }
            className="flex-1"
          >
            Save Trade
          </Button>
        </div>
      </div>
    </>
  )
}
