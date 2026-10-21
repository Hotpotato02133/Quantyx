import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/components/layout/Sidebar'
import { Topbar } from '@/components/layout/Topbar'
import CalendarPage from '@/pages/CalendarPage'

// Mock Clerk auth
vi.mock('@clerk/clerk-react', () => ({
  useUser: () => ({
    user: {
      firstName: 'Alex',
      emailAddresses: [{ emailAddress: 'alex@quantyx.trade' }],
    },
  }),
  UserButton: () => <div data-testid="user-button">UserButton</div>,
}))

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: () => ({
      select: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
  },
}))

describe('Calendar Page & Navigation Integration', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })
  })

  it('renders CalendarPage with title, subtitle, and action buttons', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/calendar']}>
          <CalendarPage />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByRole('heading', { name: 'Trading Calendar' })).toBeInTheDocument()
    expect(
      screen.getByText(/Interactive calendar view of your daily P&L/i),
    ).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /Import CSV/i }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole('button', { name: /Log Trade/i }).length).toBeGreaterThan(0)
  })

  it('activates ONLY Trade Journal when on /journal, and NOT Calendar', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/journal']}>
          <Sidebar />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const journalLink = screen.getByRole('link', { name: 'Trade Journal' })
    const calendarLink = screen.getByRole('link', { name: 'Calendar' })

    // Trade Journal should have active background
    expect(journalLink.className).toContain('bg-[#1C1C1C]')
    expect(journalLink.className).toContain('text-white')

    // Calendar should NOT have active background
    expect(calendarLink.className).not.toContain('bg-[#1C1C1C]')
    expect(calendarLink.className).toContain('text-zinc-400')
  })

  it('activates ONLY Calendar when on /calendar, and NOT Trade Journal', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/calendar']}>
          <Sidebar />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    const journalLink = screen.getByRole('link', { name: 'Trade Journal' })
    const calendarLink = screen.getByRole('link', { name: 'Calendar' })

    // Calendar should have active background
    expect(calendarLink.className).toContain('bg-[#1C1C1C]')
    expect(calendarLink.className).toContain('text-white')

    // Trade Journal should NOT have active background
    expect(journalLink.className).not.toContain('bg-[#1C1C1C]')
    expect(journalLink.className).toContain('text-zinc-400')
  })

  it('navigates from /journal to /calendar when clicking Calendar in Sidebar', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={['/journal']}>
          <Sidebar />
          <Routes>
            <Route path="/journal" element={<div>Journal Content</div>} />
            <Route path="/calendar" element={<div>Calendar Content</div>} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>,
    )

    expect(screen.getByText('Journal Content')).toBeInTheDocument()

    const calendarLink = screen.getByRole('link', { name: 'Calendar' })
    fireEvent.click(calendarLink)

    expect(screen.getByText('Calendar Content')).toBeInTheDocument()
  })

  it('verifies Topbar does NOT render the duplicate AccountSwitcher', () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <Topbar />
        </MemoryRouter>
      </QueryClientProvider>,
    )

    // The account switcher trigger in AccountSwitcher has title "Switch active account" or id="account-switcher-trigger"
    expect(screen.queryByTitle('Switch active account')).not.toBeInTheDocument()
    expect(screen.queryByTestId('account-switcher-trigger')).not.toBeInTheDocument()

    // Topbar search is still present
    expect(screen.getByRole('button', { name: /Open command palette/i })).toBeInTheDocument()
  })
})
