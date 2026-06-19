import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Utah New Construction Calculators — Payment, Buydown & Hidden Costs',
  description:
    'Free Utah new construction calculators. Estimate your monthly payment, compare rate buydown options, and budget for hidden move-in costs before you sign.',
  alternates: {
    canonical: 'https://utahnewconstruction.com/calculators',
  },
};

export default function CalculatorsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
