import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Admin — BuildSmart Utah',
  description: 'Lead inbox.',
  robots: { index: false, follow: false },
  openGraph: {
    title: 'Admin — BuildSmart Utah',
    description: 'Lead inbox.',
    url: 'https://newconstructionutah.com/admin',
  },
  alternates: { canonical: 'https://newconstructionutah.com/admin' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
