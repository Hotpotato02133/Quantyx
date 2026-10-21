import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface UserSettings {
  // General & Locale
  currency: string
  currencySymbol: string
  timezone: string
  dateFormat: string
  soundEffects: boolean
  defaultLandingPage: 'dashboard' | 'journal' | 'analytics' | 'playbooks'

  // Trading & Risk
  defaultRiskDollars: number
  defaultRiskPercent: number
  riskMode: 'fixed' | 'percentage'
  maxDailyDrawdownPct: number
  defaultCommission: number
  defaultAssetClass: 'futures' | 'equities' | 'crypto' | 'forex' | 'options'
  sessionCutoffTime: string
  dailyDrawdownAlert: boolean

  // Journal & Execution
  autoCalculateRMultiple: boolean
  requireScreenshotOnClose: boolean
  autoCompressScreenshots: boolean
  defaultMarkdownPreview: boolean
  showTagsInGrid: boolean

  // Actions
  updateSettings: (updates: Partial<UserSettings>) => void
  resetToDefaults: () => void
}

export const DEFAULT_SETTINGS: Omit<UserSettings, 'updateSettings' | 'resetToDefaults'> = {
  currency: 'USD',
  currencySymbol: '$',
  timezone: 'America/New_York',
  dateFormat: 'YYYY-MM-DD',
  soundEffects: true,
  defaultLandingPage: 'dashboard',

  defaultRiskDollars: 250,
  defaultRiskPercent: 1.0,
  riskMode: 'fixed',
  maxDailyDrawdownPct: 5.0,
  defaultCommission: 1.5,
  defaultAssetClass: 'futures',
  sessionCutoffTime: '17:00',
  dailyDrawdownAlert: true,

  autoCalculateRMultiple: true,
  requireScreenshotOnClose: false,
  autoCompressScreenshots: true,
  defaultMarkdownPreview: false,
  showTagsInGrid: true,
}

export const useSettingsStore = create<UserSettings>()(
  persist(
    (set) => ({
      ...DEFAULT_SETTINGS,
      updateSettings: (updates) => set((state) => ({ ...state, ...updates })),
      resetToDefaults: () => set({ ...DEFAULT_SETTINGS }),
    }),
    {
      name: 'quantyx_user_settings',
    },
  ),
)
