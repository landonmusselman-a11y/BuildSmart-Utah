import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utah New Construction Builder | BuildSmart Utah',
  description:
    'Explore floor plans, communities, spec homes, and builder incentives. Free buyer representation from Landon Rose at BuildSmart Utah.',
  openGraph: {
    title: 'Utah New Construction Builder | BuildSmart Utah',
    description:
      'Explore floor plans, communities, spec homes, and builder incentives. Free buyer representation from Landon Rose at BuildSmart Utah.',
    url: 'https://utahnewconstruction.com/builders',
  },
  alternates: { canonical: 'https://utahnewconstruction.com/builders' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
