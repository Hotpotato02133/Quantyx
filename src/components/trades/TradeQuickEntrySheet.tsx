import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, TrendingUp, TrendingDown, Calculator } from 'lucide-react'
import { useUiStore } from '@/store/useUiStore'
import { useCreateTrade } from '@/hooks/useTrades'
import { calcPnL, calcRMultiple } from '@/lib/math'
import { cn } from '@/lib/cn'

// ─── Zod Schema ───────────────────────────────────────────────────────────────

const tradeSchema = z.object({
  symbol: z.string().min(1, 'Symbol is required'),
  asset_class: z.enum(['equity', 'futures', 'forex', 'crypto', 'options'] as const),
  direction: z.enum(['long', 'short'] as const),
  entry_price: z.coerce.number().positive('Must be > 0'),
  exit_price: z.coerce.number().positive().optional().or(z.literal('')),
  stop_price: z.coerce.number().positive().optional().or(z.literal('')),
  target_price: z.coerce.number().positive().optional().or(z.literal('')),
  quantity: z.coerce.number().positive('Must be > 0'),
  entry_at: z.string().min(1, 'Entry date required'),
  exit_at: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  screenshot_url: z.string().optional(),
})

type TradeFormValues = z.infer<typeof tradeSchema>

// ─── Input primitive ──────────────────────────────────────────────────────────

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

function FormInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-md border border-border bg-canvas px-3 py-2 font-mono text-sm text-[#F4F4F5]',
        'placeholder-[#525252] outline-none transition-colors duration-150',
        'focus:border-profit/50 focus:ring-1 focus:ring-profit/20',
        className,
      )}
      {...props}
    />
  )
}

function FormSelect({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-[#F4F4F5]',
        'outline-none transition-colors duration-150 cursor-pointer',
        'focus:border-profit/50 focus:ring-1 focus:ring-profit/20',
        className,
      )}
      {...props}
    >
      {children}
    </select>
  )
}

// ─── Live Preview Badge ───────────────────────────────────────────────────────

interface LivePreviewProps {
  direction: 'long' | 'short'
  entry: number
  exit?: number
  stop?: number
  qty: number
}

function LivePreview({ direction, entry, exit, stop, qty }: LivePreviewProps) {
  if (!entry || !qty) return null

  const hasExit = exit && exit > 0
  const hasStop = stop && stop > 0

  const pnl = hasExit ? calcPnL(direction, entry, exit, qty) : null
  const rMultiple =
    pnl !== null && hasStop ? calcRMultiple(pnl, entry, stop!, qty) : null
  const riskPct = hasStop && entry > 0 ? (Math.abs(entry - stop!) / entry) * 100 : null

  return (
    <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-canvas/50 p-3">
      <div className="flex items-center gap-1.5">
        <Calculator className="h-3.5 w-3.5 text-[#525252]" strokeWidth={1.75} />
        <span className="text-[11px] text-[#525252]">Live Preview</span>
      </div>

      {pnl !== null && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-medium',
            pnl >= 0
              ? 'bg-profit/10 text-profit border border-profit/20'
              : 'bg-loss/10 text-loss border border-loss/20',
          )}
        >
          {pnl >= 0 ? '+' : ''}${Math.abs(pnl).toFixed(2)} P&amp;L
        </span>
      )}

      {rMultiple !== null && (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-xs font-medium',
            rMultiple >= 0
              ? 'bg-profit/10 text-profit border border-profit/20'
              : 'bg-loss/10 text-loss border border-loss/20',
          )}
        >
          {rMultiple >= 0 ? '+' : ''}
          {rMultiple.toFixed(2)}R
        </span>
      )}

      {riskPct !== null && (
        <span className="inline-flex items-center gap-1 rounded-md bg-warning/10 text-warning border border-warning/20 px-2 py-0.5 font-mono text-xs font-medium">
          {riskPct.toFixed(2)}% Risk
        </span>
      )}
    </div>
  )
}

// ─── Sheet ────────────────────────────────────────────────────────────────────

