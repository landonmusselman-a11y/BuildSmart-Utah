'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, TrendingDown, Home, TrendingUp, FileText, CreditCard, Inbox, Menu, X, FolderOpen, Tag, Briefcase, Sparkles } from 'lucide-react'
import { useState } from 'react'

const nav = [
  { href: '/finance', label: 'Big Picture', icon: LayoutDashboard },
  { href: '/finance/inbox', label: 'Inbox', icon: Inbox },
  { href: '/finance/documents', label: 'Documents', icon: FolderOpen },
  { href: '/finance/merchants', label: 'Merchants', icon: Tag },
  { href: '/finance/spending', label: 'Spending', icon: TrendingDown },
  { href: '/finance/audit', label: 'AI Audit', icon: Sparkles },
  { href: '/finance/airbnb', label: 'Airbnb P&L', icon: Home },
  { href: '/finance/business', label: 'Agent Business', icon: Briefcase },
  { href: '/finance/investments', label: 'Investments', icon: TrendingUp },
  { href: '/finance/taxes', label: 'Tax Hub', icon: FileText },
  { href: '/finance/accounts', label: 'Accounts', icon: CreditCard },
]

export default function FinanceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#0f1117] text-white flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 bg-[#16181f] border-r border-white/5 fixed h-full z-20">
        <div className="px-5 py-6 border-b border-white/5">
          <p className="text-xs text-white/40 uppercase tracking-widest font-semibold">Finance</p>
          <p className="text-white font-bold text-lg mt-0.5">Tracker</p>
        </div>
        <nav className="flex-1 py-4 px-2 space-y-0.5">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active ? 'bg-indigo-600 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="px-5 py-4 border-t border-white/5">
          <p className="text-xs text-white/30">Landon & Ashlan</p>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-30 bg-[#16181f] border-b border-white/5 flex items-center justify-between px-4 h-14">
        <div>
          <span className="text-white font-bold">Finance Tracker</span>
        </div>
        <button onClick={() => setOpen(!open)} className="text-white/60 hover:text-white">
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden fixed inset-0 z-20 bg-[#16181f] pt-14">
          <nav className="py-4 px-4 space-y-1">
            {nav.map(({ href, label, icon: Icon }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium ${
                    active ? 'bg-indigo-600 text-white' : 'text-white/60'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 md:ml-56 pt-14 md:pt-0 min-h-screen">
        <div className="max-w-6xl mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
