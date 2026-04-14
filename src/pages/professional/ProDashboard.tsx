import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Star, TrendingUp, Clock, Users, AlertCircle, Loader, MapPin, Scissors } from 'lucide-react';
import { Card, Avatar, Badge, Rating, Button, Tabs } from '../../components/ui';
import { VerificationBanner } from '../../components/ui/VerificationBanner';
import { bookingService } from '../../services/bookingService';
import { professionalsService } from '../../services/professionalsService';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './ProDashboard.css';

export default function ProDashboard() {
  const { t, i18n } = useTranslation();
  const { switchRole, verificationStatus, professionalId } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState(0);
  const [apptTab, setApptTab] = useState('upcoming');

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
    .filter((b: any) => b.status === 'confirmed' || b.status === 'pending');
  const pastBookings = bookings
    .filter((b: any) => b.status === 'completed' || b.status === 'cancelled');

  const todayBookings = bookings.filter((b: any) => {
    const bDate = new Date(b.scheduledAt || b.date);
    const today = new Date();
    return bDate.toDateString() === today.toDateString();
  });

  const apptList = apptTab === 'upcoming' ? upcoming : pastBookings;

  const dashStats = [
    { label: t('proDash.stats.todayBookings'), value: String(todayBookings.length), icon: <Calendar size={20} />, color: 'var(--primary-500)', bg: 'var(--primary-50)' },
    { label: t('proDash.stats.weeklyEarnings'), value: stats?.weeklyEarnings ? `$${stats.weeklyEarnings}` : '$0', icon: <DollarSign size={20} />, color: 'var(--success-500)', bg: 'var(--success-50)' },
    { label: t('proDash.stats.rating'), value: String(stats?.rating || '0'), icon: <Star size={20} />, color: '#fbbf24', bg: '#fbbf2415' },
    { label: t('proDash.stats.totalClients'), value: String(stats?.totalClients || bookings.length), icon: <Users size={20} />, color: 'var(--accent-500)', bg: 'var(--accent-100)' },
  ];

  const statusColors: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
    pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'error',
  };

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
          <h1>{t('proDash.title')}</h1>
          <p className="dash-date">{new Date().toLocaleDateString(i18n.language, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <Button size="sm" variant="secondary" onClick={() => { switchRole('user'); navigate('/user'); }}>
          {t('proDash.switchBtn')}
        </Button>
      </div>

      {walletBalance < 5 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="dash-alert">
          <AlertCircle size={20} />
          <div>
            <strong>{t('proDash.lowBalance')}</strong>
            <p>{t('proDash.balanceMsg', { balance: walletBalance.toFixed(2) })}</p>
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
            <p className="earnings-label">{t('proDash.earningsOverview')}</p>
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

      {/* ───── ALL APPOINTMENTS SECTION ───── */}
      <section className="pro-all-appts">
        <div className="pro-all-appts-header">
          <h2>{t('proDash.allAppointments')}</h2>
          <span className="pro-appt-count">{bookings.length} {t('proDash.totalLabel')}</span>
        </div>
        <Tabs
          tabs={[
            { id: 'upcoming', label: `${t('proDash.upcomingAppts')} (${upcoming.length})` },
            { id: 'past', label: `${t('proDash.pastAppts')} (${pastBookings.length})` },
          ]}
          onChange={setApptTab}
        />
        <div className="pro-appts-list">
          {apptList.length === 0 ? (
            <div className="pro-appts-empty">
              <Calendar size={36} style={{ opacity: 0.3 }} />
              <p>{apptTab === 'upcoming' ? t('proDash.noAppts') : t('proDash.noPastAppts')}</p>
            </div>
          ) : (
            apptList.map((b: any, i: number) => {
              const clientName = b.user?.name
                ? `${b.user.name} ${b.user.lastName || ''}`.trim()
                : (b.client?.name || t('proDash.client'));
              const clientAvatar = b.user?.avatar || b.client?.avatar;
              const svcName = b.professionalService?.service?.name || b.service?.name || b.serviceName || b.service || t('proDash.service');
              const bDate = new Date(b.scheduledAt || b.date || new Date());
              const timeStr = b.startTime || b.time || bDate.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' });

              return (
                <motion.div
                  key={b.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card variant="default" padding="md" className="pro-appt-row">
                    <div className="pro-appt-client">
                      <Avatar src={clientAvatar} name={clientName} size="sm" />
                      <div className="pro-appt-client-info">
                        <span className="pro-appt-client-name">{clientName}</span>
                        <span className="pro-appt-svc"><Scissors size={12} /> {svcName}</span>
                      </div>
                    </div>
                    <div className="pro-appt-datetime">
                      <span className="pro-appt-date"><Calendar size={13} /> {bDate.toLocaleDateString(i18n.language, { month: 'short', day: 'numeric' })}</span>
                      <span className="pro-appt-time"><Clock size={13} /> {timeStr}</span>
                    </div>
                    <div className="pro-appt-loc">
                      <MapPin size={13} />
                      <span>{b.locationType === 'home' ? t('proDash.homeService') : t('proDash.atStudio')}</span>
                    </div>
                    <div className="pro-appt-status-price">
                      <Badge variant={statusColors[b.status] || 'primary'} size="sm">{t(`appointments.status.${b.status}`, b.status)}</Badge>
                      {b.price && <span className="pro-appt-price">${parseFloat(b.price).toFixed(0)}</span>}
                    </div>
                  </Card>
                </motion.div>
              );
            })
          )}
        </div>
      </section>

      <div className="dash-grid">
        {/* Recent Reviews */}
        <section>
          <h2>{t('proDash.recentReviews')}</h2>
          <div className="dash-list">
            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
                <Star size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
                <p>{t('proDash.noReviews')}</p>
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
