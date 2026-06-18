import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Utah Builders Guide | BuildSmart Utah',
  description:
    'Expert guide to finding the right Utah new construction builder for your situation. Free buyer representation from Landon Rose.',
};

export default function CategoryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