export function TradeQuickEntrySheet() {
  const { tradeSheetOpen, setTradeSheetOpen } = useUiStore()
  const createTrade = useCreateTrade()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TradeFormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(tradeSchema) as any,
    defaultValues: {
      asset_class: 'crypto',
      direction: 'long',
      entry_at: new Date().toISOString().slice(0, 16),
    },
  })

  const [direction, entry, exit, stop, qty] = watch([
    'direction',
    'entry_price',
    'exit_price',
    'stop_price',
    'quantity',
  ])

  useEffect(() => {
    if (tradeSheetOpen) reset()
  }, [tradeSheetOpen, reset])

  const onSubmit = async (values: TradeFormValues) => {
    await createTrade.mutateAsync({
      symbol: values.symbol.toUpperCase(),
      asset_class: values.asset_class,
      direction: values.direction,
      status: 'closed',
      entry_price: Number(values.entry_price),
      exit_price: values.exit_price ? Number(values.exit_price) : null,
      stop_price: values.stop_price ? Number(values.stop_price) : null,
      target_price: values.target_price ? Number(values.target_price) : null,
      quantity: Number(values.quantity),
      entry_at: new Date(values.entry_at).toISOString(),
      exit_at: values.exit_at ? new Date(values.exit_at).toISOString() : null,
      notes: values.notes ?? null,
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
        className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm animate-fade-in"
        onClick={() => setTradeSheetOpen(false)}
        aria-hidden="true"
      />

      {/* Sheet Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Log new trade"
        className={cn(
          'fixed right-0 top-0 z-50 h-full w-full max-w-[480px]',
          'border-l border-border bg-surface shadow-2xl',
          'flex flex-col animate-slide-up',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-[#F4F4F5]">Log Trade</h2>
            <p className="text-[11px] text-[#A1A1AA] mt-0.5">
              Press{' '}
              <kbd className="font-mono text-[10px] rounded border border-border px-1 py-0.5">
                Ctrl+N
              </kbd>{' '}
              to open
            </p>
          </div>
          <button
            onClick={() => setTradeSheetOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-md text-[#A1A1AA] hover:bg-white/[0.06] hover:text-[#F4F4F5] transition-colors"
            aria-label="Close sheet"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])}
          className="flex-1 overflow-y-auto px-5 py-4 space-y-4"
        >
          {/* Direction toggle */}
          <div className="flex gap-2">
            <label className="flex-1 cursor-pointer">
              <input type="radio" value="long" className="sr-only" {...register('direction')} />
              <div
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all duration-150',
                  direction === 'long'
                    ? 'border-profit/40 bg-profit/10 text-profit'
                    : 'border-border bg-canvas text-[#A1A1AA] hover:border-profit/20',
                )}
              >
                <TrendingUp className="h-4 w-4" strokeWidth={2} />
                LONG
              </div>
            </label>
            <label className="flex-1 cursor-pointer">
              <input type="radio" value="short" className="sr-only" {...register('direction')} />
              <div
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-medium transition-all duration-150',
                  direction === 'short'
                    ? 'border-loss/40 bg-loss/10 text-loss'
                    : 'border-border bg-canvas text-[#A1A1AA] hover:border-loss/20',
                )}
              >
                <TrendingDown className="h-4 w-4" strokeWidth={2} />
                SHORT
              </div>
            </label>
          </div>

          {/* Symbol + Asset Class */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Symbol" error={errors.symbol?.message} required>
              <FormInput
                placeholder="BTCUSDT"
                className="uppercase"
                {...register('symbol')}
              />
            </Field>
            <Field label="Asset Class">
              <FormSelect {...register('asset_class')}>
                <option value="crypto">Crypto</option>
                <option value="equity">Equity</option>
                <option value="futures">Futures</option>
                <option value="forex">Forex</option>
                <option value="options">Options</option>
              </FormSelect>
            </Field>
          </div>

          {/* Entry / Exit / Qty */}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Entry Price" error={errors.entry_price?.message} required>
              <FormInput
                type="number"
                step="any"
                placeholder="0.00"
                {...register('entry_price')}
              />
            </Field>
            <Field label="Exit Price" error={errors.exit_price?.message}>
              <FormInput
                type="number"
                step="any"
                placeholder="0.00"
                {...register('exit_price')}
              />
            </Field>
            <Field label="Quantity" error={errors.quantity?.message} required>
              <FormInput
                type="number"
                step="any"
                placeholder="1.00"
                {...register('quantity')}
              />
            </Field>
          </div>

          {/* Stop / Target */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Stop Loss">
              <FormInput
                type="number"
                step="any"
                placeholder="0.00"
                {...register('stop_price')}
              />
            </Field>
            <Field label="Take Profit">
              <FormInput
                type="number"
                step="any"
                placeholder="0.00"
                {...register('target_price')}
              />
            </Field>
          </div>

          {/* Live Preview */}
          <LivePreview
            direction={direction ?? 'long'}
            entry={Number(entry) || 0}
            exit={Number(exit) || undefined}
            stop={Number(stop) || undefined}
            qty={Number(qty) || 0}
          />

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Entry Date" error={errors.entry_at?.message} required>
              <FormInput type="datetime-local" {...register('entry_at')} />
            </Field>
            <Field label="Exit Date">
              <FormInput type="datetime-local" {...register('exit_at')} />
            </Field>
          </div>

          {/* Tags */}
          <Field label="Tags (comma-separated)">
            <FormInput placeholder="ICT, BOS, FOMO..." {...register('tags')} />
          </Field>

          {/* Screenshot */}
          <Field label="Chart Screenshot Link">
            <FormInput placeholder="https://www.tradingview.com/x/... or image URL" {...register('screenshot_url')} />
          </Field>

          {/* Notes */}
          <Field label="Notes">
            <textarea
              placeholder="What was your thesis? What did you execute well?"
              rows={3}
              className={cn(
                'w-full rounded-md border border-border bg-canvas px-3 py-2 text-sm text-[#F4F4F5]',
                'placeholder-[#525252] outline-none transition-colors duration-150 resize-none',
                'focus:border-profit/50 focus:ring-1 focus:ring-profit/20',
              )}
              {...register('notes')}
            />
          </Field>
        </form>

        {/* Footer */}
        <div className="flex gap-3 border-t border-border px-5 py-4">
          <button
            type="button"
            onClick={() => setTradeSheetOpen(false)}
            className="flex-1 rounded-lg border border-border py-2 text-sm text-[#A1A1AA] hover:bg-white/[0.05] hover:text-[#F4F4F5] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() =>
              handleSubmit(onSubmit as Parameters<typeof handleSubmit>[0])()
            }
            disabled={isSubmitting}
            className={cn(
              'flex-1 rounded-lg bg-profit py-2 text-sm font-semibold text-[#0A0A0A] transition-all duration-150',
              'hover:bg-profit/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed',
            )}
          >
            {isSubmitting ? 'Saving…' : 'Log Trade'}
          </button>
        </div>
      </div>
    </>
  )
}
