import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { motion } from 'framer-motion';
import { Star, MapPin, Navigation, Heart } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import './MapView.css';

// Fix Leaflet's default icon path issue with bundlers
delete (L.Icon.Default.prototype as any)._getIconUrl;

// Custom marker icon creator
const createMarkerIcon = (type: 'user' | 'pro' | 'favorite' | 'selected') => {
  if (type === 'user') {
    return L.divIcon({
      className: 'custom-marker custom-marker-user',
      html: `<div class="user-marker-dot">
        <div class="user-marker-pulse"></div>
        <div class="user-marker-core"></div>
      </div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });
  }

  const isFav = type === 'favorite';
  const isSelected = type === 'selected';
  const size = isSelected ? 20 : 16;
  const color = '#dc2626';
  const ring = isFav ? `border: 3px solid #fbbf24; box-shadow: 0 2px 12px ${color}66, 0 0 16px #fbbf2444;` :
                isSelected ? `border: 3px solid white; box-shadow: 0 4px 20px ${color}88, 0 0 30px ${color}44;` :
                `border: 3px solid white; box-shadow: 0 2px 12px ${color}66, 0 0 24px ${color}33;`;

  return L.divIcon({
    className: `custom-marker ${isSelected ? 'custom-marker-selected' : ''}`,
    html: `<div style="
      width: ${size * 2}px; height: ${size * 2}px;
      background: ${color};
      ${ring}
      border-radius: 50%;
      animation: marker-drop 0.5s cubic-bezier(0.34,1.56,0.64,1);
      position: relative;
    ">${isFav ? '<span class="fav-marker-badge">★</span>' : ''}</div>`,
    iconSize: [size * 2, size * 2],
    iconAnchor: [size, size],
    popupAnchor: [0, -size],
  });
};

interface Professional {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  reviewCount: number;
  services: string[];
  price: number;
  distance?: number;
  location: { lat: number; lng: number };
  isFavorite?: boolean;
}

interface MapViewProps {
  professionals: Professional[];
  userLocation: { lat: number; lng: number } | null;
  onProfessionalClick?: (id: string) => void;
  loading?: boolean;
  variant?: 'default' | 'fullscreen';
  selectedId?: string | null;
  zoom?: number;
  center?: { lat: number; lng: number } | null;
}

function RecenterMap({ lat, lng, zoom }: { lat: number; lng: number; zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], zoom || 14, { animate: true, duration: 0.8 });
  }, [map, lat, lng, zoom]);
  return null;
}

export function MapView({ professionals, userLocation, onProfessionalClick, loading, variant = 'default', selectedId, zoom, center }: MapViewProps) {
  const mapRef = useRef<any>(null);
  const mapCenter = center || userLocation || { lat: 4.711, lng: -74.0721 };

  if (loading) {
    return (
      <div className={`map-loading ${variant === 'fullscreen' ? 'map-loading-full' : ''}`}>
        <div className="map-loading-pulse" />
        <Navigation size={32} className="map-loading-icon" />
        <p>Detecting your location...</p>
      </div>
    );
  }

  return (
    <motion.div
      className={`map-container ${variant === 'fullscreen' ? 'map-container-fullscreen' : ''}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <MapContainer
        ref={mapRef}
        center={[mapCenter.lat, mapCenter.lng]}
        zoom={zoom || 14}
        style={{ height: '100%', width: '100%' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <RecenterMap lat={mapCenter.lat} lng={mapCenter.lng} zoom={zoom} />

        {/* User location marker */}
        {userLocation && (
          <Marker position={[userLocation.lat, userLocation.lng]} icon={createMarkerIcon('user')}>
            <Popup>
              <div className="map-popup-user">
                <MapPin size={16} /> Your location
              </div>
            </Popup>
          </Marker>
        )}

        {/* Professional markers */}
        {professionals.map((pro) => (
          <Marker
            key={pro.id}
            position={[pro.location.lat, pro.location.lng]}
            icon={createMarkerIcon(
              selectedId === pro.id ? 'selected' :
              pro.isFavorite ? 'favorite' : 'pro'
            )}
            eventHandlers={{
              click: () => onProfessionalClick?.(pro.id),
            }}
          >
            <Popup>
              <div className="map-popup-card">
                <div className="map-popup-header">
                  <img src={pro.avatar} alt={pro.name} className="map-popup-avatar" />
                  <div>
                    <h4>{pro.name} {pro.isFavorite && <Heart size={12} fill="#fbbf24" color="#fbbf24" style={{ verticalAlign: 'middle' }} />}</h4>
                    <div className="map-popup-rating">
                      <Star size={12} fill="#fbbf24" color="#fbbf24" />
                      <span>{pro.rating}</span>
                      <span className="map-popup-count">({pro.reviewCount})</span>
                    </div>
                  </div>
                </div>
                <div className="map-popup-services">
                  {pro.services.slice(0, 2).map(s => (
                    <span key={s} className="map-popup-tag">{s}</span>
                  ))}
                </div>
                <div className="map-popup-footer">
                  <span className="map-popup-price">${pro.price}</span>
                  {pro.distance !== undefined && (
                    <span className="map-popup-distance">{pro.distance.toFixed(1)} km</span>
                  )}
                  <button
                    className="map-popup-btn"
                    onClick={() => onProfessionalClick?.(pro.id)}
                  >
                    View Profile
                  </button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </motion.div>
  );
}
