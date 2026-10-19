import { AppShell } from '@/components/layout/AppShell'
import { BookMarked } from 'lucide-react'

export default function PlaybooksPage() {
  return (
    <AppShell>
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-profit/10 border border-profit/20">
          <BookMarked className="h-7 w-7 text-profit" strokeWidth={1.5} />
        </div>
        <h1 className="text-lg font-semibold text-[#F4F4F5]">Playbooks</h1>
        <p className="text-sm text-[#A1A1AA] text-center max-w-xs">
          Manage your trading setups, define rules checklists, and track edge across each playbook strategy.
        </p>
        <span className="inline-flex items-center rounded-full bg-warning/10 border border-warning/20 px-3 py-1 text-xs font-medium text-warning">
          In Development
        </span>
      </div>
    </AppShell>
  )
}
