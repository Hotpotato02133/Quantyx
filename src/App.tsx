import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import JournalPage from '@/pages/JournalPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import PlaybooksPage from '@/pages/PlaybooksPage'

const HAS_CLERK = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY)

export default function App() {
  const routes = (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/journal" element={<JournalPage />} />
      <Route path="/analytics" element={<AnalyticsPage />} />
      <Route path="/playbooks" element={<PlaybooksPage />} />
      <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )

  return (
    <BrowserRouter>
      {HAS_CLERK ? (
        <>
          <SignedOut>
            <RedirectToSignIn />
          </SignedOut>
          <SignedIn>{routes}</SignedIn>
        </>
      ) : (
        routes
      )}
    </BrowserRouter>
  )
}
