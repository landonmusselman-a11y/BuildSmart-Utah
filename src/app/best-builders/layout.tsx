import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Best Utah Home Builders by Buyer Type | BuildSmart Utah',
  description:
    'Find the best Utah new construction builder for your specific situation — first-time buyers, luxury, fast move-in, no HOA, basement, Utah County, Salt Lake County.',
};

export default function BestBuildersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
