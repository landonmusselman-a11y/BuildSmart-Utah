import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utah New Home Matchmaker — Find Your Perfect Community',
  description:
    'Answer 7 quick questions and get matched with the Utah new construction communities that fit your budget, location, and lifestyle. Free, no obligation.',
  openGraph: {
    title: 'Utah New Home Matchmaker — Find Your Perfect Community',
    description:
      'Answer 7 quick questions and get matched with the Utah new construction communities that fit your budget, location, and lifestyle. Free, no obligation.',
    url: 'https://utahnewconstruction.com/get-started',
  },
  alternates: { canonical: 'https://utahnewconstruction.com/get-started' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
