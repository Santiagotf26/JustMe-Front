import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, ChevronRight, Scissors, Sparkles, Star, Hand, Heart, Droplets, Waves, User, Loader } from 'lucide-react';
import { Card, Button, Avatar, Rating } from '../../components/ui';
import { professionalsService } from '../../services/professionalsService';
import { useGeolocation } from '../../hooks';
import './UserHome.css';

const categories = [
  { id: '1', name: 'Barber', icon: <Scissors size={24} />, color: '#8b45ff', bg: '#8b45ff12' },
  { id: '2', name: 'Hair Stylist', icon: <Sparkles size={24} />, color: '#ff3366', bg: '#ff336612' },
  { id: '3', name: 'Makeup', icon: <Star size={24} />, color: '#f59e0b', bg: '#f59e0b12' },
  { id: '4', name: 'Nails', icon: <Hand size={24} />, color: '#ec4899', bg: '#ec489912' },
  { id: '5', name: 'Skincare', icon: <Droplets size={24} />, color: '#10b981', bg: '#10b98112' },
  { id: '6', name: 'Massage', icon: <Heart size={24} />, color: '#6366f1', bg: '#6366f112' },
  { id: '7', name: 'Spa', icon: <Waves size={24} />, color: '#06b6d4', bg: '#06b6d412' },
  { id: '8', name: 'Grooming', icon: <User size={24} />, color: '#8b5cf6', bg: '#8b5cf612' },
];

export default function UserHome() {
  const navigate = useNavigate();
  const geo = useGeolocation();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [topPros, setTopPros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPros = async () => {
      setLoading(true);
      setError(null);
      try {
        const lat = geo.latitude || 4.711;
        const lng = geo.longitude || -74.0721;
        const data = await professionalsService.getNearbyProfessionals({
          latitude: lat,
          longitude: lng,
          radius: 10,
        });
        const list = Array.isArray(data) ? data : (data?.data || []);
        setTopPros(list.slice(0, 4));
      } catch (err: any) {
        console.warn('Failed to fetch top professionals', err);
        setError('No se pudieron cargar los profesionales');
        setTopPros([]);
      } finally {
        setLoading(false);
      }
    };

    if (!geo.loading) {
      fetchPros();
    }
  }, [geo.loading, geo.latitude, geo.longitude]);

  return (
    <div className="user-home">
      {/* Location Banner */}
      <motion.div className="location-banner glass" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <MapPin size={18} className="location-pin" />
        <div className="location-text">
          <span className="location-label">Your location</span>
          <span className="location-address">{geo.error ? 'Bogotá, Colombia (default)' : 'Your current location'}</span>
        </div>
        <button className="location-change">Change</button>
      </motion.div>

      {/* Hero Card */}
      <motion.div className="home-hero-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="home-hero-content">
          <h1>What service<br />do you need?</h1>
          <p>Find top-rated beauty professionals near you</p>
          <Button onClick={() => navigate('/user/search')} icon={<Search size={18} />}>
            Search Professionals
          </Button>
        </div>
        <div className="home-hero-decoration">
          <div className="hero-circle c1" />
          <div className="hero-circle c2" />
          <div className="hero-circle c3" />
        </div>
      </motion.div>

      {/* Service Categories */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Services</h2>
          <button className="see-all" onClick={() => navigate('/user/search')}>See all <ChevronRight size={16} /></button>
        </div>
        <div className="categories-grid">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              className={`category-chip ${selectedCategory === cat.id ? 'category-active' : ''}`}
              style={{ '--cat-color': cat.color, '--cat-bg': cat.bg } as React.CSSProperties}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setSelectedCategory(cat.id === selectedCategory ? null : cat.id);
                navigate('/user/search');
              }}
            >
              <div className="category-icon" style={{ color: cat.color, background: cat.bg }}>{cat.icon}</div>
              <span>{cat.name}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Top Professionals */}
      <section className="home-section">
        <div className="home-section-header">
          <h2>Top Professionals</h2>
          <button className="see-all" onClick={() => navigate('/user/search')}>See all <ChevronRight size={16} /></button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '2rem' }}>
            <Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
            <p>{error}</p>
            <Button size="sm" variant="ghost" onClick={() => window.location.reload()}>Retry</Button>
          </div>
        ) : topPros.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
            <User size={40} style={{ marginBottom: '8px', opacity: 0.4 }} />
            <p>No professionals found nearby</p>
            <Button size="sm" variant="ghost" onClick={() => navigate('/user/search')}>Search wider area</Button>
          </div>
        ) : (
          <div className="pros-scroll">
            {topPros.map((pro: any, i: number) => (
              <motion.div
                key={pro.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + i * 0.1 }}
              >
                <Card variant="glass" hover className="pro-card-home" onClick={() => navigate(`/user/professional/${pro.id}`)}>
                  <Avatar src={pro.avatar || pro.photoUrl || pro.user?.avatar} name={pro.name || pro.user?.name || 'Professional'} size="lg" />
                  <h3>{pro.name || pro.user?.name || 'Professional'}</h3>
                  <Rating value={pro.rating || 0} size="sm" showValue count={pro.reviewCount || 0} />
                  <div className="pro-card-tags">
                    {(pro.services || []).slice(0, 2).map((s: any) => (
                      <span key={typeof s === 'string' ? s : s.name} className="pro-tag">
                        {typeof s === 'string' ? s : s.name}
                      </span>
                    ))}
                  </div>
                  <div className="pro-card-meta">
                    <span className="pro-distance"><MapPin size={13} /> {(pro.distance || 0).toFixed(1)} km</span>
                    <span className="pro-price">from ${pro.price || pro.services?.[0]?.price || 0}</span>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
