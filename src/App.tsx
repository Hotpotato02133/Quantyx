import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import JournalPage from '@/pages/JournalPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import PlaybooksPage from '@/pages/PlaybooksPage'

export default function App() {
  return (
    <BrowserRouter>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/journal" element={<JournalPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/playbooks" element={<PlaybooksPage />} />
          <Route path="/settings" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </SignedIn>
    </BrowserRouter>
  )
}
