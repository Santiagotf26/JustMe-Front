import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin, Clock, Shield, Sparkles, Scissors, Heart, Hand, Droplets, Waves, Gem } from 'lucide-react';
import { Button } from '../../components/ui';
import { ThemeToggle } from '../../components/ui/ThemeToggle';
import { Scene3D } from '../../components/three/Scene3D';
import './Landing.css';

const services = [
  { name: 'Barber', icon: <Scissors size={28} />, color: '#dc2626' },
  { name: 'Hair Stylist', icon: <Sparkles size={28} />, color: '#f59e0b' },
  { name: 'Makeup', icon: <Star size={28} />, color: '#f59e0b' },
  { name: 'Nails', icon: <Hand size={28} />, color: '#ec4899' },
  { name: 'Skincare', icon: <Droplets size={28} />, color: '#10b981' },
  { name: 'Massage', icon: <Heart size={28} />, color: '#6366f1' },
  { name: 'Spa', icon: <Waves size={28} />, color: '#06b6d4' },
  { name: 'Grooming', icon: <Scissors size={28} />, color: '#8b5cf6' },
];

const steps = [
  { num: '01', title: 'Choose your service', desc: 'Browse beauty categories and find exactly what you need.' },
  { num: '02', title: 'Find a professional', desc: 'Discover top-rated professionals near you, ranked intelligently.' },
  { num: '03', title: 'Book instantly', desc: 'Choose date, time, and location. Get instant confirmation.' },
  { num: '04', title: 'Enjoy the experience', desc: 'Get pampered with professional beauty services, your way.' },
];

const stats = [
  { value: '12K+', label: 'Happy Clients' },
  { value: '3K+', label: 'Professionals' },
  { value: '45K+', label: 'Bookings Made' },
  { value: '4.9', label: 'Average Rating' },
];

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="landing">
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-3d">
          <Scene3D color1="#dc2626" color2="#f59e0b" scale={2.2} distort={0.5} />
        </div>
        <div className="hero-overlay" />
        <nav className="landing-nav container">
          <div className="nav-brand">
            <span className="nav-logo-icon"><Sparkles size={20} /></span>
            <span className="nav-logo-text">JustMe</span>
          </div>
          <div className="nav-links">
            <a href="#services">Services</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#professionals">Professionals</a>
          </div>
          <div className="nav-actions">
            <ThemeToggle size="sm" />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Sign In</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>Get Started</Button>
          </div>
        </nav>

        <div className="hero-content container">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="hero-badge"><Gem size={14} /> The future of beauty services</span>
            <h1 className="hero-title">
              Beauty professionals,<br />
              <span className="text-gradient">at your fingertips</span>
            </h1>
            <p className="hero-subtitle">
              Discover and book top-rated beauty professionals near you. 
              Barbers, stylists, makeup artists, and more — all in one place.
            </p>
            <div className="hero-actions">
              <Button size="lg" onClick={() => navigate('/register')} iconRight={<ArrowRight size={20} />}>
                Book a Professional
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/register?role=professional')}>
                Join as Professional
              </Button>
            </div>
            <div className="hero-stats">
              {stats.map((s, i) => (
                <motion.div
                  key={s.label}
                  className="hero-stat"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                >
                  <span className="hero-stat-value">{s.value}</span>
                  <span className="hero-stat-label">{s.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Section */}
      <section className="services-section" id="services">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">Our Services</span>
            <h2>Everything beauty,<br /><span className="text-gradient">in one place</span></h2>
            <p className="section-desc">From haircuts to spa treatments, find professionals for every beauty need.</p>
          </motion.div>

          <div className="services-grid">
            {services.map((svc, i) => (
              <motion.div
                key={svc.name}
                className="service-card glass"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                whileHover={{ y: -8, scale: 1.03 }}
              >
                <div className="service-icon" style={{ color: svc.color, background: `${svc.color}15` }}>
                  {svc.icon}
                </div>
                <h3>{svc.name}</h3>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-section" id="how-it-works">
        <div className="container">
          <motion.div
            className="section-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="section-badge">How It Works</span>
            <h2>Simple, fast,<br /><span className="text-gradient">beautiful</span></h2>
          </motion.div>

          <div className="steps-grid">
            {steps.map((step, i) => (
              <motion.div
                key={step.num}
                className="step-card"
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <span className="step-num">{step.num}</span>
                <h3>{step.title}</h3>
                <p>{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-grid">
            <motion.div className="feature-card glass" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <div className="feature-icon"><MapPin size={24} /></div>
              <h3>Location-based search</h3>
              <p>Find professionals within 5km of your location, ranked by proximity and rating.</p>
            </motion.div>
            <motion.div className="feature-card glass" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="feature-icon"><Clock size={24} /></div>
              <h3>Real-time availability</h3>
              <p>See live availability and book instantly. No more back-and-forth.</p>
            </motion.div>
            <motion.div className="feature-card glass" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="feature-icon"><Shield size={24} /></div>
              <h3>Verified professionals</h3>
              <p>All professionals are verified with real reviews from real clients.</p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="container">
          <motion.div
            className="cta-card"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2>Ready to transform your beauty experience?</h2>
            <p>Join thousands of happy clients and top-rated professionals.</p>
            <div className="cta-actions">
              <Button size="lg" onClick={() => navigate('/register')} iconRight={<ArrowRight size={20} />}>
                Get Started Free
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="nav-brand">
                <span className="nav-logo-icon"><Sparkles size={20} /></span>
                <span className="nav-logo-text">JustMe</span>
              </div>
              <p>The premium marketplace for beauty and personal care services.</p>
            </div>
            <div className="footer-links">
              <h4>Platform</h4>
              <a href="#">For Clients</a>
              <a href="#">For Professionals</a>
              <a href="#">Pricing</a>
            </div>
            <div className="footer-links">
              <h4>Company</h4>
              <a href="#">About</a>
              <a href="#">Blog</a>
              <a href="#">Careers</a>
            </div>
            <div className="footer-links">
              <h4>Support</h4>
              <a href="#">Help Center</a>
              <a href="#">Contact</a>
              <a href="#">Privacy</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 JustMe. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
