'use client'

import FinanceShell from '@/components/finance/FinanceShell'
import { Briefcase } from 'lucide-react'

export default function BusinessPage() {
  return (
    <FinanceShell>
      <div className="flex items-center gap-3 mb-2">
        <Briefcase size={22} className="text-amber-400" />
        <h1 className="text-2xl font-bold text-white">Agent Business</h1>
      </div>
      <p className="text-white/30 text-sm mb-8">Schedule C — commission income, business expenses, net profit</p>
      <div className="bg-[#16181f] rounded-2xl border border-white/5 p-10 text-center text-white/20">
        <Briefcase size={36} className="mx-auto mb-4 opacity-30" />
        <p className="font-medium mb-1">Coming soon</p>
        <p className="text-sm">Upload your commission statements and receipts through the Inbox — this page will populate automatically.</p>
      </div>
    </FinanceShell>
  )
}
