import { SignIn } from '@clerk/clerk-react'
import { Zap, ShieldCheck } from 'lucide-react'

export default function SignInPage() {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-[#121212] px-4 py-12 selection:bg-profit/20 selection:text-profit">
      {/* Background ambient lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-profit/[0.03] rounded-full blur-[140px]" />
        <div className="absolute top-1/4 left-1/3 w-[300px] h-[300px] bg-warning/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Terminal Brand Header */}
      <div className="relative z-10 flex flex-col items-center text-center mb-8">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-profit/15 border border-profit/30 shadow-lg shadow-profit/10 mb-3.5">
          <Zap className="h-6 w-6 text-profit" strokeWidth={2.5} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-[#F4F4F5] uppercase font-mono">
          Quantyx Terminal
        </h1>
        <p className="text-xs text-[#A1A1AA] mt-1">
          High-Density Trading Journal & Performance Analytics
        </p>

        {/* Roles Supported Badge */}
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.04] border border-border mt-3 text-[11px] text-[#A1A1AA]">
          <ShieldCheck className="h-3 w-3 text-profit" />
          <span>Role-Based Access: Admin · User Admin · Trader</span>
        </div>
      </div>

      {/* Clerk Sign In Component */}
      <div className="relative z-10 w-full max-w-[440px] flex justify-center">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          fallbackRedirectUrl="/dashboard"
        />
      </div>

      {/* Terminal Footer */}
      <div className="relative z-10 mt-8 text-center text-[11px] text-[#525252] font-mono">
        Sub-50ms execution tracking · Strict multi-tenant isolation
      </div>
    </div>
  )
}
