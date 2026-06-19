import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utah New Construction Map — Find Communities Near You',
  description:
    'Interactive map of 40+ Utah new construction communities. Filter by builder, price, and status across Salt Lake, Utah County, Davis, Weber, and Summit counties.',
  openGraph: {
    title: 'Utah New Construction Map — Find Communities Near You',
    description:
      'Interactive map of 40+ Utah new construction communities. Filter by builder, price, and status across Salt Lake, Utah County, Davis, Weber, and Summit counties.',
    url: 'https://utahnewconstruction.com/map',
  },
  alternates: { canonical: 'https://utahnewconstruction.com/map' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
