import React, { useState, useRef, useEffect } from 'react'
import { ChevronDown, Star, Sparkles, BookOpen } from 'lucide-react'
import { DEFAULT_PLAYBOOKS, EMOTION_TAGS, getEmotionTag } from '@/lib/playbooks'
import { useUpdateTrade } from '@/hooks/useTrades'
import type { Trade } from '@/types'
import { cn } from '@/lib/cn'

// ─── Inline Playbook Dropdown Cell ──────────────────────────────────────────

interface PlaybookCellProps {
  trade: Trade
}

export function PlaybookCell({ trade }: PlaybookCellProps) {
  const updateTradeMutation = useUpdateTrade()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Determine active playbook from playbook_id or matching tag
  const activePlaybook = DEFAULT_PLAYBOOKS.find(
    (p) =>
      p.id === trade.playbook_id ||
      trade.tags?.some((t) => t.toLowerCase() === p.tag.toLowerCase() || t.toLowerCase() === p.name.toLowerCase()),
  )

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  const handleSelectPlaybook = (playbookId: string | null) => {
    setIsOpen(false)
    if (!playbookId) {
      // Clear playbook
      const newTags = (trade.tags || []).filter(
        (t) => !DEFAULT_PLAYBOOKS.some((p) => p.tag.toLowerCase() === t.toLowerCase() || p.name.toLowerCase() === t.toLowerCase()),
      )
      updateTradeMutation.mutate({
        id: trade.id,
        updates: { playbook_id: null, tags: newTags },
      })
      return
    }

    const selected = DEFAULT_PLAYBOOKS.find((p) => p.id === playbookId)
    if (!selected) return

    // Update playbook and ensure playbook tag is in tags
    const cleanedTags = (trade.tags || []).filter(
      (t) => !DEFAULT_PLAYBOOKS.some((p) => p.tag.toLowerCase() === t.toLowerCase() || p.name.toLowerCase() === t.toLowerCase()),
    )
    const updatedTags = Array.from(new Set([selected.tag, ...cleanedTags]))

    updateTradeMutation.mutate({
      id: trade.id,
      updates: {
        playbook_id: selected.id,
        tags: updatedTags,
      },
    })
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-all duration-150',
          activePlaybook
            ? 'bg-white/[0.04] hover:bg-white/[0.08] text-[#F4F4F5] border border-border/80'
            : 'text-[#71717A] hover:text-[#A1A1AA] hover:bg-white/[0.03] border border-dashed border-border/60',
        )}
        title="Click to change Playbook setup"
      >
        {activePlaybook ? (
          <>
            <span
              className="h-2 w-2 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: activePlaybook.color }}
            />
            <span className="truncate max-w-[110px]">{activePlaybook.name}</span>
          </>
        ) : (
          <>
            <BookOpen className="h-3 w-3 opacity-60" />
            <span>+ Playbook</span>
          </>
        )}
        <ChevronDown className="h-3 w-3 opacity-40 group-hover:opacity-100 transition-opacity" />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-40 mt-1 w-52 rounded-lg border border-border bg-[#1C1C1E] p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#71717A]">
            Select Playbook
          </div>
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {DEFAULT_PLAYBOOKS.map((pb) => {
              const isSelected = activePlaybook?.id === pb.id
              return (
                <button
                  key={pb.id}
                  type="button"
                  onClick={() => handleSelectPlaybook(pb.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded px-2 py-1.5 text-xs text-left transition-colors',
                    isSelected
                      ? 'bg-profit/15 text-profit font-medium'
                      : 'text-[#D4D4D8] hover:bg-white/[0.06] hover:text-[#F4F4F5]',
                  )}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: pb.color }}
                    />
                    <span className="truncate">{pb.name}</span>
                  </div>
                  {isSelected && <span className="text-[10px] text-profit shrink-0">✓</span>}
                </button>
              )
            })}
            {activePlaybook && (
              <button
                type="button"
                onClick={() => handleSelectPlaybook(null)}
                className="w-full text-left rounded px-2 py-1 text-[11px] text-loss hover:bg-loss/10 transition-colors border-t border-border/40 mt-1"
              >
                Clear Playbook
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Inline Emotion Dropdown Cell ───────────────────────────────────────────

interface EmotionCellProps {
  trade: Trade
}

export function EmotionCell({ trade }: EmotionCellProps) {
  const updateTradeMutation = useUpdateTrade()
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const activeEmotion = getEmotionTag(trade.emotion_tag)

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick)
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [isOpen])

  const handleSelectEmotion = (emotionId: string | null) => {
    setIsOpen(false)
    updateTradeMutation.mutate({
      id: trade.id,
      updates: {
        emotion_tag: emotionId,
      },
    })
  }

  return (
    <div ref={containerRef} className="relative inline-block text-left" onClick={(e) => e.stopPropagation()}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'group flex items-center gap-1.5 rounded px-2 py-0.5 text-[11px] font-medium transition-all duration-150 border',
          activeEmotion
            ? `${activeEmotion.bgColor} ${activeEmotion.borderColor}`
            : 'border-dashed border-border/60 text-[#71717A] hover:text-[#A1A1AA] hover:bg-white/[0.03]',
        )}
        style={activeEmotion ? { color: activeEmotion.color } : undefined}
        title="Click to log emotional/psychological state"
      >
        {activeEmotion ? (
          <span>{activeEmotion.label}</span>
        ) : (
          <>
            <Sparkles className="h-2.5 w-2.5 opacity-60" />
            <span>+ Emotion</span>
          </>
        )}
        <ChevronDown className="h-2.5 w-2.5 opacity-40 group-hover:opacity-100 transition-opacity" />
      </button>

      {isOpen && (
        <div className="absolute left-0 z-40 mt-1 w-44 rounded-lg border border-border bg-[#1C1C1E] p-1 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-100">
          <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#71717A]">
            Psychology / State
          </div>
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {EMOTION_TAGS.map((em) => {
              const isSelected = activeEmotion?.id === em.id
              return (
                <button
                  key={em.id}
                  type="button"
                  onClick={() => handleSelectEmotion(em.id)}
                  className={cn(
                    'flex w-full items-center justify-between rounded px-2 py-1 text-xs text-left transition-colors',
                    isSelected
                      ? 'bg-white/[0.1] font-semibold'
                      : 'text-[#D4D4D8] hover:bg-white/[0.06]',
                  )}
                  style={{ color: em.color }}
                >
                  <span>{em.label}</span>
                  {isSelected && <span className="text-[10px]">✓</span>}
                </button>
              )
            })}
            {activeEmotion && (
              <button
                type="button"
                onClick={() => handleSelectEmotion(null)}
                className="w-full text-left rounded px-2 py-1 text-[11px] text-loss hover:bg-loss/10 transition-colors border-t border-border/40 mt-1"
              >
                Clear Emotion
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Execution Rating Stars (1–5 Stars) ──────────────────────────────────────

interface ExecutionRatingProps {
  tradeId: string
  rating?: number | null
}

export function ExecutionRating({ tradeId, rating }: ExecutionRatingProps) {
  const updateTradeMutation = useUpdateTrade()
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const currentRating = rating ?? 0

  const handleRate = (stars: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const next = currentRating === stars ? null : stars
    updateTradeMutation.mutate({
      id: tradeId,
      updates: { execution_rating: next },
    })
  }

  return (
    <div
      className="inline-flex items-center gap-1 select-none"
      onClick={(e) => e.stopPropagation()}
      onMouseLeave={() => setHoverRating(null)}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating ?? currentRating) >= star
        return (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHoverRating(star)}
            onClick={(e) => handleRate(star, e)}
            className="p-0.5 rounded transition-transform hover:scale-110 active:scale-90"
            title={`Rate execution ${star}/5 stars`}
            aria-label={`Rate ${star} stars`}
          >
            <Star
              className={cn(
                'h-3.5 w-3.5 transition-colors',
                isFilled
                  ? 'text-[#FF8C43] fill-[#FF8C43]'
                  : 'text-[#525252] hover:text-[#A1A1AA]',
              )}
            />
          </button>
        )
      })}
      {currentRating > 0 && (
        <span className="font-mono text-[10px] text-[#A1A1AA] ml-1">
          {currentRating}/5
        </span>
      )}
    </div>
  )
}
