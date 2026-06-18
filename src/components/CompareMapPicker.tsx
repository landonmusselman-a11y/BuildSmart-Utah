'use client';

import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Community } from '@/types';

// ─── Leaflet icon fix for Next.js ─────────────────────────────────────────────
delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n >= 1_000_000 ? `$${(n / 1_000_000).toFixed(1)}M` : `$${Math.round(n / 1000)}K`;

const STATUS_STYLES: Record<Community['status'], { label: string; bg: string; color: string }> = {
  selling:      { label: 'Now Selling',  bg: '#dcfce7', color: '#15803d' },
  'coming-soon':{ label: 'Coming Soon',  bg: '#fef9c3', color: '#854d0e' },
  'sold-out':   { label: 'Sold Out',     bg: '#f3f4f6', color: '#6b7280' },
};

function makeIcon(community: Community, selected: boolean, maxed: boolean) {
  const size   = selected ? 38 : 30;
  const border = selected ? '3px solid #d97706' : '2px solid white';
  const bg     = maxed && !selected ? '#9ca3af' : community.photoColor;
  const shadow = selected
    ? '0 0 0 3px rgba(217,119,6,0.35), 0 3px 10px rgba(0,0,0,0.4)'
    : '0 2px 6px rgba(0,0,0,0.3)';
  const initial = community.builderName[0].toUpperCase();
  const checkmark = selected
    ? `<div style="position:absolute;top:-5px;right:-5px;width:16px;height:16px;background:#d97706;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2px solid white;font-size:9px;color:white;font-weight:900;line-height:1">✓</div>`
    : '';

  return L.divIcon({
    html: `<div style="position:relative;width:${size}px;height:${size}px">
      <div style="width:${size}px;height:${size}px;border-radius:50%;border:${border};background:${bg};display:flex;align-items:center;justify-content:center;color:white;font-weight:700;font-size:${selected ? 13 : 11}px;box-shadow:${shadow};transition:all 0.2s">${initial}</div>
      ${checkmark}
    </div>`,
    className: '',
    iconSize:   [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor:[0, -(size / 2 + 4)],
  });
}

// ─── Auto-fit map bounds ──────────────────────────────────────────────────────

function FitBounds({ communities }: { communities: Community[] }) {
  const map = useMap();
  const fitted = useRef(false);
  useEffect(() => {
    if (fitted.current || communities.length === 0) return;
    const bounds = L.latLngBounds(communities.map((c) => [c.lat, c.lng]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    fitted.current = true;
  }, [communities, map]);
  return null;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CompareMapPickerProps {
  communities: Community[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  maxSelected?: number;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CompareMapPicker({
  communities,
  selectedIds,
  onToggle,
  maxSelected = 5,
}: CompareMapPickerProps) {
  const center: [number, number] = [40.5, -111.9];
  const isMaxed = selectedIds.length >= maxSelected;

  return (
    <MapContainer
      center={center}
      zoom={9}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds communities={communities} />

      {communities.map((community) => {
        const selected = selectedIds.includes(community.id);
        const maxedOut = isMaxed && !selected;
        const icon = makeIcon(community, selected, maxedOut);
        const badge = STATUS_STYLES[community.status];
        const activeIncentives = community.incentives.filter((i) => i.active);
        const hoaText = community.hoa ? `$${community.hoa.monthly}/mo HOA` : 'No HOA';
        const specCount = community.specHomes.filter((s) => s.status === 'move-in-ready').length;

        return (
          <Marker
            key={community.id}
            position={[community.lat, community.lng]}
            icon={icon}
          >
            <Popup maxWidth={260} minWidth={240} closeButton={true}>
              <div style={{ fontFamily: 'Inter, system-ui, sans-serif', padding: '4px 0', width: 240 }}>

                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: community.photoColor,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: 14,
                  }}>
                    {community.builderName[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f2744', lineHeight: 1.3 }}>
                      {community.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                      {community.builderName}
                    </div>
                    <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 1 }}>
                      📍 {community.city}, {community.county}
                    </div>
                  </div>
                </div>

                {/* Status + HOA row */}
                <div style={{ display: 'flex', gap: 6, marginBottom: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: badge.bg, color: badge.color, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20 }}>
                    {badge.label}
                  </span>
                  <span style={{ background: community.hoa ? '#fef3c7' : '#d1fae5', color: community.hoa ? '#92400e' : '#065f46', fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 20 }}>
                    {hoaText}
                  </span>
                </div>

                {/* Price + size */}
                <div style={{ background: '#f8fafc', borderRadius: 8, padding: '8px 10px', marginBottom: 8 }}>
                  <div style={{ fontSize: 15, fontWeight: 800, color: '#0f2744' }}>
                    {fmt(community.priceMin)} – {fmt(community.priceMax)}
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>
                    {community.sqftMin.toLocaleString()}–{community.sqftMax.toLocaleString()} sqft &nbsp;·&nbsp; {community.bedsRange} beds &nbsp;·&nbsp; {community.garageSpaces}-car garage
                  </div>
                </div>

                {/* Quick stats row */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 8, fontSize: 11, color: '#475569' }}>
                  {specCount > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      🏠 {specCount} move-in ready
                    </span>
                  )}
                  {activeIncentives.length > 0 && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: '#92400e', fontWeight: 600 }}>
                      ⚡ {activeIncentives.length} incentive{activeIncentives.length !== 1 ? 's' : ''}
                    </span>
                  )}
                  {community.basement?.available && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      🏗️ Basement avail.
                    </span>
                  )}
                </div>

                {/* Amenities preview */}
                {community.amenities && community.amenities.length > 0 && (
                  <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>
                      Amenities
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {community.amenities.slice(0, 4).map((a) => (
                        <span key={a} style={{ background: '#f1f5f9', color: '#475569', fontSize: 10, padding: '2px 6px', borderRadius: 4 }}>
                          {a}
                        </span>
                      ))}
                      {community.amenities.length > 4 && (
                        <span style={{ color: '#94a3b8', fontSize: 10, padding: '2px 0' }}>
                          +{community.amenities.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Compare button */}
                {maxedOut ? (
                  <div style={{ background: '#f3f4f6', color: '#9ca3af', borderRadius: 8, padding: '9px 12px', fontSize: 12, fontWeight: 600, textAlign: 'center' }}>
                    Max 5 communities selected
                  </div>
                ) : (
                  <button
                    onClick={() => onToggle(community.id)}
                    style={{
                      width: '100%',
                      background: selected ? '#fef3c7' : community.photoColor,
                      color: selected ? '#92400e' : 'white',
                      border: selected ? '2px solid #d97706' : 'none',
                      borderRadius: 8,
                      padding: '9px 12px',
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.15s',
                    }}
                  >
                    {selected ? (
                      <>✓ Added to Compare &nbsp;— Remove</>
                    ) : (
                      <>+ Add to Compare</>
                    )}
                  </button>
                )}
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}
