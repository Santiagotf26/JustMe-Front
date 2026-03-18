import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Star, TrendingUp, Clock, Users, AlertCircle, Loader } from 'lucide-react';
import { Card, Avatar, Badge, Rating, Button } from '../../components/ui';
import { VerificationBanner } from '../../components/ui/VerificationBanner';
import { bookingService } from '../../services/bookingService';
import { professionalsService } from '../../services/professionalsService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProDashboard.css';

export default function ProDashboard() {
  const { switchRole, verificationStatus, professionalId } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!professionalId) { setLoading(false); return; }

        const [bookingData, statsData] = await Promise.all([
          bookingService.getProfessionalBookings(professionalId).catch(() => []),
          professionalsService.getDashboardStats(professionalId).catch(() => null),
        ]);

        const bList = Array.isArray(bookingData) ? bookingData : (bookingData?.data || []);
        setBookings(bList);

        const revData = await professionalsService.getReviews(professionalId).catch(() => []);
        setReviews(Array.isArray(revData) ? revData : []);

        if (statsData) {
          setStats(statsData);
          setWalletBalance(statsData.totalEarnings || 0);
        }
      } catch (err) {
        console.warn('Failed to load dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [professionalId]);

  const upcoming = bookings
    .filter((b: any) => b.status === 'confirmed' || b.status === 'pending')
    .slice(0, 3);

  const todayBookings = bookings.filter((b: any) => {
    const bDate = new Date(b.scheduledAt || b.date);
    const today = new Date();
    return bDate.toDateString() === today.toDateString();
  });

  const dashStats = [
    { label: "Today's Bookings", value: String(todayBookings.length), icon: <Calendar size={20} />, color: 'var(--primary-500)', bg: 'var(--primary-50)' },
    { label: 'Weekly Earnings', value: stats?.weeklyEarnings ? `$${stats.weeklyEarnings}` : '$0', icon: <DollarSign size={20} />, color: 'var(--success-500)', bg: 'var(--success-50)' },
    { label: 'Rating', value: String(stats?.rating || '0'), icon: <Star size={20} />, color: '#fbbf24', bg: '#fbbf2415' },
    { label: 'Total Clients', value: String(stats?.totalClients || bookings.length), icon: <Users size={20} />, color: 'var(--accent-500)', bg: 'var(--accent-100)' },
  ];

  if (loading) {
    return (
      <div className="pro-dash" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  return (
    <div className="pro-dash">
      <VerificationBanner status={verificationStatus} />

      <div className="pro-dash-header">
        <div>
          <h1>Dashboard</h1>
          <p className="dash-date">{new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => { switchRole('user'); navigate('/user'); }}>
          Switch to Client Mode
        </Button>
      </div>

      {walletBalance < 5 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="dash-alert">
          <AlertCircle size={20} />
          <div>
            <strong>Low Balance Warning</strong>
            <p>Your wallet balance is ${walletBalance.toFixed(2)}. Please recharge to stay visible in search results.</p>
          </div>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="dash-stats">
        {dashStats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card variant="default" padding="md" className="stat-card">
              <div className="stat-icon" style={{ color: s.color, background: s.bg }}>{s.icon}</div>
              <div className="stat-content">
                <span className="stat-value">{s.value}</span>
                <span className="stat-lbl">{s.label}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Earnings Overview */}
      <Card variant="gradient" padding="lg" className="earnings-overview-card">
        <div className="earnings-top">
          <div>
            <p className="earnings-label">Monthly Earnings</p>
            <h2 className="earnings-amount">${stats?.monthlyEarnings || 0}</h2>
          </div>
          <div className="earnings-trend"><TrendingUp size={16} /> {stats?.growthPercent || 0}%</div>
        </div>
        <div className="earnings-bar-container">
          {(stats?.weeklyBreakdown || [65, 45, 80, 55, 90, 70, 50]).map((h: number, i: number) => (
            <motion.div key={i} className="earnings-bar" initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }} />
          ))}
        </div>
        <div className="earnings-days">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => <span key={d}>{d}</span>)}
        </div>
      </Card>

      <div className="dash-grid">
        {/* Upcoming */}
        <section>
          <h2>Upcoming Appointments</h2>
          <div className="dash-list">
            {upcoming.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
                <Calendar size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p>No upcoming appointments</p>
              </div>
            ) : (
              upcoming.map((b: any) => {
                const clientName = b.client?.name || b.user?.name || b.professionalName || 'Client';
                const svcName = b.service?.name || b.serviceName || b.service || 'Service';
                const bDate = new Date(b.scheduledAt || b.date || new Date());
                return (
                  <Card key={b.id} variant="default" padding="sm" className="dash-appt-card">
                    <div className="dash-appt-top">
                      <div className="dash-appt-info">
                        <p className="dash-appt-name">{clientName}</p>
                        <p className="dash-appt-svc">{svcName}</p>
                      </div>
                      <Badge variant={b.status === 'confirmed' ? 'success' : 'warning'}>{b.status}</Badge>
                    </div>
                    <div className="dash-appt-meta">
                      <span><Clock size={13} /> {b.time || bDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</span>
                      <span><Calendar size={13} /> {bDate.toLocaleDateString('en', { month: 'short', day: 'numeric' })}</span>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </section>

        {/* Recent Reviews */}
        <section>
          <h2>Recent Reviews</h2>
          <div className="dash-list">
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
                <Star size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p>No reviews yet</p>
              </div>
            ) : (
              reviews.slice(0, 3).map((r: any) => (
                <Card key={r.id} variant="default" padding="sm" className="dash-review-card">
                  <div className="dash-review-top">
                    <Avatar src={r.userAvatar || r.user?.avatar} name={r.userName || r.user?.name || 'User'} size="xs" />
                    <span className="dash-review-name">{r.userName || r.user?.name || 'User'}</span>
                    <Rating value={r.rating || 0} size="sm" />
                  </div>
                  <p className="dash-review-text">{r.comment || r.text}</p>
                </Card>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
