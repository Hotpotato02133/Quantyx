import React from 'react'
import ReactDOM from 'react-dom/client'
import { ClerkProvider } from '@clerk/clerk-react'
import { QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { queryClient } from '@/lib/queryClient'
import App from './App'
import './index.css'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

const darkAppearance = {
  variables: {
    colorPrimary: '#1DB954',
    colorBackground: '#141414',
    colorInputBackground: '#1C1C1E',
    colorInputText: '#F4F4F5',
    colorText: '#F4F4F5',
    colorTextSecondary: '#A1A1AA',
    colorNeutral: '#F4F4F5',
    colorDanger: '#EF4444',
    colorSuccess: '#1DB954',
    colorWarning: '#FF8C43',
    borderRadius: '0.375rem',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  elements: {
    modalBackdrop: 'fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto',
    modalContent: 'm-auto',
    card: 'bg-[#141414] border border-[#262626] shadow-2xl',
    headerTitle: 'text-[#F4F4F5] font-semibold text-sm',
    headerSubtitle: 'text-[#A1A1AA] text-xs',
    socialButtonsBlockButton: 'border-[#262626] bg-[#18181B] text-[#F4F4F5] hover:bg-white/[0.05] transition-colors',
    socialButtonsBlockButtonText: 'text-[#F4F4F5] font-medium text-xs',
    dividerLine: 'bg-[#262626]',
    dividerText: 'text-[#A1A1AA] text-[11px]',
    formButtonPrimary: 'bg-[#1DB954] hover:bg-[#1DB954]/90 text-[#0A0A0A] font-semibold text-xs py-2 shadow-none transition-colors',
    formFieldInput: 'bg-[#18181B] border-[#262626] text-[#F4F4F5] text-xs focus:border-[#1DB954] transition-colors',
    formFieldLabel: 'text-[#A1A1AA] text-xs font-medium',
    footerActionLink: 'text-[#1DB954] hover:underline text-xs',
    identityPreviewText: 'text-[#F4F4F5]',
    identityPreviewEditButton: 'text-[#1DB954]',
  },
}

export function RootApp() {
  const content = (
    <QueryClientProvider client={queryClient}>
      <App />
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )

  if (PUBLISHABLE_KEY) {
    return (
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={darkAppearance}
      >
        {content}
      </ClerkProvider>
    )
  }

  return content
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <RootApp />
  </React.StrictMode>,
)
