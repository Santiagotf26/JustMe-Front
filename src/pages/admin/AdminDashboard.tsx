import { motion } from 'framer-motion';
import { Users, Briefcase, CreditCard, TrendingUp, DollarSign, Activity, BarChart3, ShieldCheck, Loader } from 'lucide-react';
import { Card, Badge, Avatar, Button } from '../../components/ui';
import { useAdminStats } from '../../hooks/useAdminStats';
import { useTranslation } from 'react-i18next';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { stats, professionals, transactions, loading } = useAdminStats();

  const kpis = stats ? [
    { label: t('adminDash.totalUsers'), value: stats.totalUsers?.toLocaleString() ?? '0', icon: <Users size={20} />, color: 'var(--primary-500)', bg: 'var(--primary-50)', change: '+8.2%' },
    { label: t('adminDash.professionals'), value: stats.totalProfessionals?.toLocaleString() ?? '0', icon: <Briefcase size={20} />, color: 'var(--accent-500)', bg: 'var(--accent-100)', change: '+5.1%' },
    { label: t('adminDash.totalBookings'), value: stats.totalBookings?.toLocaleString() ?? '0', icon: <Activity size={20} />, color: 'var(--success-500)', bg: 'var(--success-50)', change: '+12.5%' },
    { label: t('adminDash.revenue'), value: `$${((stats.totalRevenue ?? 0) / 1000).toFixed(0)}K`, icon: <DollarSign size={20} />, color: '#fbbf24', bg: '#fbbf2415', change: '+15.3%' },
    { label: t('adminDash.commissions'), value: `$${((stats.commissionsCollected ?? 0) / 1000).toFixed(0)}K`, icon: <CreditCard size={20} />, color: 'var(--error-500)', bg: 'var(--error-50)', change: '+9.8%' },
    { label: t('adminDash.activeServices'), value: stats.activeServices?.toString() ?? '—', icon: <BarChart3 size={20} />, color: '#06b6d4', bg: '#06b6d415', change: '—' },
  ] : [];

  if (loading) {
    return (
      <div className="admin-dash" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  return (
    <div className="admin-dash">
      <div className="admin-dash-header">
        <div>
          <h1>{t('adminDash.title')}</h1>
          <p className="admin-subtitle">{t('adminDash.subtitle')}</p>
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
        <h2>{t('adminDash.revenueSummary')}</h2>
        <div className="chart-container">
          <div className="chart-bars">
            {[35, 55, 68, 42, 78, 92, 65, 88, 73, 95, 80, 70].map((h, i) => (
              <motion.div key={i} className="chart-bar-group" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 + i * 0.05 }}>
                <motion.div className="chart-bar" initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.4 + i * 0.05, duration: 0.5 }} />
                <span className="chart-label">{(t('adminDash.months', { returnObjects: true }) as string[])[i]}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </Card>

      <div className="admin-grid">
        {/* Recent Professionals */}
        <section>
          <h2>{t('adminDash.recentPros')}</h2>
          <div className="admin-table">
            {professionals.length === 0 ? (
              <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '20px' }}>{t('adminDash.noPros')}</p>
            ) : professionals.slice(0, 4).map((pro: any) => (
              <Card key={pro.id} variant="default" padding="sm" className="admin-row">
                <Avatar src={pro.user?.avatar} name={`${pro.user?.name ?? ''} ${pro.user?.lastName ?? ''}`} size="sm" />
                <div className="admin-row-info">
                  <p className="admin-row-name">{`${pro.user?.name ?? ''} ${pro.user?.lastName ?? ''}`.trim()}</p>
                  <p className="admin-row-detail">{Array.isArray(pro.specialties) ? pro.specialties.join(', ') : (pro.specialties || 'Profesional')}</p>
                </div>
                <Badge variant={pro.isVerified ? 'success' : 'warning'} size="sm">{pro.isVerified ? t('adminDash.verified') : t('adminDash.pending')}</Badge>
                <Button size="sm" variant="ghost">{t('adminDash.view')}</Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Recent Transactions */}
        <section>
          <h2>{t('adminDash.recentTx')}</h2>
          <div className="admin-table">
            {transactions.length === 0 ? (
              <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '20px' }}>{t('adminDash.noTx')}</p>
            ) : transactions.slice(0, 5).map((t: any) => (
              <Card key={t.id} variant="default" padding="sm" className="admin-row">
                <div className="admin-row-info">
                  <p className="admin-row-name">{t.description ?? t('adminDash.transaction')}</p>
                  <p className="admin-row-detail">{new Date(t.createdAt ?? t.date).toLocaleDateString()} • {t.type}</p>
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
