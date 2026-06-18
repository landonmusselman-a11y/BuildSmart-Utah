import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Compare Utah New Construction Communities & Builders | BuildSmart Utah',
  description:
    'Compare Utah new construction communities side by side — amenities, HOA, pricing, floor plans, incentives, school districts, and more. Also compare builders head to head.',
  alternates: {
    canonical: 'https://newconstructionutah.com/compare',
  },
};

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
