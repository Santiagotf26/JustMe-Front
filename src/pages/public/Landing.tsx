import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Star, MapPin, Clock, Shield, Sparkles, Scissors, Heart, Hand, Droplets, Waves, Gem } from 'lucide-react';
import { Button } from '../../components/ui';
import { ThemeToggle, LanguageToggle } from '../../components/ui';
import { useTranslation } from 'react-i18next';
import { Scene3D } from '../../components/three/Scene3D';
import './Landing.css';

export default function Landing() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const services = [
    { name: t('landing.servicesList.barber'), icon: <Scissors size={28} />, color: '#dc2626' },
    { name: t('landing.servicesList.hairStylist'), icon: <Sparkles size={28} />, color: '#f59e0b' },
    { name: t('landing.servicesList.makeup'), icon: <Star size={28} />, color: '#f59e0b' },
    { name: t('landing.servicesList.nails'), icon: <Hand size={28} />, color: '#ec4899' },
    { name: t('landing.servicesList.skincare'), icon: <Droplets size={28} />, color: '#10b981' },
    { name: t('landing.servicesList.massage'), icon: <Heart size={28} />, color: '#6366f1' },
    { name: t('landing.servicesList.spa'), icon: <Waves size={28} />, color: '#06b6d4' },
    { name: t('landing.servicesList.grooming'), icon: <Scissors size={28} />, color: '#8b5cf6' },
  ];

  const steps = [
    { num: '01', title: t('landing.steps.step1Title'), desc: t('landing.steps.step1Desc') },
    { num: '02', title: t('landing.steps.step2Title'), desc: t('landing.steps.step2Desc') },
    { num: '03', title: t('landing.steps.step3Title'), desc: t('landing.steps.step3Desc') },
    { num: '04', title: t('landing.steps.step4Title'), desc: t('landing.steps.step4Desc') },
  ];

  const stats = [
    { value: '12K+', label: t('landing.stats.clients') },
    { value: '3K+', label: t('landing.stats.professionals') },
    { value: '45K+', label: t('landing.stats.bookings') },
    { value: '4.9', label: t('landing.stats.rating') },
  ];


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
            <a href="#services">{t('nav.services')}</a>
            <a href="#how-it-works">{t('nav.howItWorks')}</a>
            <a href="#professionals">{t('nav.professionals')}</a>
          </div>
          <div className="nav-actions">
            <LanguageToggle size="sm" />
            <ThemeToggle size="sm" />
            <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>{t('nav.signIn')}</Button>
            <Button variant="primary" size="sm" onClick={() => navigate('/register')}>{t('nav.getStarted')}</Button>
          </div>
        </nav>

        <div className="hero-content container">
          <motion.div
            className="hero-text"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <span className="hero-badge"><Gem size={14} /> {t('landing.heroBadge')}</span>
            <h1 className="hero-title">
              {t('landing.heroTitle1')}<br />
              <span className="text-gradient">{t('landing.heroTitle2')}</span>
            </h1>
            <p className="hero-subtitle">
              {t('landing.heroSubtitle')}
            </p>
            <div className="hero-actions">
              <Button size="lg" onClick={() => navigate('/register')} iconRight={<ArrowRight size={20} />}>
                {t('landing.bookProfessional')}
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/register?role=professional')}>
                {t('landing.joinProfessional')}
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
            <span className="section-badge">{t('landing.servicesBadge')}</span>
            <h2>{t('landing.servicesTitle1')}<br /><span className="text-gradient">{t('landing.servicesTitle2')}</span></h2>
            <p className="section-desc">{t('landing.servicesDesc')}</p>
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
            <span className="section-badge">{t('landing.howBadge')}</span>
            <h2>{t('landing.howTitle1')}<br /><span className="text-gradient">{t('landing.howTitle2')}</span></h2>
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
              <h3>{t('landing.features.feature1Title')}</h3>
              <p>{t('landing.features.feature1Desc')}</p>
            </motion.div>
            <motion.div className="feature-card glass" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              <div className="feature-icon"><Clock size={24} /></div>
              <h3>{t('landing.features.feature2Title')}</h3>
              <p>{t('landing.features.feature2Desc')}</p>
            </motion.div>
            <motion.div className="feature-card glass" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
              <div className="feature-icon"><Shield size={24} /></div>
              <h3>{t('landing.features.feature3Title')}</h3>
              <p>{t('landing.features.feature3Desc')}</p>
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
            <h2>{t('landing.ctaTitle')}</h2>
            <p>{t('landing.ctaDesc')}</p>
            <div className="cta-actions">
              <Button size="lg" onClick={() => navigate('/register')} iconRight={<ArrowRight size={20} />}>
                {t('landing.ctaBtn')}
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
              <p>{t('landing.footer.desc')}</p>
            </div>
            <div className="footer-links">
              <h4>{t('landing.footer.platform')}</h4>
              <a href="#">{t('landing.footer.forClients')}</a>
              <a href="#">{t('landing.footer.forProfessionals')}</a>
              <a href="#">{t('landing.footer.pricing')}</a>
            </div>
            <div className="footer-links">
              <h4>{t('landing.footer.company')}</h4>
              <a href="#">{t('landing.footer.about')}</a>
              <a href="#">{t('landing.footer.blog')}</a>
              <a href="#">{t('landing.footer.careers')}</a>
            </div>
            <div className="footer-links">
              <h4>{t('landing.footer.support')}</h4>
              <a href="#">{t('landing.footer.helpCenter')}</a>
              <a href="#">{t('landing.footer.contact')}</a>
              <a href="#">{t('landing.footer.privacy')}</a>
            </div>
          </div>
          <div className="footer-bottom">
            <p>{t('landing.footer.rights')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
