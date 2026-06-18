import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Landon Rose — Utah New Construction Specialist',
  description:
    'Meet Landon Rose, Utah’s new construction buyer specialist. Free representation at Richmond American, Lennar, Ivory, Perry, Woodside, Edge, Toll Brothers and 15+ more builders.',
  openGraph: {
    title: 'About Landon Rose — Utah New Construction Specialist',
    description:
      'Meet Landon Rose, Utah’s new construction buyer specialist. Free representation at Richmond American, Lennar, Ivory, Perry, Woodside, Edge, Toll Brothers and 15+ more builders.',
    url: 'https://newconstructionutah.com/about',
  },
  alternates: { canonical: 'https://newconstructionutah.com/about' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
