import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — BuildSmart Utah',
  description: 'Lead inbox.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Admin — BuildSmart Utah',
    description: 'Lead inbox.',
    url: 'https://utahnewconstruction.com/admin',
  },
  alternates: { canonical: 'https://utahnewconstruction.com/admin' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
