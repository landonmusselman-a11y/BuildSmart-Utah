import { Tag, TrendingDown, DollarSign, Hammer, Percent } from 'lucide-react';
import { Incentive } from '@/types';
import clsx from 'clsx';

const typeConfig = {
  'rate-buydown': { icon: TrendingDown, label: 'Rate Buydown', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  'closing-costs': { icon: DollarSign, label: 'Closing Costs', color: 'bg-green-50 text-green-700 border-green-200' },
  upgrades: { icon: Hammer, label: 'Design Credit', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  'price-reduction': { icon: Percent, label: 'Price Reduction', color: 'bg-red-50 text-red-700 border-red-200' },
  other: { icon: Tag, label: 'Incentive', color: 'bg-gold-50 text-gold-700 border-gold-200' },
};

interface IncentiveBadgeProps {
  incentive: Incentive;
  size?: 'sm' | 'md';
}

export default function IncentiveBadge({ incentive, size = 'md' }: IncentiveBadgeProps) {
  const config = typeConfig[incentive.type];
  const Icon = config.icon;

  return (
    <div
      className={clsx(
        'inline-flex items-center gap-1.5 border rounded-full font-semibold',
        config.color,
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      )}
    >
      <Icon size={size === 'sm' ? 11 : 13} />
      <span>{incentive.value}</span>
    </div>
  );
}
