import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Buyer Representation — The BuildSmart 6-Phase Roadmap',
  description:
    'How BuildSmart Utah works: 6 phases from discovery to keys. Free new construction buyer representation — negotiation, contract review, design center guidance, and more.',
  openGraph: {
    title: 'Free Buyer Representation — The BuildSmart 6-Phase Roadmap',
    description:
      'How BuildSmart Utah works: 6 phases from discovery to keys. Free new construction buyer representation — negotiation, contract review, design center guidance, and more.',
    url: 'https://utahnewconstruction.com/services',
  },
  alternates: { canonical: 'https://utahnewconstruction.com/services' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
