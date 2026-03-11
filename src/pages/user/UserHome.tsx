import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Search, ChevronRight, Scissors, Sparkles, Star, Hand, Heart, Droplets, Waves, User } from 'lucide-react';
import { Card, Button, Avatar, Rating } from '../../components/ui';
import { mockProfessionals } from '../../data/mockData';
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
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const topPros = mockProfessionals.slice(0, 4);

  return (
    <div className="user-home">
      {/* Location Banner */}
      <motion.div className="location-banner glass" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <MapPin size={18} className="location-pin" />
        <div className="location-text">
          <span className="location-label">Your location</span>
          <span className="location-address">Bogotá, Cundinamarca, Colombia</span>
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
        <div className="pros-scroll">
          {topPros.map((pro, i) => (
            <motion.div
              key={pro.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
            >
              <Card variant="glass" hover className="pro-card-home" onClick={() => navigate(`/user/professional/${pro.id}`)}>
                <Avatar src={pro.avatar} name={pro.name} size="lg" />
                <h3>{pro.name}</h3>
                <Rating value={pro.rating} size="sm" showValue count={pro.reviewCount} />
                <div className="pro-card-tags">
                  {pro.services.slice(0, 2).map(s => <span key={s} className="pro-tag">{s}</span>)}
                </div>
                <div className="pro-card-meta">
                  <span className="pro-distance"><MapPin size={13} /> {pro.distance} km</span>
                  <span className="pro-price">from ${pro.price}</span>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
