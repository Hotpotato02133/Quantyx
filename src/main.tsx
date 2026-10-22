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
    colorPrimary: '#22C55E',
    colorBackground: '#121212',
    colorInputBackground: '#18181B',
    colorInputText: '#FFFFFF',
    colorText: '#FFFFFF',
    colorTextSecondary: '#9CA3AF',
    colorTextOnPrimaryBackground: '#FFFFFF',
    colorNeutral: '#FFFFFF',
    colorDanger: '#EF4444',
    colorSuccess: '#22C55E',
    colorWarning: '#F59E0B',
    borderRadius: '0.75rem',
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
  },
  elements: {
    modalBackdrop: 'fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto',
    modalContent: 'm-auto max-w-[420px] w-full',
    modalCloseButton: 'bg-[#1C1C1E] hover:bg-[#27272A] text-zinc-400 hover:text-white rounded-lg p-1.5 transition-colors',
    card: 'bg-[#121212] border border-[#27272A] rounded-2xl shadow-2xl p-6 sm:p-7',
    headerTitle: 'text-white font-bold text-lg sm:text-xl text-center tracking-tight',
    headerSubtitle: 'text-zinc-400 text-xs sm:text-sm text-center mt-1',
    socialButtonsBlockButton: 'border border-[#27272A] bg-[#18181B] text-white hover:bg-white/[0.05] rounded-xl py-2.5 transition-colors',
    socialButtonsBlockButtonText: 'text-white font-medium text-xs sm:text-sm',
    socialButtonsBadge: 'bg-[#27272A] text-zinc-300 border border-zinc-700 text-[10px] font-medium px-2 py-0.5 rounded-full',
    dividerLine: 'bg-[#27272A]',
    dividerText: 'text-zinc-500 text-xs font-normal',
    formButtonPrimary: 'bg-[#22C55E] hover:bg-[#16A34A] text-white font-semibold text-sm py-2.5 rounded-xl shadow-none transition-colors cursor-pointer',
    formFieldInput: 'bg-[#18181B] border border-[#27272A] text-white text-sm rounded-xl py-2.5 px-3.5 placeholder:text-zinc-500 focus:border-[#22C55E] focus:ring-1 focus:ring-[#22C55E] transition-colors',
    formFieldLabel: 'text-zinc-200 text-xs sm:text-sm font-medium mb-1.5',
    footerActionText: 'text-zinc-400 text-xs sm:text-sm font-normal',
    footerActionLink: 'text-[#22C55E] hover:text-[#22C55E]/80 text-xs sm:text-sm font-medium transition-colors',
    footer: 'bg-transparent',
    identityPreviewText: 'text-white',
    identityPreviewEditButton: 'text-[#22C55E]',
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
