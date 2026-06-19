import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utah New Construction Communities — Spec Homes & Floor Plans',
  description:
    'Browse 40+ Utah new construction communities. Filter by price, city, builder, and home type. Compare spec homes and dirt build floor plans. Free buyer representation.',
  openGraph: {
    title: 'Utah New Construction Communities — Spec Homes & Floor Plans',
    description:
      'Browse 40+ Utah new construction communities. Filter by price, city, builder, and home type. Compare spec homes and dirt build floor plans. Free buyer representation.',
    url: 'https://utahnewconstruction.com/communities',
  },
  alternates: { canonical: 'https://utahnewconstruction.com/communities' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
