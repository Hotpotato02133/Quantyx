import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import DashboardPage from '@/pages/DashboardPage'
import JournalPage from '@/pages/JournalPage'

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
        </Routes>
      </SignedIn>
    </BrowserRouter>
  )
}
