import { motion } from 'framer-motion';
import { Users, Briefcase, CreditCard, TrendingUp, DollarSign, Activity, BarChart3, ShieldCheck } from 'lucide-react';
import { Card, Badge, Avatar, Button } from '../../components/ui';
import { adminStats, mockProfessionals, mockTransactions } from '../../data/mockData';
import './AdminDashboard.css';

const kpis = [
  { label: 'Total Users', value: adminStats.totalUsers.toLocaleString(), icon: <Users size={20} />, color: 'var(--primary-500)', bg: 'var(--primary-50)', change: '+8.2%' },
  { label: 'Professionals', value: adminStats.totalProfessionals.toLocaleString(), icon: <Briefcase size={20} />, color: 'var(--accent-500)', bg: 'var(--accent-100)', change: '+5.1%' },
  { label: 'Total Bookings', value: adminStats.totalBookings.toLocaleString(), icon: <Activity size={20} />, color: 'var(--success-500)', bg: 'var(--success-50)', change: '+12.5%' },
  { label: 'Revenue', value: `$${(adminStats.totalRevenue / 1000).toFixed(0)}K`, icon: <DollarSign size={20} />, color: '#fbbf24', bg: '#fbbf2415', change: '+15.3%' },
  { label: 'Commissions', value: `$${(adminStats.commissionsCollected / 1000).toFixed(0)}K`, icon: <CreditCard size={20} />, color: 'var(--error-500)', bg: 'var(--error-50)', change: '+9.8%' },
  { label: 'Active Services', value: adminStats.activeServices.toString(), icon: <BarChart3 size={20} />, color: '#06b6d4', bg: '#06b6d415', change: '—' },
];

export default function AdminDashboard() {
  return (
    <div className="admin-dash">
      <div className="admin-dash-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p className="admin-subtitle">Platform overview and management</p>
        </div>
        <Badge variant="primary" size="md"><ShieldCheck size={14} /> Admin</Badge>
      </div>

      {/* KPIs */}
      <div className="admin-kpis">
        {kpis.map((kpi, i) => (
          <motion.div key={kpi.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <Card variant="default" padding="md" className="admin-kpi-card">
              <div className="kpi-top">
                <div className="kpi-icon" style={{ color: kpi.color, background: kpi.bg }}>{kpi.icon}</div>
                <span className="kpi-change" style={{ color: kpi.change.startsWith('+') ? 'var(--success-500)' : 'var(--neutral-400)' }}>
                  <TrendingUp size={13} /> {kpi.change}
                </span>
              </div>
              <span className="kpi-value">{kpi.value}</span>
              <span className="kpi-label">{kpi.label}</span>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card variant="default" padding="lg" className="admin-chart-card">
        <h2>Revenue Overview</h2>
        <div className="chart-container">
          <div className="chart-bars">
            {[35, 55, 68, 42, 78, 92, 65, 88, 73, 95, 80, 70].map((h, i) => (
              <motion.div key={i} className="chart-bar-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <motion.div className="chart-bar" initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }} />
                <span className="chart-label">{['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      <div className="admin-grid">
        {/* Recent Professionals */}
        <section>
          <h2>Recent Professionals</h2>
          <div className="admin-table">
            {mockProfessionals.slice(0, 4).map(pro => (
              <Card key={pro.id} variant="default" padding="sm" className="admin-row">
                <Avatar src={pro.avatar} name={pro.name} size="sm" />
                <div className="admin-row-info">
                  <p className="admin-row-name">{pro.name}</p>
                  <p className="admin-row-detail">{pro.services[0]} • {pro.completedServices} services</p>
                </div>
                <Badge variant={pro.verified ? 'success' : 'warning'} size="sm">{pro.verified ? 'Verified' : 'Pending'}</Badge>
                <Button size="sm" variant="ghost">View</Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <h2>Recent Transactions</h2>
          <div className="admin-table">
            {mockTransactions.map(t => (
              <Card key={t.id} variant="default" padding="sm" className="admin-row">
                <div className="admin-row-info">
                  <p className="admin-row-name">{t.description}</p>
                  <p className="admin-row-detail">{t.date} • {t.type}</p>
                </div>
                <span className={`admin-amount ${t.type === 'commission' ? 'positive' : ''}`}>
                  {t.type === 'commission' ? '+' : '-'}${t.amount}
                </span>
                <Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status}</Badge>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
