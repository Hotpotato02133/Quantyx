import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SettingsModal } from '@/components/settings/SettingsModal'
import { Sidebar } from '@/components/layout/Sidebar'
import { useUiStore } from '@/store/useUiStore'
import { useSettingsStore, DEFAULT_SETTINGS } from '@/store/useSettingsStore'

vi.mock('@clerk/clerk-react', () => ({
  useAuth: () => ({ getToken: async () => null, userId: 'test-user', isSignedIn: true }),
  useUser: () => ({
    user: {
      fullName: 'Efraim James',
      firstName: 'Efraim',
      primaryEmailAddress: { emailAddress: 'trader@quantyx.trade' },
    },
    isLoaded: true,
    isSignedIn: true,
  }),
  useClerk: () => ({
    signOut: vi.fn(),
  }),
}))

function renderModal() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <Sidebar />
        <SettingsModal />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('SettingsModal & Sidebar Integration', () => {
  beforeEach(() => {
    useUiStore.setState({ settingsModalOpen: false, privacyMode: false })
    useSettingsStore.setState({ ...DEFAULT_SETTINGS })
  })

  it('opens SettingsModal when Settings button in Sidebar is clicked', () => {
    renderModal()

    expect(screen.queryByRole('dialog', { name: /platform settings/i })).not.toBeInTheDocument()

    // Click Settings in Sidebar
    const settingsBtn = screen.getByRole('button', { name: /open settings/i })
    fireEvent.click(settingsBtn)

    expect(useUiStore.getState().settingsModalOpen).toBe(true)
    expect(screen.getByRole('dialog', { name: /platform settings/i })).toBeInTheDocument()
  })

  it('switches tabs across General, Risk, Accounts, Journal, Data, and Profile', () => {
    useUiStore.setState({ settingsModalOpen: true })
    renderModal()

    // Default tab is General
    expect(screen.getByText('Base Currency')).toBeInTheDocument()

    // Switch to Risk & Capital
    fireEvent.click(screen.getByRole('button', { name: /risk & capital/i }))
    expect(screen.getByText(/Max Daily Drawdown Threshold/i)).toBeInTheDocument()

    // Switch to Trading Accounts
    fireEvent.click(screen.getByRole('button', { name: /trading accounts/i }))
    expect(screen.getByText(/Connected Portfolios/i)).toBeInTheDocument()
    expect(screen.getByText('Apex 50k Funded #1')).toBeInTheDocument()

    // Switch to Journal & Rules
    fireEvent.click(screen.getByRole('button', { name: /journal & rules/i }))
    expect(screen.getByText(/Automated R-Multiple Math/i)).toBeInTheDocument()

    // Switch to Data & Export
    fireEvent.click(screen.getByRole('button', { name: /data & export/i }))
    expect(screen.getByText(/Export Trade Journal \(CSV\)/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /download csv/i })).toBeInTheDocument()

    // Switch to Profile & Auth
    fireEvent.click(screen.getByRole('button', { name: /profile & auth/i }))
    expect(screen.getByText(/Lifetime Pro Tier/i)).toBeInTheDocument()
  })

  it('updates currency setting and persists to store', () => {
    useUiStore.setState({ settingsModalOpen: true })
    renderModal()

    const currencySelect = screen.getByLabelText(/base currency/i)
    fireEvent.change(currencySelect, { target: { value: 'EUR' } })

    expect(useSettingsStore.getState().currency).toBe('EUR')
    expect(useSettingsStore.getState().currencySymbol).toBe('€')
  })

  it('closes modal on close button click and on Escape key', () => {
    useUiStore.setState({ settingsModalOpen: true })
    renderModal()

    expect(screen.getByRole('dialog', { name: /platform settings/i })).toBeInTheDocument()

    // Close button
    const closeBtn = screen.getByRole('button', { name: /close settings/i })
    fireEvent.click(closeBtn)

    expect(useUiStore.getState().settingsModalOpen).toBe(false)
  })
})
