import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Scissors, Sparkles, Star, Hand, Droplets, Heart, Waves, User,
  MapPin, Home, Building, Calendar, Clock, Search as SearchIcon,
  ArrowLeft, ArrowRight, Check, X, ChevronDown, ChevronUp,
  Loader2, CheckCircle, Navigation
} from 'lucide-react';
import { MapView } from '../../components/map/MapView';
import { mockProfessionals } from '../../data/mockData';
import { useGeolocation } from '../../hooks';
import { calculateDistance } from '../../services/geolocation';
import { useNotification } from '../../context/NotificationContext';
import './Search.css';

type Phase = 'choose' | 'searching' | 'results' | 'profile' | 'confirmed';

const serviceIcons: Record<string, JSX.Element> = {
  'Barber': <Scissors size={22} />,
  'Hair Stylist': <Sparkles size={22} />,
  'Makeup': <Star size={22} />,
  'Nails': <Hand size={22} />,
  'Skincare': <Droplets size={22} />,
  'Massage': <Heart size={22} />,
  'Spa': <Waves size={22} />,
  'Grooming': <User size={22} />,
};

const serviceColors: Record<string, string> = {
  'Barber': '#dc2626',
  'Hair Stylist': '#f59e0b',
  'Makeup': '#ec4899',
  'Nails': '#d946ef',
  'Skincare': '#10b981',
  'Massage': '#6366f1',
  'Spa': '#06b6d4',
  'Grooming': '#8b5cf6',
};

const timeSlots = ['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM'];

