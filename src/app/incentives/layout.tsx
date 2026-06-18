import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utah Builder Incentives — Rate Buydowns, Closing Costs & Upgrades',
  description:
    'Live Utah builder incentives updated regularly. Rate buydowns, closing cost assistance, upgrade credits, and price reductions from top Utah new construction builders.',
  openGraph: {
    title: 'Utah Builder Incentives — Rate Buydowns, Closing Costs & Upgrades',
    description:
      'Live Utah builder incentives updated regularly. Rate buydowns, closing cost assistance, upgrade credits, and price reductions from top Utah new construction builders.',
    url: 'https://newconstructionutah.com/incentives',
  },
  alternates: { canonical: 'https://newconstructionutah.com/incentives' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
