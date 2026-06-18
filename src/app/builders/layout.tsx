import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utah Home Builders — Compare All 20 New Construction Builders',
  description:
    'Compare every major Utah new construction builder — Richmond American, Lennar, Perry, Ivory, Woodside, Edge, Toll Brothers, Pulte, Meritage, Century, Garbett and more. Free buyer representation.',
  openGraph: {
    title: 'Utah Home Builders — Compare All 20 New Construction Builders',
    description:
      'Compare every major Utah new construction builder — Richmond American, Lennar, Perry, Ivory, Woodside, Edge, Toll Brothers, Pulte, Meritage, Century, Garbett and more. Free buyer representation.',
    url: 'https://newconstructionutah.com/builders',
  },
  alternates: { canonical: 'https://newconstructionutah.com/builders' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
