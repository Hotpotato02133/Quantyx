/**
 * src/lib/playbooks.ts — Playbook & Trading Psychology Definitions (Step 3.2)
 *
 * Defines default setup playbooks, rules checklists, and emotional state tags
 * for categorization and behavioral leak detection.
 */

export interface PlaybookItem {
  id: string
  name: string
  tag: string
  color: string
  description: string
  assetClass: string
  rules: string[]
}

export interface EmotionTagItem {
  id: string
  label: string
  category: 'positive' | 'negative' | 'neutral'
  color: string
  bgColor: string
  borderColor: string
}

export const DEFAULT_PLAYBOOKS: PlaybookItem[] = [
  {
    id: 'pb_break_retest',
    name: 'Break & Retest',
    tag: 'BreakAndRetest',
    color: '#1DB954', // Emerald Green
    description: 'Clean break above/below key psychological level followed by a low-volume retest of structural resistance as support.',
    assetClass: 'Futures / Equities',
    rules: [
      'Higher timeframe (4H/Daily) trend alignment',
      'Strong displacement candle breaking previous day high/low',
      'Volume decreases on the pullback into the breakout zone',
      'Stop loss placed just below the retest pivot swing',
      'Minimum 2.0R target to nearest major liquidity pool',
    ],
  },
  {
    id: 'pb_liquidity_sweep',
    name: 'Liquidity Sweep',
    tag: 'LiquiditySweep',
    color: '#FF8C43', // Warm Amber
    description: 'Purge of obvious retail stop-loss clusters at London or session extremes, followed by aggressive market structure shift.',
    assetClass: 'Futures / Crypto / Forex',
    rules: [
      'Identification of clean equal highs or equal lows (BSL/SSL)',
      'Sharp wick piercing the level during London or NY Open window',
      '1m/5m market structure shift (MSS) with Fair Value Gap (FVG)',
      'Entry on the retest of the formed FVG',
      'Target opposing liquidity pool with 2.5R+ expectancy',
    ],
  },
  {
    id: 'pb_vwap_reversal',
    name: 'VWAP Mean Reversion',
    tag: 'VWAPReversal',
    color: '#3B82F6', // Blue
    description: 'Counter-trend fade when price extends more than 2.0 standard deviations from intraday Volume-Weighted Average Price.',
    assetClass: 'Equities / Futures',
    rules: [
      'Price touches or exceeds the 2nd standard deviation VWAP band',
      'RSI shows extreme overbought (>75) or oversold (<25) condition',
      'Volume exhaustion candle with visible reversal wick',
      'Target is the VWAP median line',
      'Strict stop loss: 1.0R maximum risk',
    ],
  },
  {
    id: 'pb_orb',
    name: 'Opening Range Breakout',
    tag: 'OpeningRangeBreakout',
    color: '#A855F7', // Purple
    description: 'Capitalizing on initial 15-minute cash session volatility expansion in the direction of the dominant morning orderflow.',
    assetClass: 'Index Futures (NQ/ES)',
    rules: [
      'Mark the high and low of the first 15 minutes of NYSE cash open (09:30 - 09:45 EST)',
      'Wait for a 5-minute candle to close completely outside the 15m range',
      'Confirm with positive Cumulative Volume Delta (CVD)',
      'Trail stop under each consecutive 5m higher low',
    ],
  },
  {
    id: 'pb_trend_continuation',
    name: 'Trend Continuation',
    tag: 'TrendContinuation',
    color: '#10B981', // Teal
    description: 'Pullback into key 20/50 EMA dynamic support during high-momentum trending sessions.',
    assetClass: 'All Markets',
    rules: [
      'Clear series of higher highs and higher lows',
      '20 EMA > 50 EMA on 15m and 1H chart',
      'Rejection wick confirming buyer absorption at dynamic support',
    ],
  },
]

export const EMOTION_TAGS: EmotionTagItem[] = [
  {
    id: 'disciplined',
    label: 'Disciplined',
    category: 'positive',
    color: '#1DB954',
    bgColor: 'bg-[#1DB954]/15',
    borderColor: 'border-[#1DB954]/30',
  },
  {
    id: 'calm',
    label: 'Calm / Flow',
    category: 'positive',
    color: '#06B6D4',
    bgColor: 'bg-[#06B6D4]/15',
    borderColor: 'border-[#06B6D4]/30',
  },
  {
    id: 'a_plus',
    label: 'A+ Execution',
    category: 'positive',
    color: '#8B5CF6',
    bgColor: 'bg-[#8B5CF6]/15',
    borderColor: 'border-[#8B5CF6]/30',
  },
  {
    id: 'fomo',
    label: 'FOMO',
    category: 'negative',
    color: '#EF4444',
    bgColor: 'bg-[#EF4444]/15',
    borderColor: 'border-[#EF4444]/30',
  },
  {
    id: 'revenge',
    label: 'Revenge Trade',
    category: 'negative',
    color: '#DC2626',
    bgColor: 'bg-[#DC2626]/15',
    borderColor: 'border-[#DC2626]/30',
  },
  {
    id: 'hesitation',
    label: 'Hesitation',
    category: 'negative',
    color: '#FF8C43',
    bgColor: 'bg-[#FF8C43]/15',
    borderColor: 'border-[#FF8C43]/30',
  },
  {
    id: 'early_exit',
    label: 'Early Exit',
    category: 'negative',
    color: '#F59E0B',
    bgColor: 'bg-[#F59E0B]/15',
    borderColor: 'border-[#F59E0B]/30',
  },
  {
    id: 'greed',
    label: 'Greed / Overleveraged',
    category: 'negative',
    color: '#B91C1C',
    bgColor: 'bg-[#B91C1C]/15',
    borderColor: 'border-[#B91C1C]/30',
  },
]

export function getPlaybookById(id?: string | null): PlaybookItem | undefined {
  if (!id) return undefined
  return DEFAULT_PLAYBOOKS.find((p) => p.id === id)
}

export function getPlaybookByTag(tag?: string | null): PlaybookItem | undefined {
  if (!tag) return undefined
  return DEFAULT_PLAYBOOKS.find(
    (p) => p.tag.toLowerCase() === tag.toLowerCase() || p.name.toLowerCase() === tag.toLowerCase(),
  )
}

export function getEmotionTag(labelOrId?: string | null): EmotionTagItem | undefined {
  if (!labelOrId) return undefined
  const lower = labelOrId.toLowerCase().trim()
  return EMOTION_TAGS.find(
    (e) => e.id.toLowerCase() === lower || e.label.toLowerCase() === lower,
  )
}
