import { motion } from 'framer-motion';
import { Calendar, DollarSign, Star, TrendingUp, Clock, Users, AlertCircle } from 'lucide-react';
import { Card, Avatar, Badge, Rating, Button } from '../../components/ui';
import { mockBookings, mockReviews } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './ProDashboard.css';

const stats = [
  { label: "Today's Bookings", value: '4', icon: <Calendar size={20} />, color: 'var(--primary-500)', bg: 'var(--primary-50)' },
  { label: 'Weekly Earnings', value: '$580', icon: <DollarSign size={20} />, color: 'var(--success-500)', bg: 'var(--success-50)' },
  { label: 'Rating', value: '4.9', icon: <Star size={20} />, color: '#fbbf24', bg: '#fbbf2415' },
  { label: 'Total Clients', value: '1,250', icon: <Users size={20} />, color: 'var(--accent-500)', bg: 'var(--accent-100)' },
];

export default function ProDashboard() {
  const { switchRole } = useAuth();
  const navigate = useNavigate();
  const upcoming = mockBookings.filter(b => b.status === 'confirmed' || b.status === 'pending').slice(0, 3);
  const walletBalance = 4.5; // Trigger the <$5 warning for demo purposes

  return (
    <div className="pro-dash">
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
        {stats.map((s, i) => (
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
            <h2 className="earnings-amount">$2,340</h2>
          </div>
          <div className="earnings-trend"><TrendingUp size={16} /> +12.5%</div>
        </div>
        <div className="earnings-bar-container">
          {[65, 45, 80, 55, 90, 70, 50].map((h, i) => (
            <motion.div key={i} className="earnings-bar" initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.3 + i * 0.08, duration: 0.5 }} />
          ))}
        </div>
        <div className="earnings-days">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => <span key={d}>{d}</span>)}
        </div>
      </Card>

      <div className="dash-grid">
        {/* Upcoming */}
        <section>
          <h2>Upcoming Appointments</h2>
          <div className="dash-list">
            {upcoming.map(b => (
              <Card key={b.id} variant="default" padding="sm" className="dash-appt-card">
                <div className="dash-appt-top">
                  <div className="dash-appt-info">
                    <p className="dash-appt-name">{b.professionalName === 'Sofia Martinez' ? 'Client Name' : b.professionalName}</p>
                    <p className="dash-appt-svc">{b.service}</p>
                  </div>
                  <Badge variant={b.status === 'confirmed' ? 'success' : 'warning'}>{b.status}</Badge>
                </div>
                <div className="dash-appt-meta">
                  <span><Clock size={13} /> {b.time}</span>
                  <span><Calendar size={13} /> {b.date}</span>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Reviews */}
        <section>
          <h2>Recent Reviews</h2>
          <div className="dash-list">
            {mockReviews.slice(0, 3).map(r => (
              <Card key={r.id} variant="default" padding="sm" className="dash-review-card">
                <div className="dash-review-top">
                  <Avatar src={r.userAvatar} name={r.userName} size="xs" />
                  <span className="dash-review-name">{r.userName}</span>
                  <Rating value={r.rating} size="sm" />
                </div>
                <p className="dash-review-text">{r.comment}</p>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
