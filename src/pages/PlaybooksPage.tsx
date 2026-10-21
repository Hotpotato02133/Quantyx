import { useState, useMemo } from 'react'
import {
  BookMarked,
  Plus,
  CheckCircle2,
  Circle,
  X,
  Target,
} from 'lucide-react'
import { AppShell } from '@/components/layout/AppShell'
import { useTrades } from '@/hooks/useTrades'
import { useUiStore } from '@/store/useUiStore'
import { cn } from '@/lib/cn'

import { DEFAULT_PLAYBOOKS, type PlaybookItem as Playbook } from '@/lib/playbooks'


export default function PlaybooksPage() {
  const { data: trades = [] } = useTrades()
  const { privacyMode } = useUiStore()
  const [playbooks, setPlaybooks] = useState<Playbook[]>(DEFAULT_PLAYBOOKS)
  const [selectedPlaybook, setSelectedPlaybook] = useState<Playbook>(DEFAULT_PLAYBOOKS[0])
  const [checkedRules, setCheckedRules] = useState<{ [key: string]: boolean }>({})
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [tag, setTag] = useState('')
  const [description, setDescription] = useState('')
  const [rulesInput, setRulesInput] = useState('')

  // Calculate live stats for selected playbook
  const playbookStats = useMemo(() => {
    const matching = trades.filter((t) =>
      t.tags?.some((tg) => tg.toLowerCase().includes(selectedPlaybook.tag.toLowerCase())),
    )
    const closed = matching.filter((t) => t.status === 'closed' && t.pnl !== null)
    const pnls = closed.map((t) => t.pnl!)
    const wins = pnls.filter((p) => p > 0)
    const totalPnL = pnls.reduce((s, p) => s + p, 0)
    const winRate = closed.length > 0 ? (wins.length / closed.length) * 100 : 0

    return {
      totalTrades: closed.length,
      winRate,
      totalPnL,
    }
  }, [trades, selectedPlaybook])

  const toggleRule = (ruleKey: string) => {
    setCheckedRules((prev) => ({
      ...prev,
      [ruleKey]: !prev[ruleKey],
    }))
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    const newPb: Playbook = {
      id: `pb_${Date.now()}`,
      name: name.trim(),
      tag: tag.trim() || name.replace(/\s+/g, ''),
      color: '#1DB954',
      description: description.trim() || 'Custom trading setup rules.',
      assetClass: 'Multi-Asset',
      rules: rulesInput
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean),
    }

    setPlaybooks((prev) => [...prev, newPb])
    setSelectedPlaybook(newPb)
    setIsNewModalOpen(false)
    setName('')
    setTag('')
    setDescription('')
    setRulesInput('')
  }

  return (
    <AppShell>
      <div className="px-6 py-5 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-[#F4F4F5] tracking-tight">Playbooks</h1>
            <p className="mt-0.5 text-sm text-[#A1A1AA]">
              Define and enforce systematic strategy setups, checklists, and edge metrics
            </p>
          </div>
          <button
            onClick={() => setIsNewModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-profit text-[#0A0A0A] text-sm font-semibold hover:bg-profit/90 active:scale-95 transition-all"
          >
            <Plus className="h-3.5 w-3.5" strokeWidth={2.5} />
            <span>New Playbook</span>
          </button>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left Column: Playbooks List */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-[#A1A1AA] uppercase tracking-wider block px-1">
              Active Strategies ({playbooks.length})
            </span>

            {playbooks.map((pb) => {
              const isSelected = pb.id === selectedPlaybook.id
              return (
                <div
                  key={pb.id}
                  onClick={() => setSelectedPlaybook(pb)}
                  className={cn(
                    'p-4 rounded-xl border cursor-pointer transition-all duration-150',
                    isSelected
                      ? 'border-profit/60 bg-white/[0.04] shadow-lg'
                      : 'border-border bg-surface hover:bg-white/[0.02]',
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: pb.color }}
                      />
                      <h3 className="text-sm font-semibold text-[#F4F4F5]">{pb.name}</h3>
                    </div>
                    <span className="font-mono text-[10px] text-[#A1A1AA] rounded bg-white/[0.05] px-1.5 py-0.5">
                      #{pb.tag}
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-2 line-clamp-2 leading-relaxed">
                    {pb.description}
                  </p>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-border/50 text-[11px] text-[#71717A]">
                    <span>{pb.rules.length} Checklist Rules</span>
                    <span className="text-[#A1A1AA]">{pb.assetClass}</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Right Columns: Playbook Details & Execution Checklist */}
          <div className="lg:col-span-2 space-y-4">
            {/* Header Details Card */}
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="h-3 w-3 rounded-full shrink-0"
                      style={{ backgroundColor: selectedPlaybook.color }}
                    />
                    <h2 className="text-lg font-bold text-[#F4F4F5]">
                      {selectedPlaybook.name}
                    </h2>
                  </div>
                  <p className="text-xs text-[#A1A1AA] mt-1 max-w-xl leading-relaxed">
                    {selectedPlaybook.description}
                  </p>
                </div>
                <span className="rounded-md bg-profit/10 border border-profit/25 px-2.5 py-1 font-mono text-xs text-profit font-semibold uppercase">
                  Active Setup
                </span>
              </div>

              {/* Edge Metrics Bento */}
              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3 font-mono">
                  <span className="block text-[10px] text-[#A1A1AA] uppercase">Win Rate</span>
                  <span className="text-lg font-bold text-profit">
                    {playbookStats.winRate.toFixed(1)}%
                  </span>
                </div>
                <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3 font-mono">
                  <span className="block text-[10px] text-[#A1A1AA] uppercase">Total Net PnL</span>
                  <span
                    className={cn(
                      'text-lg font-bold',
                      playbookStats.totalPnL >= 0 ? 'text-profit' : 'text-loss',
                      privacyMode && 'blur-sm select-none',
                    )}
                  >
                    {playbookStats.totalPnL >= 0
                      ? `+$${playbookStats.totalPnL.toFixed(2)}`
                      : `-$${Math.abs(playbookStats.totalPnL).toFixed(2)}`}
                  </span>
                </div>
                <div className="rounded-lg border border-border/60 bg-white/[0.02] p-3 font-mono">
                  <span className="block text-[10px] text-[#A1A1AA] uppercase">Sample Size</span>
                  <span className="text-lg font-bold text-[#F4F4F5]">
                    {playbookStats.totalTrades} Trades
                  </span>
                </div>
              </div>
            </div>

            {/* Execution Checklist */}
            <div className="rounded-xl border border-border bg-surface p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-profit" />
                  <h3 className="text-sm font-semibold text-[#F4F4F5]">Pre-Trade Execution Checklist</h3>
                </div>
                <span className="text-xs text-[#A1A1AA]">
                  Confirm all criteria before entering position
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {selectedPlaybook.rules.map((rule, idx) => {
                  const ruleKey = `${selectedPlaybook.id}_rule_${idx}`
                  const isChecked = Boolean(checkedRules[ruleKey])
                  return (
                    <div
                      key={idx}
                      onClick={() => toggleRule(ruleKey)}
                      className={cn(
                        'flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors select-none',
                        isChecked
                          ? 'border-profit/30 bg-profit/[0.04]'
                          : 'border-border/60 bg-white/[0.02] hover:bg-white/[0.04]',
                      )}
                    >
                      {isChecked ? (
                        <CheckCircle2 className="h-4 w-4 text-profit shrink-0" strokeWidth={2.5} />
                      ) : (
                        <Circle className="h-4 w-4 text-[#525252] shrink-0" />
                      )}
                      <span
                        className={cn(
                          'text-xs text-[#F4F4F5] leading-relaxed',
                          isChecked && 'line-through text-[#71717A]',
                        )}
                      >
                        {rule}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal: New Playbook */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-xl border border-border bg-[#141414] shadow-2xl p-6">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <BookMarked className="h-4 w-4 text-profit" />
                <h3 className="text-sm font-semibold text-[#F4F4F5]">Create Strategy Playbook</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="text-[#A1A1AA] hover:text-[#F4F4F5]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Strategy Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Asia Range Sweep or FVG Gap Fill"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-[#F4F4F5] focus:border-profit focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Tag Identifier
                </label>
                <input
                  type="text"
                  placeholder="e.g. AsiaSweep (used to tag trades)"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm font-mono text-[#F4F4F5] focus:border-profit focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Strategy Thesis / Description
                </label>
                <textarea
                  rows={2}
                  placeholder="What is the edge? What conditions must be met?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm text-[#F4F4F5] focus:border-profit focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#A1A1AA] mb-1">
                  Rules Checklist (One rule per line)
                </label>
                <textarea
                  rows={4}
                  placeholder="Rule 1: HTF Trend confirmation&#10;Rule 2: Minimum 2.0R to next liquidity&#10;Rule 3: Clean stop beyond structure"
                  value={rulesInput}
                  onChange={(e) => setRulesInput(e.target.value)}
                  className="w-full rounded-md border border-border bg-[#18181B] px-3 py-2 text-sm font-mono text-[#F4F4F5] focus:border-profit focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-[#A1A1AA] hover:text-[#F4F4F5]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-profit text-[#0A0A0A] text-xs font-semibold hover:bg-profit/90 active:scale-95 transition-all"
                >
                  Create Playbook
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AppShell>
  )
}
