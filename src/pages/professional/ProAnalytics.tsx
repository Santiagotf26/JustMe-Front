import { motion } from 'framer-motion';
import { TrendingUp, Users, Star, Award, ChevronRight, Activity, CalendarDays } from 'lucide-react';
import { Card, Badge, Button } from '../../components/ui';
import './ProAnalytics.css';

export default function ProAnalytics() {
  const barHeights = [40, 65, 45, 80, 55, 90, 70];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const metrics = [
    { label: 'Total Bookings', value: '142', trend: '+12%', icon: <CalendarDays size={18} />, color: 'var(--primary-500)' },
    { label: 'Completion Rate', value: '98%', trend: '+2%', icon: <Activity size={18} />, color: 'var(--success-500)' },
    { label: 'Total Clients', value: '89', trend: '+5%', icon: <Users size={18} />, color: 'var(--accent-500)' },
    { label: 'Avg Rating', value: '4.9', trend: '+0.1', icon: <Star size={18} />, color: '#fbbf24' },
  ];

  return (
    <div className="pro-analytics">
      <div className="pa-header">
        <h1>Performance & Analytics</h1>
        <p>Track your business growth and unlock rewards</p>
      </div>

      {/* Incentive Program Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="gradient" padding="lg" className="pa-incentive-card">
          <div className="pa-inc-top">
            <div>
              <Badge variant="primary" size="sm">Monthly Milestone</Badge>
              <h2>Super Pro Status</h2>
              <p>Complete 200 services this month to unlock a <strong>$50 Wallet Bonus</strong> and <strong>0% Commission</strong> for a week.</p>
            </div>
            <Award size={48} className="pa-inc-icon" />
          </div>
          
          <div className="pa-inc-progress">
            <div className="pa-prog-text">
              <span>142 / 200 Services Completed</span>
              <span>58 to go!</span>
            </div>
            <div className="pa-prog-track">
              <motion.div 
                className="pa-prog-fill" 
                initial={{ width: 0 }} 
                animate={{ width: `${(142 / 200) * 100}%` }} 
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Key Metrics */}
      <div className="pa-metrics-grid">
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }}>
            <Card variant="default" padding="md" className="pa-metric-card">
              <div className="pa-metric-icon" style={{ color: m.color, background: `${m.color}15` }}>{m.icon}</div>
              <div className="pa-metric-val">{m.value}</div>
              <div className="pa-metric-bottom">
                <span className="pa-metric-lbl">{m.label}</span>
                <span className="pa-metric-trend"><TrendingUp size={12} /> {m.trend}</span>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="pa-bottom-grid">
        {/* Weekly Chart */}
        <Card variant="default" padding="lg" className="pa-chart-card">
          <div className="pa-card-header">
            <h3>Bookings This Week</h3>
            <Button size="sm" variant="ghost">View Details <ChevronRight size={14} /></Button>
          </div>
          <div className="pa-chart-area">
            <div className="pa-bars">
              {barHeights.map((h, i) => (
                <div key={i} className="pa-bar-col">
                  <motion.div 
                    className="pa-bar-fill" 
                    initial={{ height: 0 }} 
                    animate={{ height: `${h}%` }} 
                    transition={{ duration: 0.5, delay: 0.2 + (i * 0.05) }} 
                  />
                  <span className="pa-bar-lbl">{days[i]}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Top Services */}
        <Card variant="default" padding="lg">
          <h3>Top Performing Services</h3>
          <div className="pa-services-list">
            {[
              { name: 'Haircut & Styling', bookings: 65, rev: '$2,275' },
              { name: 'Bridal Makeup', bookings: 32, rev: '$2,560' },
              { name: 'Basic Trim', bookings: 45, rev: '$900' },
            ].map((s, i) => (
              <div key={s.name} className="pa-svc-row">
                <div className="pa-svc-rank">{i + 1}</div>
                <div className="pa-svc-info">
                  <span className="pa-svc-name">{s.name}</span>
                  <span className="pa-svc-bookings">{s.bookings} bookings</span>
                </div>
                <div className="pa-svc-rev">{s.rev}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
