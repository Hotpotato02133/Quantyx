import { create } from 'zustand'

interface UiState {
  /** Active trading account ID — null means "all accounts" */
  activeAccountId: string | null
  setActiveAccountId: (id: string | null) => void

  /** Command palette open state */
  commandPaletteOpen: boolean
  setCommandPaletteOpen: (open: boolean) => void
  toggleCommandPalette: () => void

  /** Quick-entry trade sheet open state */
  tradeSheetOpen: boolean
  setTradeSheetOpen: (open: boolean) => void

  /** Privacy mode — blurs all dollar amounts */
  privacyMode: boolean
  togglePrivacyMode: () => void

  /** Sidebar collapsed */
  sidebarCollapsed: boolean
  toggleSidebar: () => void

  /** Settings modal open state */
  settingsModalOpen: boolean
  setSettingsModalOpen: (open: boolean) => void
  toggleSettingsModal: () => void
}

export const useUiStore = create<UiState>((set) => ({
  activeAccountId: null,
  setActiveAccountId: (id) => set({ activeAccountId: id }),

  commandPaletteOpen: false,
  setCommandPaletteOpen: (open) => set({ commandPaletteOpen: open }),
  toggleCommandPalette: () =>
    set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),

  tradeSheetOpen: false,
  setTradeSheetOpen: (open) => set({ tradeSheetOpen: open }),

  privacyMode: false,
  togglePrivacyMode: () => set((s) => ({ privacyMode: !s.privacyMode })),

  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  settingsModalOpen: false,
  setSettingsModalOpen: (open) => set({ settingsModalOpen: open }),
  toggleSettingsModal: () => set((s) => ({ settingsModalOpen: !s.settingsModalOpen })),
}))
