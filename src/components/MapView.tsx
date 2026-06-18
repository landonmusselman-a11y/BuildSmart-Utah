import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Community } from '@/types';
import Link from 'next/link';

// Fix leaflet default marker icons for webpack / Next.js
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface MapViewProps {
  communities: Community[];
}

const fmt = (n: number) =>
  n >= 1_000_000
    ? `$${(n / 1_000_000).toFixed(1)}M`
    : `$${Math.round(n / 1000)}K`;

const statusBadge: Record<Community['status'], { label: string; bg: string; color: string }> = {
  selling: { label: 'Now Selling', bg: '#dcfce7', color: '#15803d' },
  'coming-soon': { label: 'Coming Soon', bg: '#fef9c3', color: '#854d0e' },
  'sold-out': { label: 'Sold Out', bg: '#f3f4f6', color: '#6b7280' },
};

function builderIcon(logoColor: string, initial: string) {
  return L.divIcon({
    html: `<div style="background:${logoColor};width:28px;height:28px;border-radius:50%;border:2px solid white;display:flex;align-items:center;justify-content:center;color:white;font-weight:bold;font-size:11px;box-shadow:0 2px 6px rgba(0,0,0,0.3)">${initial}</div>`,
    className: '',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -16],
  });
}

function MapBounds({ communities }: { communities: Community[] }) {
  const map = useMap();
  useEffect(() => {
    if (communities.length === 0) return;
    const bounds = L.latLngBounds(communities.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [40, 40] });
  }, [communities, map]);
  return null;
}

// Wrapper that safely unmounts the Leaflet map to avoid StrictMode "already initialized" errors
function SafeMapContainer({ communities }: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      // On unmount, remove any Leaflet map attached to this container
      if (containerRef.current) {
        const el = containerRef.current.querySelector('.leaflet-container') as HTMLElement & {
          _leaflet_id?: unknown;
        };
        if (el && el._leaflet_id) {
          delete el._leaflet_id;
        }
      }
    };
  }, []);

  const center: [number, number] = [40.233, -111.658];

  return (
    <div ref={containerRef} style={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={center}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapBounds communities={communities} />

        {communities.map((community) => {
          const icon = builderIcon(community.photoColor, community.builderName[0]);
          const badge = statusBadge[community.status];
          const activeIncentives = community.incentives.filter((i) => i.active);

          return (
            <Marker
              key={community.id}
              position={[community.lat, community.lng]}
              icon={icon}
            >
              <Popup maxWidth={240} className="community-popup">
                <div style={{ fontFamily: 'Inter, system-ui, sans-serif', width: 220, padding: '2px 0' }}>
                  <div style={{ marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f2744', lineHeight: 1.3 }}>
                      {community.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {community.builderName}
                    </div>
                  </div>

                  <div style={{ marginBottom: 6 }}>
                    <span style={{ display: 'inline-block', background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
                      {badge.label}
                    </span>
                  </div>

                  <div style={{ fontSize: 12, color: '#334155', marginBottom: 4 }}>
                    <strong>{fmt(community.priceMin)}</strong>
                    {community.priceMax > community.priceMin && ` – ${fmt(community.priceMax)}`}
                  </div>

                  {community.specHomes.length > 0 && (
                    <div style={{ fontSize: 11, color: '#475569', marginBottom: 4 }}>
                      {community.specHomes.length} spec home{community.specHomes.length !== 1 ? 's' : ''} available
                    </div>
                  )}

                  {activeIncentives.length > 0 && (
                    <div style={{ background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 6, padding: '4px 8px', marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: '#92400e', fontWeight: 700 }}>
                        {activeIncentives.length} Active Incentive{activeIncentives.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/communities/${community.slug}`}
                    style={{ display: 'block', textAlign: 'center', background: community.photoColor, color: 'white', borderRadius: 8, padding: '7px 12px', fontSize: 12, fontWeight: 700, textDecoration: 'none' }}
                  >
                    View Community →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default function MapView({ communities }: MapViewProps) {
  return <SafeMapContainer communities={communities} />;
}
