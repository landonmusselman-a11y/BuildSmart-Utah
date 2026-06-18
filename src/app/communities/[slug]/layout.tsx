import type { Metadata } from 'next';
import { getAllCommunities } from '@/data/mock';

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const community = getAllCommunities().find((c) => c.slug === slug);

  if (!community) {
    return {
      title: 'Community | BuildSmart Utah',
      description: 'Explore Utah new construction communities with BuildSmart Utah.',
    };
  }

  const title = `${community.name} by ${community.builderName} | BuildSmart Utah`;
  const description = `Explore ${community.name} — floor plans, spec homes, incentives, and pricing from ${community.builderName}. Free buyer representation from a new construction specialist.`;
  const url = `https://newconstructionutah.com/communities/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url,
      type: 'website',
    },
    alternates: { canonical: url },
  };
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
