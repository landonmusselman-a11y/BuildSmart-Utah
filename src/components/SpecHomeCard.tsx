import { Calendar, Home, Car, Bath, BedDouble, Maximize2, MapPin, Zap } from 'lucide-react';
import { SpecHome, Community } from '@/types';

interface SpecHomeCardProps {
  spec: SpecHome;
  community: Community;
  onGetInfo: (community: Community, spec: SpecHome) => void;
}

const fmt = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n);

const statusConfig = {
  'move-in-ready': { label: 'Move-In Ready', bg: 'bg-green-500', text: 'text-white' },
  'under-construction': { label: 'Under Construction', bg: 'bg-amber-400', text: 'text-white' },
  available: { label: 'Available', bg: 'bg-blue-500', text: 'text-white' },
};

export default function SpecHomeCard({ spec, community, onGetInfo }: SpecHomeCardProps) {
  const status = statusConfig[spec.status];

  return (
    <div className="card overflow-hidden hover:shadow-lg transition-shadow">
      {/* Color header */}
      <div
        className="h-36 relative flex flex-col justify-between p-4"
        style={{ background: `linear-gradient(135deg, ${community.photoColor}ee, ${community.photoColor}bb)` }}
      >
        <div className="flex items-start justify-between">
          <span className={`${status.bg} ${status.text} text-xs font-bold px-2.5 py-1 rounded-full`}>
            {status.label}
          </span>
          {spec.status === 'move-in-ready' && (
            <span className="bg-gold-500 text-white text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1">
              <Zap size={10} /> Quick Close
            </span>
          )}
        </div>
        <div>
          <div className="text-white font-extrabold text-2xl">{fmt(spec.price)}</div>
          {spec.address && (
            <div className="text-white/80 text-xs flex items-center gap-1 mt-0.5">
              <MapPin size={10} />
              {spec.address}
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Community context */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: community.photoColor }}>
            <span className="text-white text-xs font-bold">{community.builderName[0]}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-gold-600">{community.builderName}</span>
            <span className="text-xs text-navy-400 mx-1">·</span>
            <span className="text-xs text-navy-500">{community.name}</span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          {[
            { icon: BedDouble, value: spec.beds, label: 'Beds' },
            { icon: Bath, value: spec.baths, label: 'Baths' },
            { icon: Maximize2, value: `${spec.sqft.toLocaleString()}`, label: 'Sq Ft' },
            { icon: Car, value: spec.garage, label: 'Garage' },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="bg-cream-50 rounded-lg p-2 text-center">
              <Icon size={13} className="mx-auto text-navy-400 mb-0.5" />
              <div className="text-sm font-bold text-navy-900 leading-none">{value}</div>
              <div className="text-xs text-navy-400 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Floor plan & lot size */}
        <div className="flex gap-2 flex-wrap mb-3">
          {spec.floorPlan && (
            <span className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium">
              {spec.floorPlan}
            </span>
          )}
          {spec.lotSize && (
            <span className="text-xs bg-navy-50 text-navy-700 px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
              <Home size={10} />
              {spec.lotSize} lot
            </span>
          )}
          {spec.basement && (
            <span className="text-xs bg-purple-50 text-purple-700 px-2.5 py-1 rounded-full font-medium">
              Basement incl.
            </span>
          )}
        </div>

        {/* Highlights */}
        {spec.highlights.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-semibold text-navy-600 mb-1">Already Selected:</div>
            <div className="flex flex-wrap gap-1">
              {spec.highlights.slice(0, 3).map((h) => (
                <span key={h} className="text-xs bg-gold-50 text-gold-800 border border-gold-100 px-1.5 py-0.5 rounded">{h}</span>
              ))}
              {spec.highlights.length > 3 && (
                <span className="text-xs text-navy-400">+{spec.highlights.length - 3} more</span>
              )}
            </div>
          </div>
        )}

        {/* Completion date */}
        {spec.completionDate && spec.status !== 'move-in-ready' && (
          <div className="flex items-center gap-1.5 text-xs text-navy-500 mb-3">
            <Calendar size={12} className="text-gold-500" />
            Est. completion: <span className="font-semibold text-navy-700">{spec.completionDate}</span>
          </div>
        )}

        <button
          onClick={() => onGetInfo(community, spec)}
          className="btn-primary w-full justify-center text-sm py-2.5"
        >
          {spec.status === 'move-in-ready' ? 'Schedule a Tour' : 'Get More Info'}
        </button>
      </div>
    </div>
  );
}
