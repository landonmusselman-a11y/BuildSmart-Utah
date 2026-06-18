import type { Metadata } from 'next'
import FinanceSessionProvider from '@/components/finance/SessionProvider'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Rose Family Finance Dashboard',
}

export default function FinanceLayout({ children }: { children: React.ReactNode }) {
  return <FinanceSessionProvider>{children}</FinanceSessionProvider>
}