export default function SearchPage() {
  const navigate = useNavigate();
  const geo = useGeolocation();
  const { notify } = useNotification();

  // Flow state
  const [phase, setPhase] = useState<Phase>('choose');

  // Service selection
  const [selectedService, setSelectedService] = useState('');
  const [locationType, setLocationType] = useState<'home' | 'professional'>('professional');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  // Results
  const [selectedProId, setSelectedProId] = useState<string | null>(null);
  const [panelExpanded, setPanelExpanded] = useState(true);

  // Booking
  const [bookingSlot, setBookingSlot] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);

  // Generate next 7 days
  const dates = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return {
      label: d.toLocaleDateString('en', { weekday: 'short' }),
      date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }),
      value: d.toISOString().split('T')[0],
    };
  }), []);

  // Professionals with distance
  const prosWithDistance = useMemo(() => mockProfessionals.map(p => ({
    ...p,
    distance: geo.latitude && geo.longitude
      ? calculateDistance(geo.latitude, geo.longitude, p.location.lat, p.location.lng)
      : p.distance,
  })), [geo.latitude, geo.longitude]);

  // Filter by service and 5km
  const filtered = useMemo(() => {
    return prosWithDistance
      .filter(p => selectedService === '' || p.services.includes(selectedService))
      .filter(p => p.distance <= 5)
      .sort((a, b) => {
        // Favorites first
        if (a.isFavorite && !b.isFavorite) return -1;
        if (!a.isFavorite && b.isFavorite) return 1;
        return a.distance - b.distance;
      });
  }, [prosWithDistance, selectedService]);

  const favorites = filtered.filter(p => p.isFavorite);
  const nearby = filtered.filter(p => !p.isFavorite);
  const selectedPro = prosWithDistance.find(p => p.id === selectedProId);

  const canSearch = selectedService && selectedDate && selectedTime;

  const handleSearch = async () => {
    setPhase('searching');
    await new Promise(r => setTimeout(r, 2200));
    setPhase('results');
    setPanelExpanded(true);
  };

  const handleSelectPro = (id: string) => {
    setSelectedProId(id);
    setPhase('profile');
    setBookingSlot('');
  };

  const handleConfirmBooking = async () => {
    setBookingLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setBookingLoading(false);
    setPhase('confirmed');
    notify('success', 'Booking confirmed!', `Your appointment with ${selectedPro?.name} has been scheduled.`);
  };

  const handleReset = () => {
    setPhase('choose');
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedProId(null);
    setBookingSlot('');
    setPanelExpanded(true);
  };

  // Map professionals for MapView
  const mapPros = (phase === 'results' || phase === 'profile')
    ? filtered.map(p => ({ ...p, location: p.location }))
    : [];

  const mapCenter = selectedPro
    ? { lat: selectedPro.location.lat, lng: selectedPro.location.lng }
    : null;

  const mapZoom = phase === 'profile' ? 16 : undefined;

  return (
    <div className="uber-search">
      {/* Fullscreen Map */}
      <div className="uber-map-area">
        <MapView
          professionals={mapPros}
          userLocation={geo.latitude && geo.longitude ? { lat: geo.latitude, lng: geo.longitude } : null}
          onProfessionalClick={handleSelectPro}
          loading={geo.loading}
          variant="fullscreen"
          selectedId={selectedProId}
          zoom={mapZoom}
          center={mapCenter}
        />
      </div>

      {/* Floating Panels */}
      <AnimatePresence mode="wait">
        {/* ─── PHASE: Choose Service ─── */}
        {phase === 'choose' && (
          <motion.div
            key="choose"
            className="uber-panel uber-panel-choose glass-strong"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="uber-panel-handle" onClick={() => setPanelExpanded(!panelExpanded)}>
              <div className="uber-handle-bar" />
            </div>

            <div className="uber-panel-header">
              <SearchIcon size={20} />
              <h2>Choose your service</h2>
            </div>

            {panelExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="uber-panel-body"
              >
                {/* Service Categories */}
                <div className="uber-services-grid">
                  {Object.entries(serviceIcons).map(([name, icon]) => (
                    <motion.button
                      key={name}
                      className={`uber-svc-btn ${selectedService === name ? 'uber-svc-active' : ''}`}
                      onClick={() => setSelectedService(name)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <span className="uber-svc-icon" style={{ color: serviceColors[name], background: `${serviceColors[name]}15` }}>
                        {icon}
                      </span>
                      <span className="uber-svc-label">{name}</span>
                    </motion.button>
                  ))}
                </div>

                {/* Location Type */}
                <div className="uber-section">
                  <h3><MapPin size={16} /> Service Location</h3>
                  <div className="uber-loc-toggle">
                    <button
                      className={`uber-loc-btn ${locationType === 'professional' ? 'uber-loc-active' : ''}`}
                      onClick={() => setLocationType('professional')}
                    >
                      <Building size={18} />
                      <span>Visit Professional</span>
                    </button>
                    <button
                      className={`uber-loc-btn ${locationType === 'home' ? 'uber-loc-active' : ''}`}
                      onClick={() => setLocationType('home')}
                    >
                      <Home size={18} />
                      <span>Home Service</span>
                    </button>
                  </div>
                </div>

                {/* Date */}
                <div className="uber-section">
                  <h3><Calendar size={16} /> Select Date</h3>
                  <div className="uber-date-scroll">
                    {dates.map(d => (
                      <button
                        key={d.value}
                        className={`uber-date-chip ${selectedDate === d.value ? 'uber-date-active' : ''}`}
                        onClick={() => setSelectedDate(d.value)}
                      >
                        <span className="uber-date-day">{d.label}</span>
                        <span className="uber-date-num">{d.date}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time */}
                <div className="uber-section">
                  <h3><Clock size={16} /> Select Time</h3>
                  <div className="uber-time-grid">
                    {timeSlots.map(t => (
                      <button
                        key={t}
                        className={`uber-time-chip ${selectedTime === t ? 'uber-time-active' : ''}`}
                        onClick={() => setSelectedTime(t)}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Search Button */}
                <motion.button
                  className="uber-search-btn"
                  disabled={!canSearch}
                  onClick={handleSearch}
                  whileHover={canSearch ? { scale: 1.02 } : {}}
                  whileTap={canSearch ? { scale: 0.98 } : {}}
                >
                  <SearchIcon size={20} />
                  Search Professionals
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── PHASE: Searching ─── */}
        {phase === 'searching' && (
          <motion.div
            key="searching"
            className="uber-panel uber-panel-searching glass-strong"
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
          >
            <div className="uber-searching-content">
              <div className="uber-radar">
                <div className="uber-radar-ring uber-radar-1" />
                <div className="uber-radar-ring uber-radar-2" />
                <div className="uber-radar-ring uber-radar-3" />
                <div className="uber-radar-dot" />
              </div>
              <div className="uber-searching-text">
                <h2>Searching for professionals</h2>
                <p>Finding the best {selectedService.toLowerCase()} near you...</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ─── PHASE: Results ─── */}
        {phase === 'results' && (
          <motion.div
            key="results"
            className="uber-panel uber-panel-results glass-strong"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="uber-panel-handle" onClick={() => setPanelExpanded(!panelExpanded)}>
              <div className="uber-handle-bar" />
            </div>

            <div className="uber-results-header">
              <button className="uber-back-btn" onClick={handleReset}>
                <ArrowLeft size={18} />
              </button>
              <div>
                <h2>{filtered.length} professionals found</h2>
                <p>{selectedService} • {selectedDate && new Date(selectedDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })} • {selectedTime}</p>
              </div>
              <button className="uber-expand-btn" onClick={() => setPanelExpanded(!panelExpanded)}>
                {panelExpanded ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
              </button>
            </div>

            {panelExpanded && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="uber-results-body"
              >
                {/* Favorites */}
                {favorites.length > 0 && (
                  <div className="uber-results-section">
                    <h3 className="uber-section-title">
                      <Heart size={14} fill="#fbbf24" color="#fbbf24" />
                      Favorite Professionals
                    </h3>
                    {favorites.map((pro, i) => (
                      <motion.div
                        key={pro.id}
                        className="uber-pro-card uber-pro-fav"
                        onClick={() => handleSelectPro(pro.id)}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                      >
                        <img src={pro.avatar} alt={pro.name} className="uber-pro-avatar" />
                        <div className="uber-pro-info">
                          <h4>{pro.name} {pro.verified && <CheckCircle size={13} className="uber-verified" />}</h4>
                          <div className="uber-pro-meta">
                            <span><Star size={12} fill="#fbbf24" color="#fbbf24" /> {pro.rating}</span>
                            <span><MapPin size={12} /> {pro.distance.toFixed(1)} km</span>
                            <span className="uber-pro-avail">{pro.availability}</span>
                          </div>
                        </div>
                        <div className="uber-pro-price">${pro.price}</div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Nearby */}
                <div className="uber-results-section">
                  <h3 className="uber-section-title">
                    <MapPin size={14} />
                    Nearby Professionals
                  </h3>
                  {nearby.map((pro, i) => (
                    <motion.div
                      key={pro.id}
                      className="uber-pro-card"
                      onClick={() => handleSelectPro(pro.id)}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (favorites.length + i) * 0.1 }}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <img src={pro.avatar} alt={pro.name} className="uber-pro-avatar" />
                      <div className="uber-pro-info">
                        <h4>{pro.name} {pro.verified && <CheckCircle size={13} className="uber-verified" />}</h4>
                        <div className="uber-pro-meta">
                          <span><Star size={12} fill="#fbbf24" color="#fbbf24" /> {pro.rating}</span>
                          <span><MapPin size={12} /> {pro.distance.toFixed(1)} km</span>
                          <span className="uber-pro-avail">{pro.availability}</span>
                        </div>
                        <div className="uber-pro-tags">
                          {pro.services.slice(0, 2).map(s => <span key={s}>{s}</span>)}
                        </div>
                      </div>
                      <div className="uber-pro-price">${pro.price}</div>
                    </motion.div>
                  ))}

                  {nearby.length === 0 && favorites.length === 0 && (
                    <div className="uber-no-results">
                      <SearchIcon size={40} />
                      <h3>No professionals found</h3>
                      <p>Try selecting a different service or expanding your search area.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── PHASE: Professional Profile ─── */}
        {phase === 'profile' && selectedPro && (
          <motion.div
            key="profile"
            className="uber-panel uber-panel-profile glass-strong"
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className="uber-panel-handle" onClick={() => setPanelExpanded(!panelExpanded)}>
              <div className="uber-handle-bar" />
            </div>

            {/* Profile Header */}
            <div className="uber-profile-header">
              <button className="uber-back-btn" onClick={() => { setPhase('results'); setSelectedProId(null); }}>
                <ArrowLeft size={18} />
              </button>
              <img src={selectedPro.avatar} alt={selectedPro.name} className="uber-profile-avatar" />
              <div className="uber-profile-info">
                <h2>
                  {selectedPro.name}
                  {selectedPro.isFavorite && <Heart size={14} fill="#fbbf24" color="#fbbf24" />}
                  {selectedPro.verified && <CheckCircle size={14} className="uber-verified" />}
                </h2>
                <div className="uber-profile-stats">
                  <span><Star size={13} fill="#fbbf24" color="#fbbf24" /> {selectedPro.rating} ({selectedPro.reviewCount})</span>
                  <span><MapPin size={13} /> {selectedPro.distance.toFixed(1)} km</span>
                  <span>{selectedPro.completedServices} services</span>
                </div>
              </div>
            </div>

            {panelExpanded && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="uber-profile-body">
                <p className="uber-profile-bio">{selectedPro.bio}</p>

                {/* Location info */}
                <div className="uber-profile-location">
                  <MapPin size={14} />
                  <span>{locationType === 'home' ? 'Home service' : selectedPro.location.address}</span>
                </div>

                {/* Availability Calendar */}
                <div className="uber-avail-section">
                  <h3><Calendar size={16} /> Available Slots</h3>
                  <div className="uber-avail-calendar">
                    {selectedPro.availableSlots.slice(0, 5).map(day => {
                      const dayDate = new Date(day.date);
                      const isSelectedDay = selectedDate === day.date;
                      return (
                        <div key={day.date} className={`uber-avail-day ${isSelectedDay ? 'uber-avail-day-active' : ''}`}>
                          <div className="uber-avail-day-header">
                            <span className="uber-avail-weekday">{dayDate.toLocaleDateString('en', { weekday: 'short' })}</span>
                            <span className="uber-avail-date">{dayDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                          </div>
                          <div className="uber-avail-slots">
                            {day.slots.map(slot => (
                              <button
                                key={`${day.date}-${slot}`}
                                className={`uber-slot-btn ${bookingSlot === `${day.date}-${slot}` ? 'uber-slot-active' : ''}`}
                                onClick={() => { setBookingSlot(`${day.date}-${slot}`); setSelectedDate(day.date); setSelectedTime(slot); }}
                              >
                                {slot}
                              </button>
                            ))}
                            {day.slots.length === 0 && (
                              <span className="uber-slot-empty">No slots</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Booking Button */}
                <motion.button
                  className="uber-book-btn"
                  disabled={!bookingSlot || bookingLoading}
                  onClick={handleConfirmBooking}
                  whileHover={bookingSlot ? { scale: 1.02 } : {}}
                  whileTap={bookingSlot ? { scale: 0.98 } : {}}
                >
                  {bookingLoading ? (
                    <><Loader2 size={20} className="spin-icon" /> Confirming...</>
                  ) : (
                    <>Book Now — ${selectedPro.price}</>
                  )}
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ─── PHASE: Confirmed ─── */}
        {phase === 'confirmed' && selectedPro && (
          <motion.div
            key="confirmed"
            className="uber-panel uber-panel-confirmed glass-strong"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          >
            <motion.div
              className="uber-confirm-check"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
            >
              <Check size={40} />
            </motion.div>
            <h2>Booking Confirmed!</h2>
            <p>Your appointment has been scheduled</p>

            <div className="uber-confirm-details">
              <div className="uber-confirm-pro">
                <img src={selectedPro.avatar} alt={selectedPro.name} />
                <div>
                  <strong>{selectedPro.name}</strong>
                  <span>{selectedService}</span>
                </div>
              </div>
              <div className="uber-confirm-rows">
                <div><Calendar size={14} /> <span>{selectedDate && new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                <div><Clock size={14} /> <span>{selectedTime}</span></div>
                <div><MapPin size={14} /> <span>{locationType === 'home' ? 'Home Service' : selectedPro.location.address}</span></div>
              </div>
              <div className="uber-confirm-price">
                <span>Total</span>
                <strong>${selectedPro.price}</strong>
              </div>
            </div>

            <div className="uber-confirm-actions">
              <motion.button className="uber-confirm-main-btn" onClick={() => navigate('/user/appointments')} whileTap={{ scale: 0.97 }}>
                View Appointments
              </motion.button>
              <motion.button className="uber-confirm-ghost-btn" onClick={handleReset} whileTap={{ scale: 0.97 }}>
                Book Another
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Location indicator */}
      {phase !== 'confirmed' && (
        <div className="uber-location-pill glass-strong">
          <Navigation size={14} />
          <span>{geo.error ? 'Bogotá (default)' : 'Your location'}</span>
        </div>
      )}
    </div>
  );
}
