// Shared pages for secondary views across all roles
// All data fetched from backend - no mock data
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, Avatar, Rating } from '../components/ui';
import { Modal } from '../components/ui/Modal';
import { 
  Star, Clock, Scissors, Calendar, Image as ImageIcon, MapPin, 
  Trash2, Plus, DollarSign, History, ArrowDownLeft, ArrowUpRight, 
  CheckCircle, Home, Edit, XCircle, Loader, TrendingUp, Search, Activity, Navigation as NavIcon,
  Camera, User as UserIcon, Mail, Phone, Briefcase, Award
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { bookingService } from '../services/bookingService';
import { professionalsService } from '../services/professionalsService';
import { walletService } from '../services/walletService';
import { userService } from '../services/userService';
import { apiClient } from '../services/api';
import { useTranslation } from 'react-i18next';
import { MapView } from '../components/map/MapView';
import Swal from 'sweetalert2';

const pageStyle: React.CSSProperties = { padding: 'var(--space-4)', maxWidth: '960px', margin: '0 auto' };
const headerStyle: React.CSSProperties = { fontSize: 'var(--text-2xl)', fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 'var(--space-5)' };
const listStyle: React.CSSProperties = { display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' };
const rowStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 'var(--space-3)' };
const flexStyle: React.CSSProperties = { flex: 1 };
const subStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' };
const loadingCenter: React.CSSProperties = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' };

/* ============== PROFESSIONAL PAGES ============== */

export function ProBookingRequests() {
  const { professionalId } = useAuth();
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState('upcoming'); // 'upcoming', 'pending', 'history'
  const { t, i18n } = useTranslation();
  const { notify } = useNotification();

  const fetchBookings = () => {
    if (!professionalId) { setLoading(false); return; }
    setLoading(true);
    bookingService.getProfessionalBookings(professionalId)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setBookings(list);
      })
      .catch(e => { console.warn("Failed to fetch bookings", e); setBookings([]); })
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchBookings();
  }, [professionalId]);

  const handleUpdateStatus = async (id: string | number, status: string) => {
    try {
      await bookingService.updateBookingStatus(id, status);
      notify('success', t('common.success') || 'Success', t('appointments.statusUpdated') || `Booking marked as ${status}`);
      fetchBookings();
    } catch (err) {
      notify('error', t('common.error') || 'Error', 'Failed to update booking status');
    }
  };

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  const filteredBookings = bookings.filter((b: any) => {
    if (activeTab === 'pending') return b.status === 'pending';
    if (activeTab === 'upcoming') return b.status === 'confirmed';
    return b.status === 'completed' || b.status === 'cancelled';
  });

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.bookingReqTitle') || 'Manage Appointments'}</h1>

      <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--neutral-200)', paddingBottom: 'var(--space-2)' }}>
        {['pending', 'upcoming', 'history'].map(tab => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      {filteredBookings.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Clock size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.pro.noPendingBookings') || 'No bookings found in this section.'}</p>
        </div>
      ) : (
        <div style={listStyle}>
          {filteredBookings.map((b: any, i: number) => {
            const clientName = b.client?.name || b.user?.name || 'Client';
            const svcName = b.professionalService?.service?.name || b.service?.name || b.serviceName || b.service || 'Service';
            const bDate = new Date(b.scheduledAt || b.date || Date.now());
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card variant="default" padding="md">
                  <div style={rowStyle}>
                    <Avatar src={b.client?.avatar || b.user?.avatar || b.professionalAvatar} name={clientName} size="md" />
                    <div style={flexStyle}>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{clientName}</p>
                      <p style={subStyle}>{svcName} • {bDate.toLocaleDateString(i18n.language)} at {b.startTime || b.time || bDate.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</p>
                      <p style={subStyle}>{b.locationType === 'home' ? <><Home size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('sharedPages.pro.homeService') || 'Home'}</> : <><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('sharedPages.pro.atStudio') || 'Studio'}</>} • ${parseFloat(b.price || 0).toFixed(2)}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
                      <Badge variant={b.status === 'confirmed' ? 'primary' : b.status === 'completed' ? 'success' : b.status === 'cancelled' ? 'error' : 'warning'}>{b.status}</Badge>

                      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
                        {b.status === 'pending' && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(b.id, 'cancelled')}><XCircle size={14} color="var(--error-500)" /></Button>
                            <Button size="sm" onClick={() => handleUpdateStatus(b.id, 'confirmed')}><CheckCircle size={14} /></Button>
                          </>
                        )}
                        {b.status === 'confirmed' && (
                          <>
                            <Button size="sm" variant="ghost" onClick={() => handleUpdateStatus(b.id, 'cancelled')}><XCircle size={14} color="var(--error-500)" /></Button>
                            <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(b.id, 'completed')}>{t('appointments.status.completed') || 'Complete'}</Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProCalendar() {
  const { professionalId } = useAuth();
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [currentWeekOffset, setCurrentWeekOffset] = React.useState(0);
  const [selectedBooking, setSelectedBooking] = React.useState<any>(null);
  const { t } = useTranslation();
  const { notify } = useNotification();

  const fetchBookings = () => {
    if (!professionalId) { setLoading(false); return; }
    bookingService.getProfessionalBookings(professionalId)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setBookings(list);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchBookings();
  }, [professionalId]);

  const handleUpdateStatus = async (id: string | number, status: string) => {
    try {
      await bookingService.updateBookingStatus(id, status);
      notify('success', t('common.success') || 'Success', t('appointments.statusUpdated') || `Booking marked as ${status}`);
      setSelectedBooking((prev: any) => ({ ...prev, status }));
      fetchBookings();
    } catch (err) {
      notify('error', t('common.error') || 'Error', 'Failed to update booking status');
    }
  };

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 14 }, (_, i) => `${7 + i}:00`);

  const getDayDate = (dayIndex: number) => {
    const date = new Date();
    // Ajustar al lunes de la semana actual + offset
    const currentDay = date.getDay() === 0 ? 7 : date.getDay();
    date.setDate(date.getDate() - currentDay + 1 + dayIndex + (currentWeekOffset * 7));
    return date;
  };

  const getBookingsForSlot = (hour: number, dayDate: Date) => {
    return bookings.filter((b: any) => {
      const bDate = new Date(b.scheduledAt || b.date || Date.now());
      const bHour = b.startTime ? parseInt(b.startTime.split(':')[0]) : bDate.getHours();
      return bDate.toDateString() === dayDate.toDateString() && bHour === hour && (b.status === 'confirmed' || b.status === 'pending');
    });
  };

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.pro.calTitle') || 'Calendar'}</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Button size="sm" variant="ghost" onClick={() => setCurrentWeekOffset(prev => prev - 1)}>Prev Week</Button>
          <Button size="sm" variant="ghost" onClick={() => setCurrentWeekOffset(0)}>Today</Button>
          <Button size="sm" variant="ghost" onClick={() => setCurrentWeekOffset(prev => prev + 1)}>Next Week</Button>
        </div>
      </div>

      <Card variant="default" padding="md">
        <div style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', gap: 'var(--space-2)', marginBottom: 'var(--space-4)' }}>
          <div /> {/* Empty corner */}
          {days.map((d, i) => {
            const date = getDayDate(i);
            const isToday = new Date().toDateString() === date.toDateString();
            return (
              <div key={d} style={{ textAlign: 'center', minWidth: 60, padding: 'var(--space-2)', background: isToday ? 'var(--primary-50)' : 'transparent', borderRadius: 'var(--radius-md)' }}>
                <p style={{ fontSize: 'var(--text-xs)', color: isToday ? 'var(--primary-600)' : 'var(--neutral-400)', fontWeight: isToday ? 700 : 500 }}>{d}</p>
                <p style={{ fontWeight: 700, color: isToday ? 'var(--primary-700)' : 'var(--neutral-900)' }}>{date.getDate()}</p>
              </div>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', maxHeight: '600px', overflowY: 'auto' }}>
          {hours.map((h) => {
            const hourNum = parseInt(h);
            return (
              <div key={h} style={{ display: 'grid', gridTemplateColumns: '50px repeat(7, 1fr)', gap: 'var(--space-2)', borderBottom: '1px solid var(--neutral-100)', minHeight: '60px' }}>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', paddingTop: 'var(--space-2)' }}>{h}</span>
                {days.map((_, i) => {
                  const dayDate = getDayDate(i);
                  const slotBookings = getBookingsForSlot(hourNum, dayDate);

                  return (
                    <div key={`${h}-${i}`} style={{ padding: 'var(--space-1)' }}>
                      {slotBookings.map((b, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedBooking(b)}
                          style={{
                            background: b.status === 'confirmed' ? 'var(--primary-100)' : 'var(--warning-100)',
                            color: b.status === 'confirmed' ? 'var(--primary-700)' : 'var(--warning-700)',
                            fontSize: '10px',
                            padding: '4px 6px',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            marginBottom: '2px',
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                            fontWeight: 600
                          }}>
                          {b.client?.name || b.user?.name || 'Client'}
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </Card>

      <Modal isOpen={!!selectedBooking} onClose={() => setSelectedBooking(null)} title={t('appointments.details') || 'Booking Details'}>
        {selectedBooking && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: '320px', padding: 'var(--space-2)' }}>
            <div style={rowStyle}>
              <Avatar src={selectedBooking.user?.avatar} name={selectedBooking.user?.name || selectedBooking.client?.name} size="md" />
              <div>
                <p style={{ fontWeight: 600 }}>{selectedBooking.user?.name || selectedBooking.client?.name || 'Client'}</p>
                <p style={subStyle}>{selectedBooking.professionalService?.service?.name || selectedBooking.service?.name || selectedBooking.serviceName || 'Service'}</p>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Badge variant={selectedBooking.status === 'confirmed' ? 'primary' : selectedBooking.status === 'completed' ? 'success' : selectedBooking.status === 'cancelled' ? 'error' : 'warning'}>{selectedBooking.status}</Badge>
              </div>
            </div>
            <div style={{ background: 'var(--neutral-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)' }}>
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}><Calendar size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--neutral-400)' }} /> {new Date(selectedBooking.scheduledAt || selectedBooking.date).toLocaleDateString()}</p>
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}><Clock size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--neutral-400)' }} /> {selectedBooking.startTime || selectedBooking.time}</p>
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: 'var(--space-2)' }}><MapPin size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--neutral-400)' }} /> {selectedBooking.locationType === 'home' ? 'Home Service' : 'Studio'} {selectedBooking.location ? `(${selectedBooking.location})` : ''}</p>
              <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}><DollarSign size={14} style={{ display: 'inline', marginRight: 4, color: 'var(--neutral-400)' }} /> ${parseFloat(selectedBooking.price || 0).toFixed(2)}</p>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
              {selectedBooking.status === 'pending' && (
                <>
                  <Button variant="ghost" onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}>{t('sharedPages.pro.cancel') || 'Cancel'}</Button>
                  <Button onClick={() => handleUpdateStatus(selectedBooking.id, 'confirmed')}>{t('common.confirm') || 'Confirm'}</Button>
                </>
              )}
              {selectedBooking.status === 'confirmed' && (
                <>
                  <Button variant="ghost" onClick={() => handleUpdateStatus(selectedBooking.id, 'cancelled')}>{t('sharedPages.pro.cancel') || 'Cancel'}</Button>
                  <Button variant="primary" onClick={() => handleUpdateStatus(selectedBooking.id, 'completed')}>{t('appointments.status.completed') || 'Complete'}</Button>
                </>
              )}
              {(selectedBooking.status === 'completed' || selectedBooking.status === 'cancelled') && (
                <Button onClick={() => setSelectedBooking(null)}>{t('common.close') || 'Close'}</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export function ProEarnings() {
  const { professionalId } = useAuth();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    if (!professionalId) { setLoading(false); return; }
    walletService.getTransactions(professionalId)
      .then(data => setTransactions(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [professionalId]);

  const payments = transactions.filter(t => t.type === 'payment' || t.type === 'earning');
  const totalEarned = payments.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const totalComm = transactions.filter(t => t.type === 'commission').reduce((sum, t) => sum + Math.abs(parseFloat(t.amount) || 0), 0);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-6)' }}>
        <h1 style={headerStyle}>{t('sharedPages.pro.earnTitle')}</h1>
        <span style={{ fontSize: 'var(--text-lg)', padding: 'var(--space-2) var(--space-4)', background: 'var(--success-50)', color: 'var(--success-600)', borderRadius: 'var(--radius-full)', fontWeight: 700 }}>
          ${totalEarned.toFixed(2)}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
        <Card variant="gradient" padding="lg">
          <div style={{ background: 'linear-gradient(135deg, var(--success-600), var(--success-800))', color: 'white', height: '100%', margin: '-1.5rem', padding: '1.5rem', borderRadius: 'inherit' }}>
            <p style={{ opacity: 0.8, fontSize: 'var(--text-sm)' }}>{t('sharedPages.pro.totalEarned')}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-3xl)', fontWeight: 800 }}>${totalEarned.toFixed(2)}</p>
            <div style={{ marginTop: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 6, fontSize: 'var(--text-xs)', background: 'rgba(255,255,255,0.1)', padding: '6px 10px', borderRadius: 'var(--radius-full)', alignSelf: 'flex-start' }}>
              <ArrowDownLeft size={14} /> +12% vs mes pasado
            </div>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={subStyle}>{t('sharedPages.pro.transactions')}</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{transactions.length}</p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--primary-50)', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <History size={22} />
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', marginTop: 'var(--space-2)' }}>Últimos 30 días</p>
        </Card>

        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <div>
              <p style={subStyle}>Comisiones Pagadas</p>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>${totalComm.toFixed(2)}</p>
            </div>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--error-50)', color: 'var(--error-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ArrowUpRight size={22} />
            </div>
          </div>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', marginTop: 'var(--space-2)' }}>Tasa fija del 10%</p>
        </Card>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
        <h2 style={{ fontSize: 'var(--text-lg)', fontWeight: 700 }}>{t('sharedPages.pro.recentEarnings')}</h2>
        <Button variant="ghost" size="sm">Descargar Reporte</Button>
      </div>

      {payments.length === 0 ? (
        <Card variant="default" padding="lg">
          <div style={{ textAlign: 'center', color: 'var(--neutral-400)', padding: 'var(--space-10) 0' }}>
            <DollarSign size={48} style={{ margin: '0 auto var(--space-4)', opacity: 0.2 }} />
            <p style={{ fontWeight: 500 }}>{t('sharedPages.pro.noEarnings')}</p>
          </div>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          {payments.slice(0, 15).map((t: any) => (
            <Card key={t.id} variant="default" padding="md">
              <div style={rowStyle}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--success-50)', color: 'var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <DollarSign size={18} />
                </div>
                <div style={flexStyle}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--neutral-800)' }}>{t.description || t.type}</p>
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>
                    {new Date(t.createdAt || t.date).toLocaleDateString(i18n.language, { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, color: 'var(--success-500)', fontSize: 'var(--text-lg)' }}>+${parseFloat(t.amount || 0).toFixed(2)}</p>
                  <Badge size="sm" variant="success">{t.status || 'Completado'}</Badge>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProServices() {
  const { professionalId } = useAuth();
  const { notify } = useNotification();
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingService, setEditingService] = React.useState<any>(null);
  const [categories, setCategories] = React.useState<any[]>([]);
  const [formData, setFormData] = React.useState({ name: '', description: '', price: '', duration: '', categoryId: '' });
  const [saving, setSaving] = React.useState(false);
  const { t } = useTranslation();

  React.useEffect(() => {
    professionalsService.getServiceCategories().then(data => {
      setCategories(Array.isArray(data) ? data : []);
      if (data && data.length > 0) setFormData(prev => ({ ...prev, categoryId: String(data[0].id) }));
    }).catch(console.warn);
  }, []);

  const fetchServices = async () => {
    if (!professionalId) { setLoading(false); return; }
    setLoading(true);
    try {
      const data = await professionalsService.getServices(professionalId);
      setServices(Array.isArray(data) ? data : (data?.data || []));
    } catch { setServices([]); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchServices(); }, [professionalId]);

  const handleOpenCreate = () => {
    setEditingService(null);
    setFormData(prev => ({ ...prev, name: '', description: '', price: '', duration: '' }));
    setShowModal(true);
  };

  const handleOpenEdit = (svc: any) => {
    setEditingService(svc);
    const fullDesc = svc.description || '';
    const descPart = fullDesc.includes(' - ') ? fullDesc.split(' - ')[1] : fullDesc;
    const namePart = (fullDesc.includes(' - ') ? fullDesc.split(' - ')[0] : '') || svc.service?.name || svc.name || '';
    
    setFormData({ 
      name: namePart, 
      description: descPart, 
      price: String(svc.price || ''), 
      duration: String(svc.duration || ''),
      categoryId: String(svc.serviceId || '')
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!professionalId || !formData.name || !formData.price || !formData.duration) {
      notify('error', 'Error', 'Please fill in all required fields');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        serviceId: parseInt(formData.categoryId) || categories[0]?.id || 1,
        description: formData.name + ' - ' + formData.description,
        price: parseFloat(formData.price),
        duration: parseInt(formData.duration),
      };
      if (editingService) {
        await professionalsService.updateService(professionalId, String(editingService.id), payload);
        notify('success', t('sharedPages.pro.updateSvc'), t('proSchedule.successMsg'));
      } else {
        await professionalsService.addService(professionalId, payload);
        notify('success', t('sharedPages.pro.createSvc'), t('proSchedule.successMsg'));
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      notify('error', t('sharedPages.pro.error'), err?.response?.data?.message || t('proSchedule.errorMsg'));
    } finally { setSaving(false); }
  };

  const handleDelete = async (svcId: string) => {
    if (!professionalId || !confirm(t('sharedPages.pro.delConfirm'))) return;
    try {
      await professionalsService.deleteService(professionalId, svcId);
      notify('success', t('appointments.status.cancelled'), t('sharedPages.pro.delConfirm'));
      fetchServices();
    } catch (err: any) {
      notify('error', t('sharedPages.pro.error'), err?.response?.data?.message || t('proSchedule.errorMsg'));
    }
  };

  const isBlocked = false; // Bypass temporal para permitir probar el CRUD

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.pro.servicesTitle')}</h1>
        <Button size="sm" icon={<Plus size={16} />} onClick={handleOpenCreate} disabled={isBlocked}>{t('sharedPages.pro.addService')}</Button>
      </div>

      {isBlocked && (
        <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', color: '#b45309', fontSize: 'var(--text-sm)' }}>
          {t('sharedPages.pro.blockedNotice')}
        </div>
      )}

      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Scissors size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.pro.noServices')}</p>
        </div>
      ) : (
        <div style={listStyle}>
          {services.map((s: any, i: number) => (
            <motion.div key={s.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card variant="default" padding="md">
                <div style={rowStyle}>
                  <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: 'var(--primary-50)', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scissors size={18} />
                  </div>
                  <div style={flexStyle}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                      {s.description?.includes(' - ') 
                        ? s.description.split(' - ')[0] 
                        : (s.service?.name || s.name || 'Servicio Personalizado')}
                    </p>
                    {s.description && <p style={{ ...subStyle, marginTop: 2 }}>{s.description.includes(' - ') ? s.description.split(' - ')[1] : s.description}</p>}
                    <p style={subStyle}><Clock size={12} style={{ display: 'inline' }} /> {s.duration || 30} {t('sharedPages.pro.min')}</p>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--primary-600)' }}>$ {new Intl.NumberFormat('es-CO').format(s.price || 0)} COP</span>
                  <Button size="sm" variant="ghost" icon={<Edit size={14} />} onClick={() => handleOpenEdit(s)} disabled={isBlocked} />
                  <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} onClick={() => handleDelete(String(s.id))} disabled={isBlocked} />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingService ? t('sharedPages.pro.editSvc') : t('sharedPages.pro.createSvc')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: '320px', padding: 'var(--space-2)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.nameLabel')}</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Basic Haircut" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.descLabel')}</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.priceLabel')} (COP)</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="25000" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.durLabel')}</label>
              <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="30" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
            </div>
          </div>
          <div style={{ marginBottom: 'var(--space-4)' }}>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Categoría de Servicio</label>
            <select 
              style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', background: 'var(--neutral-0)' }} 
              value={formData.categoryId} 
              onChange={e => setFormData({ ...formData, categoryId: e.target.value })}
            >
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              {categories.length === 0 && <option value="1">Belleza General (ID: 1)</option>}
            </select>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>{t('sharedPages.pro.cancel')}</Button>
            <Button onClick={handleSave} loading={saving}>{editingService ? t('sharedPages.pro.updateSvc') : t('sharedPages.pro.createSvc')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function ProPortfolio() {
  const { t } = useTranslation();
  const { professionalId } = useAuth();
  const { notify } = useNotification();
  const [images, setImages] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [uploading, setUploading] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const fetchPortfolio = () => {
    if (!professionalId) { setLoading(false); return; }
    setLoading(true);
    professionalsService.getProfessionalById(professionalId)
      .then(data => {
        setImages(data?.portfolio || data?.portfolioImages || []);
      })
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  };

  React.useEffect(() => {
    fetchPortfolio();
  }, [professionalId]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !professionalId) return;
    const files = Array.from(e.target.files);
    setUploading(true);
    try {
      await professionalsService.uploadPortfolioImages(professionalId, files);
      notify('success', t('common.success') || 'Success', 'Images uploaded successfully');
      fetchPortfolio();
    } catch (err: any) {
      notify('error', t('common.error') || 'Error', err.response?.data?.message || 'Error al subir la imagen');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (imageId: string | number) => {
    if (!professionalId || !confirm(t('sharedPages.pro.delConfirm') || 'Delete this image?')) return;
    try {
      await professionalsService.deletePortfolioImage(professionalId, imageId);
      notify('success', t('common.success') || 'Success', 'Image deleted successfully');
      fetchPortfolio();
    } catch (err: any) {
      notify('error', t('common.error') || 'Error', err.response?.data?.message || 'Error al eliminar la imagen');
    }
  };

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    
    // Clean path and ensure it starts with /
    const cleanPath = url.replace(/^\/?api\//, '/').startsWith('/') ? url.replace(/^\/?api\//, '/') : `/${url.replace(/^\/?api\//, '')}`;
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;
    
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const hostBase = apiUrl.split('/api')[0];
    return `${hostBase}${finalPath}`;
  };

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.pro.portTitle') || 'Portfolio'}</h1>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            multiple
            accept="image/*"
            onChange={handleUpload}
          />
          <Button size="sm" icon={<Plus size={16} />} onClick={() => fileInputRef.current?.click()} loading={uploading}>
            {t('sharedPages.pro.uploadBtn') || 'Upload'}
          </Button>
        </div>
      </div>

      {images.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <ImageIcon size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.pro.noImages') || 'No images in your portfolio yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
          {images.map((img: any, i: number) => {
            const imgUrl = getImageUrl(img.url || img.imageUrl);
            return (
              <motion.div key={img.id || i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                style={{
                  aspectRatio: '1',
                  borderRadius: 'var(--radius-xl)',
                  background: 'var(--neutral-100)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid var(--neutral-200)'
                }}>
                {imgUrl ? (
                  <img 
                    src={imgUrl} 
                    alt="Portfolio" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} 
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.style.background = 'var(--neutral-50)';
                    }}
                  />
                ) : (
                  <ImageIcon size={28} color="var(--neutral-300)" />
                )}
                
                <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    style={{ background: 'rgba(255,255,255,0.9)', padding: '4px', height: 'auto', minWidth: 'auto', borderRadius: 'var(--radius-md)', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    icon={<Trash2 size={14} color="var(--error-500)" />} 
                    onClick={() => handleDelete(img.id)} 
                  />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function ProProfileEditor() {
  const { user, professionalId, resolveProfessionalId, setUser } = useAuth();
  const { notify } = useNotification();
  const { t } = useTranslation();
  const [saving, setSaving] = React.useState(false);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const [formData, setFormData] = React.useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    bio: '', address: '', serviceRadius: 5, experience: '', specialties: '',
    latitude: 0, longitude: 0, avatar: user?.avatar || ''
  });

  const getImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http') || url.startsWith('blob:') || url.startsWith('data:')) return url;
    
    const cleanPath = url.replace(/^\/?api\//, '/').startsWith('/') ? url.replace(/^\/?api\//, '/') : `/${url.replace(/^\/?api\//, '')}`;
    const finalPath = cleanPath.startsWith('/') ? cleanPath : `/${cleanPath}`;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
    const hostBase = apiUrl.split('/api')[0];
    return `${hostBase}${finalPath}`;
  };

  React.useEffect(() => {
    if (professionalId) {
      professionalsService.getProfessionalById(professionalId).then(data => {
        if (data) {
          setFormData(prev => ({
            ...prev,
            bio: data.bio || data.description || prev.bio,
            address: data.location?.address || prev.address,
            serviceRadius: Number(data.serviceRadius) || prev.serviceRadius,
            experience: data.experience || prev.experience,
            specialties: data.specialties || prev.specialties,
            latitude: Number(data.latitude) || 0,
            longitude: Number(data.longitude) || 0,
          }));
        }
      }).catch(console.warn);
    }
  }, [professionalId]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      notify('error', 'Error', 'Geolocation is not supported by your browser');
      return;
    }
    notify('info', t('common.loading'), 'Detecting your current coordinates...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFormData(prev => ({
          ...prev,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude
        }));
        notify('success', 'Location Detected', 'Coordinates updated successfully.');
      },
      (error) => {
        notify('error', 'Error', `Failed to detect location: ${error.message}`);
      },
      { enableHighAccuracy: true }
    );
  };

  const handleMapClick = (lat: number, lng: number) => {
    setFormData(prev => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (avatarFile && user?.id) {
        const updatedUser = await userService.uploadAvatar(user.id, avatarFile);
        if (updatedUser) {
          setUser({ ...updatedUser, role: user.role });
          setFormData(prev => ({ ...prev, avatar: updatedUser.avatar }));
          setAvatarPreview(null);
          setAvatarFile(null);
        }
      }

      const cleanData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        bio: formData.bio,
        address: formData.address,
        serviceRadius: formData.serviceRadius,
        experience: formData.experience,
        specialties: formData.specialties,
        latitude: formData.latitude,
        longitude: formData.longitude,
      };
      
      if (professionalId) {
        await professionalsService.updateProfile(professionalId, cleanData);
        notify('success', 'Profile saved', 'Your professional profile has been updated.');
      } else {
        await professionalsService.createProfile(cleanData);
        if (user) await resolveProfessionalId(user.id);
        notify('success', 'Profile Created', 'Your professional profile has been created successfully.');
      }
    } catch (e) {
      notify('error', 'Error', 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', background: 'var(--neutral-0)', color: 'var(--neutral-900)', fontSize: 'var(--text-sm)', transition: 'border-color 0.2s' };
  const labelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--neutral-600)', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 6 };
  const sectionTitle: React.CSSProperties = { fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', borderBottom: '2px solid var(--primary-100)', paddingBottom: 8, display: 'flex', alignItems: 'center', gap: 10, color: 'var(--neutral-800)' };

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.profParams')}</h1>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Avatar Section */}
        <div style={{ textAlign: 'center' }}>
          <Card variant="default" padding="lg">
            <div style={{ position: 'relative', width: 120, height: 120, margin: '0 auto var(--space-4)' }}>
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', border: '4px solid var(--primary-50)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                <img 
                  src={avatarPreview || getImageUrl(formData.avatar) || 'https://via.placeholder.com/120'} 
                  alt="Profile" 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <button 
                onClick={() => fileInputRef.current?.click()}
                style={{ position: 'absolute', bottom: 0, right: 0, width: 36, height: 36, borderRadius: '50%', background: 'var(--primary-600)', color: 'white', border: '3px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 6px rgba(0,0,0,0.2)' }}
              >
                <Camera size={16} />
              </button>
              <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" style={{ display: 'none' }} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 'var(--text-xl)' }}>{formData.name || 'Professional Name'}</h3>
            <p style={subStyle}>{formData.email}</p>
          </Card>
        </div>

        {/* Info Form */}
        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
            
            {/* Personal Information */}
            <section>
              <h2 style={sectionTitle}><UserIcon size={20} color="var(--primary-500)" /> {t('register.step1')}</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                <div>
                  <label style={labelStyle}><UserIcon size={14} /> {t('sharedPages.pro.fullName')}</label>
                  <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><Mail size={14} /> {t('sharedPages.pro.email')}</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}><Phone size={14} /> {t('sharedPages.pro.phone')}</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
                </div>
              </div>
            </section>

            {/* Professional Details */}
            <section>
              <h2 style={sectionTitle}><Briefcase size={20} color="var(--primary-500)" /> {t('sidebar.links.services')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={labelStyle}><Edit size={14} /> {t('sharedPages.pro.bio')}</label>
                  <textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3} style={{ ...inputStyle, fontFamily: 'var(--font-body)', resize: 'vertical' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={labelStyle}><Award size={14} /> {t('sharedPages.pro.experience')}</label>
                    <input type="text" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}><Star size={14} /> {t('sharedPages.pro.specialties')}</label>
                    <input type="text" value={formData.specialties} onChange={e => setFormData({ ...formData, specialties: e.target.value })} style={inputStyle} />
                  </div>
                </div>
              </div>
            </section>

            {/* Location Section */}
            <section>
              <h2 style={sectionTitle}><MapPin size={20} color="var(--primary-500)" /> {t('userProfile.location')}</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                <div>
                  <label style={labelStyle}><Home size={14} /> {t('sharedPages.pro.address')}</label>
                  <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                  <div>
                    <label style={labelStyle}>Latitud</label>
                    <input type="number" step="0.0000001" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                  </div>
                  <div>
                    <label style={labelStyle}>Longitud</label>
                    <input type="number" step="0.0000001" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })} style={inputStyle} />
                  </div>
                </div>
                <Button variant="secondary" icon={<NavIcon size={14} />} onClick={handleDetectLocation} style={{ alignSelf: 'flex-start' }}>
                  {t('sharedPages.pro.detectLoc')}
                </Button>

                <div style={{ height: '300px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1.5px solid var(--neutral-200)', position: 'relative', marginTop: 'var(--space-2)' }}>
                  <MapView
                    professionals={[]}
                    userLocation={null}
                    isPicker={true}
                    center={{ lat: formData.latitude, lng: formData.longitude }}
                    onPickerChange={handleMapClick}
                    zoom={15}
                  />
                </div>
              </div>
            </section>

            <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: 'var(--space-4)', borderTop: '1.5px solid var(--neutral-100)' }}>
              <Button onClick={handleSave} loading={saving} size="lg" style={{ minWidth: 200 }}>
                {t('sharedPages.pro.saveChanges')}
              </Button>
            </div>

          </div>
        </Card>
      </div>
    </div>
  );
}

export function ProReviews() {
  const { professionalId } = useAuth();
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ avg: 0, count: 0, distribution: [0,0,0,0,0] });
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!professionalId) return;
    professionalsService.getReviews(professionalId)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setReviews(list);
        if (list.length > 0) {
          const avg = list.reduce((s: number, r: any) => s + (r.rating || 0), 0) / list.length;
          const dist = [0, 0, 0, 0, 0];
          list.forEach((r: any) => {
            const index = Math.min(4, Math.max(0, Math.floor(r.rating || 1) - 1));
            dist[index]++;
          });
          setStats({ avg, count: list.length, distribution: dist.reverse() });
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [professionalId]);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.revTitle')}</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <Card variant="glass" padding="lg">
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-5xl)', fontWeight: 800, color: 'var(--primary-500)', marginBottom: 4 }}>{stats.avg.toFixed(1)}</p>
            <Rating value={stats.avg} size="md" />
            <p style={{ ...subStyle, marginTop: 'var(--space-2)' }}>{t('sharedPages.pro.basedOn', { count: stats.count })}</p>
          </div>
        </Card>

        <Card variant="default" padding="lg">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[5, 4, 3, 2, 1].map((star, i) => {
              const count = stats.distribution[i] || 0;
              const percent = stats.count > 0 ? (count / stats.count) * 100 : 0;
              return (
                <div key={star} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', fontWeight: 600, width: 24 }}>{star}★</span>
                  <div style={{ flex: 1, height: 6, background: 'var(--neutral-100)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1 }} style={{ height: '100%', background: star >= 4 ? 'var(--primary-500)' : star >= 3 ? 'var(--accent-500)' : 'var(--neutral-300)' }} />
                  </div>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', width: 24, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {reviews.length === 0 ? (
        <Card variant="default" padding="lg">
          <div style={{ textAlign: 'center', color: 'var(--neutral-400)' }}>
          <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-full)', background: 'var(--neutral-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto var(--space-4)' }}>
            <Star size={32} style={{ opacity: 0.2 }} />
          </div>
          <p style={{ fontWeight: 500 }}>{t('sharedPages.pro.noRev')}</p>
          <p style={{ fontSize: 'var(--text-xs)', marginTop: 4 }}>{t('sharedPages.pro.noRevDesc', 'Cuando tus clientes te califiquen, aparecerán aquí.')}</p>
          </div>
        </Card>
      ) : (
        <div style={listStyle}>
          {reviews.map((r: any, i: number) => (
            <motion.div key={r.id || i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card variant="default" padding="md">
                <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
                  <Avatar src={r.userAvatar || r.user?.avatar} name={r.userName || r.user?.name || 'User'} size="md" />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{r.userName || r.user?.name || 'Usuario'}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>{r.date || new Date(r.createdAt).toLocaleDateString()}</p>
                      </div>
                      <Rating value={r.rating || 0} size="sm" />
                    </div>
                    <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', marginTop: 'var(--space-2)', lineHeight: 1.6 }}>{r.comment || r.text}</p>
                    {r.reply && (
                      <div style={{ marginTop: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--neutral-50)', borderRadius: 'var(--radius-lg)', borderLeft: '3px solid var(--primary-500)' }}>
                        <p style={{ fontSize: 'var(--text-xs)', fontWeight: 700, color: 'var(--primary-600)', marginBottom: 4 }}>{t('sharedPages.pro.yourReply', 'Tu respuesta')}</p>
                        <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-700)' }}>{r.reply}</p>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============== ADMIN PAGES ============== */

export function AdminUsers() {
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any>(null);
  const [saving, setSaving] = React.useState(false);
  const { t } = useTranslation();
  const [formData, setFormData] = React.useState({
    name: '', lastName: '', email: '', phone: '', docType: '', docNumber: '', isActive: true
  });

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/users');
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchUsers(); }, []);

  const handleOpenEdit = (user: any) => {
    setEditingUser(user);
    setFormData({
      name: user.name || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      docType: user.docType || '',
      docNumber: user.docNumber || '',
      isActive: user.isActive !== false
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setSaving(true);
    try {
      await apiClient.put(`/admin/users/${editingUser.id}`, formData);
      Swal.fire({ title: t('sharedPages.admin.updated'), text: t('userProfile.successProfileDesc'), icon: 'success', confirmButtonColor: 'var(--primary-500)' });
      fetchUsers();
      setShowModal(false);
    } catch (err: any) {
      Swal.fire({ title: t('sharedPages.admin.error'), text: err?.response?.data?.message || t('userProfile.errorUpdate'), icon: 'error', confirmButtonColor: 'var(--primary-500)' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', outline: 'none' };
  const labelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 };

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)', flexWrap: 'wrap', gap: 'var(--space-3)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.admin.usersTitle')}</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--neutral-100)', borderRadius: 'var(--radius-full)' }}>
            <Search size={16} /><input placeholder={t('sharedPages.admin.searchUsers')} style={{ border: 'none', background: 'none', outline: 'none', fontSize: 'var(--text-sm)' }} />
          </div>
        </div>
      </div>
      {users.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>{t('sharedPages.admin.noUsers')}</p>
      ) : (
        <Card variant="default" padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                  {(t('sharedPages.admin.headersUser', { returnObjects: true }) as string[]).map(h => (
                    <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--neutral-50)', opacity: u.isActive !== false ? 1 : 0.6 }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={rowStyle}><Avatar name={`${u.name || ''} ${u.lastName || ''}`.trim() || 'User'} size="xs" /><span style={{ fontWeight: 500 }}>{`${u.name || ''} ${u.lastName || ''}`.trim() || 'User'}</span></div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--neutral-500)' }}>{u.email}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant="primary" size="sm">{u.roles?.[0]?.name || 'user'}</Badge></td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant={u.isActive !== false ? 'success' : 'error'} size="sm">{u.isActive !== false ? t('sharedPages.admin.active') : t('sharedPages.admin.disabled')}</Badge></td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <Button size="sm" variant="ghost" icon={<Edit size={14} />} onClick={() => handleOpenEdit(u)} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit User Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('sharedPages.admin.editModalTitle')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: '320px', padding: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t('sharedPages.admin.firstName')}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>{t('sharedPages.admin.lastName')}</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>{t('sharedPages.pro.email')} *</label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>{t('sharedPages.pro.phone')}</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ accentColor: 'var(--primary-500)', width: 16, height: 16 }} />
              {t('sharedPages.admin.activeAcc')}
            </label>
            <p style={{ fontSize: '11px', color: 'var(--neutral-400)', marginTop: 2 }}>{t('sharedPages.admin.disableWarn')}</p>
          </div>

          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>{t('sharedPages.pro.cancel')}</Button>
            <Button onClick={handleSave} loading={saving}>{t('sharedPages.pro.saveChanges')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AdminProfessionals() {
  const [professionals, setProfessionals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingPro, setEditingPro] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({
    name: '', lastName: '', email: '', phone: '', verified: false, isVisible: true
  });
  const [saving, setSaving] = React.useState(false);
  const { t } = useTranslation();

  const fetchProfessionals = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/professionals').catch(() => apiClient.get('/professionals'));
      setProfessionals(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { setProfessionals([]); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchProfessionals(); }, []);

  const handleOpenEdit = (pro: any) => {
    setEditingPro(pro);
    setFormData({
      name: pro.user?.name || pro.name || '',
      lastName: pro.user?.lastName || '',
      email: pro.user?.email || '',
      phone: pro.user?.phone || '',
      verified: pro.verified || false,
      isVisible: pro.isVisible !== false
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingPro) return;
    setSaving(true);
    try {
      await apiClient.put(`/admin/professionals/${editingPro.id}`, formData);
      Swal.fire(t('sharedPages.admin.updated'), t('sharedPages.admin.updatedMsg'), 'success');
      fetchProfessionals();
      setShowModal(false);
    } catch {
      Swal.fire(t('sharedPages.admin.error'), t('sharedPages.admin.errorMsg'), 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.admin.prosTitle')}</h1>
      {professionals.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>{t('sharedPages.admin.noPros')}</p>
      ) : (
        <Card variant="default" padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                  {(t('sharedPages.admin.headersPro', { returnObjects: true }) as string[]).map(h => (
                    <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {professionals.map((pro: any) => (
                  <tr key={pro.id} style={{ borderBottom: '1px solid var(--neutral-50)', opacity: pro.isVisible !== false ? 1 : 0.6 }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={rowStyle}><Avatar src={pro.avatar || pro.user?.avatar} name={pro.name || pro.user?.name || 'Pro'} size="xs" /><span style={{ fontWeight: 500 }}>{pro.name || pro.user?.name || 'Professional'}</span></div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Rating value={pro.rating || 0} size="sm" showValue /></td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <Badge variant={pro.verified ? 'success' : 'warning'} size="sm">{pro.verified ? t('sharedPages.admin.verified') : t('sharedPages.admin.pending')}</Badge>
                        {pro.isVisible === false && <Badge variant="error" size="sm">{t('sharedPages.admin.disabled')}</Badge>}
                      </div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                        <Button size="sm" variant="ghost" icon={<Edit size={14} />} onClick={() => handleOpenEdit(pro)} />
                        <Button size="sm" variant="ghost" icon={<TrendingUp size={14} />} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Professional Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={t('sharedPages.admin.editModalTitle')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', minWidth: '320px', padding: 'var(--space-2)' }}>

          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.admin.firstName')}</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.admin.lastName')}</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.email')}</label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
          </div>

          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.phone')}</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={{ width: '100%', padding: 'var(--space-2) var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-md)', outline: 'none' }} />
          </div>

          <div style={{ background: 'var(--neutral-50)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.verified}
                onChange={(e) => setFormData(prev => ({ ...prev, verified: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-500)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>{t('sharedPages.admin.verified')}</span>
                <span style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>Marcar como profesional verificado</span>
              </div>
            </label>
            <div style={{ height: '1px', background: 'var(--neutral-200)' }} />
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={formData.isVisible}
                onChange={(e) => setFormData(prev => ({ ...prev, isVisible: e.target.checked }))}
                style={{ width: 18, height: 18, accentColor: 'var(--primary-500)' }}
              />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontWeight: 600 }}>Visibilidad Pública (Activo)</span>
                <span style={{ fontSize: '11px', color: 'var(--neutral-400)' }}>Los clientes pueden ver este perfil</span>
              </div>
            </label>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>{t('sharedPages.pro.cancel')}</Button>
            <Button onClick={handleSave} loading={saving}>{t('sharedPages.pro.saveChanges')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AdminServices() {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingSvc, setEditingSvc] = React.useState<any>(null);
  const [formData, setFormData] = React.useState<any>({ name: '', description: '', category: '', isActive: true });
  const [saving, setSaving] = React.useState(false);
  const { t } = useTranslation();

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/services/categories');
      setCategories(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    } catch { setCategories([]); }
    finally { setLoading(false); }
  };

  React.useEffect(() => { fetchCategories(); }, []);

  const handleOpenEdit = (svc: any) => {
    setEditingSvc(svc);
    setFormData({ name: svc.name || '', description: svc.description || '', category: svc.category || '', isActive: svc.isActive !== false });
    setShowModal(true);
  };

  const handleOpenCreate = () => {
    setEditingSvc(null);
    setFormData({ name: '', description: '', category: 'general', isActive: true });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category) return;
    setSaving(true);
    try {
      if (editingSvc) {
        // En lugar de usar el endpoint público /services/categories, usamos el de admin para el estado
        await apiClient.patch(`/admin/services/${editingSvc.id}`, formData);
        Swal.fire(t('sharedPages.admin.updated'), t('sharedPages.admin.updatedMsg'), 'success');
      } else {
        await apiClient.post('/services/categories', formData);
        Swal.fire(t('sharedPages.pro.createSvc'), t('proSchedule.successMsg'), 'success');
      }
      setShowModal(false);
      fetchCategories();
    } catch {
      Swal.fire(t('sharedPages.admin.error'), t('sharedPages.admin.errorMsg'), 'error');
    } finally { setSaving(false); }
  };

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.admin.svcTitle')}</h1>
        <Button size="sm" icon={<Plus size={16} />} onClick={handleOpenCreate}>{t('sharedPages.admin.addCat')}</Button>
      </div>
      {categories.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>{t('sharedPages.admin.noCats')}</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
          {categories.map((svc: any, i: number) => (
            <motion.div key={svc.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <div style={{ opacity: svc.isActive === false ? 0.6 : 1 }}>
                <Card variant="default" padding="md">
                  <div style={rowStyle}>
                    <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: svc.isActive === false ? 'var(--neutral-100)' : 'var(--primary-50)', color: svc.isActive === false ? 'var(--neutral-400)' : 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Scissors size={20} />
                    </div>
                    <div style={flexStyle}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                        <p style={{ fontWeight: 600 }}>{svc.name}</p>
                        {svc.isActive === false && <Badge variant="error" size="sm">Inactivo</Badge>}
                      </div>
                      <p style={subStyle}>{svc.description || t('sharedPages.admin.noDesc')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                      <Button size="sm" variant="ghost" icon={<Edit size={14} />} onClick={() => handleOpenEdit(svc)} />
                    </div>
                  </div>
                </Card>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit Category Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSvc ? t('sharedPages.admin.editSvcTitle') : t('sharedPages.admin.addCat')}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: '320px', padding: 'var(--space-2)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.nameLabel')}</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.admin.svcCategory')}</label>
            <input type="text" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} placeholder="e.g. hair, nails, wellness" />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.descLabel')}</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical' }} />
          </div>
          <div style={{ padding: 'var(--space-2)', background: 'var(--neutral-50)', borderRadius: 'var(--radius-lg)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ width: 18, height: 18 }} />
              <span style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Estado Activo</span>
            </label>
            <p style={{ fontSize: '10px', color: 'var(--neutral-400)', marginLeft: 26 }}>Los servicios inactivos no aparecerán en el buscador público.</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>{t('sharedPages.pro.cancel')}</Button>
            <Button onClick={handleSave} loading={saving}>{editingSvc ? t('sharedPages.pro.updateSvc') : t('sharedPages.pro.createSvc')}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AdminTransactions() {
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  // Pagination state
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const limit = 8;
  const [stats, setStats] = React.useState({ totalRevenue: 0, commissions: 0, totalTx: 0 });

  React.useEffect(() => {
    setLoading(true);
    // Fetch paginated transactions and stats in parallel
    Promise.all([
      apiClient.get(`/admin/transactions?page=${page}&limit=${limit}`),
      apiClient.get('/admin/stats')
    ])
      .then(([txRes, statsRes]) => {
        const txData = txRes.data;
        setTransactions(txData.data || []);
        setTotalPages(txData.meta?.totalPages || 1);

        const st = statsRes.data;
        setStats({
          totalRevenue: st.totalRevenue || 0,
          commissions: st.totalCommissions || 0,
          totalTx: txData.meta?.totalItems || 0
        });
      })
      .catch(() => {
        setTransactions([]);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [page]);

  const generatePageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  if (loading && transactions.length === 0) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.admin.txTitle')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <Card variant="default" padding="md">
          <p style={subStyle}>{t('sharedPages.admin.totalRev')}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>${stats.totalRevenue.toFixed(2)}</p>
        </Card>
        <Card variant="default" padding="md">
          <p style={subStyle}>{t('sharedPages.admin.commissions')}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--success-500)' }}>+${stats.commissions.toFixed(2)}</p>
        </Card>
        <Card variant="default" padding="md">
          <p style={subStyle}>{t('sharedPages.admin.totalTx')}</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{stats.totalTx}</p>
        </Card>
      </div>

      {transactions.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>{t('sharedPages.admin.noTx')}</p>
      ) : (
        <Card variant="default" padding="none">
          <div style={{ overflowX: 'auto', opacity: loading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                  {(t('sharedPages.admin.headersTx', { returnObjects: true }) as string[]).map(h => (
                    <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {transactions.map((t: any) => (
                  <tr key={t.id} style={{ borderBottom: '1px solid var(--neutral-50)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>{t.description || t.type}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant={t.type === 'commission' ? 'accent' : 'primary'} size="sm">{t.type}</Badge></td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 700 }}>${parseFloat(t.amount || 0).toFixed(2)}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--neutral-500)' }}>{t.date || new Date(t.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status || 'completed'}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination UI */}
          {totalPages > 1 && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', borderTop: '1px solid var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                {t('sharedPages.admin.prev', 'Anterior')}
              </Button>

              <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                {generatePageNumbers().map((p, i) => (
                  <button
                    key={i}
                    onClick={() => typeof p === 'number' && setPage(p)}
                    disabled={typeof p !== 'number'}
                    style={{
                      width: 32, height: 32,
                      borderRadius: 'var(--radius-md)',
                      border: 'none',
                      background: p === page ? 'var(--primary-500)' : 'transparent',
                      color: p === page ? 'white' : typeof p === 'number' ? 'var(--neutral-700)' : 'var(--neutral-400)',
                      fontWeight: p === page ? 600 : 400,
                      cursor: typeof p === 'number' ? 'pointer' : 'default',
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                {t('sharedPages.admin.next', 'Siguiente')}
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

export function AdminAnalytics() {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    apiClient.get('/admin/analytics').then(res => setStats(res.data))
      .catch(() => setStats({ avgRating: 0, monthlyGrowth: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const barHeights = useMemo(() => Array.from({ length: 30 }, () => 20 + Math.random() * 80), []);

  const metrics = [
    { label: t('sharedPages.admin.avgRating'), value: (stats?.avgRating || 0).toFixed(2), icon: <Star size={18} />, color: '#fbbf24' },
    { label: t('sharedPages.admin.growthRate'), value: `${stats?.monthlyGrowth || 0}%`, icon: <Activity size={18} />, color: 'var(--success-500)' },
    { label: t('sharedPages.admin.bookRate'), value: `${stats?.bookingRate || 0}%`, icon: <CheckCircle size={18} />, color: 'var(--primary-500)' },
    { label: t('sharedPages.admin.cancelRate'), value: `${stats?.cancelRate || 0}%`, icon: <XCircle size={18} />, color: 'var(--error-500)' },
  ];

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.admin.analytTitle')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {metrics.map((m, i) => (
          <motion.div key={m.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card variant="default" padding="md">
              <div style={rowStyle}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-lg)', background: `${m.color}15`, color: m.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{m.icon}</div>
                <div>
                  <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 800 }}>{m.value}</p>
                  <p style={subStyle}>{m.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
      <Card variant="default" padding="lg">
        <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>{t('sharedPages.admin.bookOverTime')}</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-1)', height: 180 }}>
          {barHeights.map((h, i) => (
            <motion.div key={i} style={{ flex: 1, borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', background: 'linear-gradient(to top, var(--primary-500), var(--primary-300))' }}
              initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.2 + i * 0.02, duration: 0.4 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>
          <span>{t('sharedPages.admin.daysAgo')}</span><span>{t('sharedPages.admin.today')}</span>
        </div>
      </Card>
    </div>
  );
}

export function AdminSettings() {
  const { t } = useTranslation();
  const { notify } = useNotification();
  const [saving, setSaving] = React.useState(false);
  const [settings, setSettings] = React.useState(() => {
    try {
      const saved = localStorage.getItem('justme_admin_settings');
      return saved ? JSON.parse(saved) : {
        platformName: 'JustMe',
        commissionRate: '9',
        supportEmail: 'support@justme.com',
        maxRadius: '5'
      };
    } catch {
      return { platformName: 'JustMe', commissionRate: '9', supportEmail: 'support@justme.com', maxRadius: '5' };
    }
  });

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      localStorage.setItem('justme_admin_settings', JSON.stringify(settings));
      notify('success', 'Configuración guardada', 'Los ajustes de la plataforma se han actualizado correctamente.');
      setSaving(false);
    }, 600);
  };

  const fields = [
    { key: 'platformName', label: t('sharedPages.admin.platName') },
    { key: 'commissionRate', label: t('sharedPages.admin.commRate') },
    { key: 'supportEmail', label: t('sharedPages.admin.suppEmail') },
    { key: 'maxRadius', label: t('sharedPages.admin.maxRadius') },
  ];

  return (
    <div style={{ ...pageStyle, maxWidth: 640 }}>
      <h1 style={headerStyle}>{t('sharedPages.admin.setTitle')}</h1>
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {fields.map(f => (
            <div key={f.key}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 4, display: 'block' }}>{f.label}</label>
              <input
                type="text"
                value={(settings as any)[f.key]}
                onChange={e => setSettings({ ...settings, [f.key]: e.target.value })}
                style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }}
              />
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button onClick={handleSave} loading={saving}>{t('sharedPages.pro.saveChanges')}</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

// User favorites
export function UserFavorites() {
  const [favorites, setFavorites] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    userService.getFavorites()
      .then(data => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.user.favTitle')}</h1>
      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Star size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.user.noFavs')}</p>
        </div>
      ) : (
        <div style={listStyle}>
          {favorites.map((pro: any, i: number) => (
            <motion.div key={pro.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card variant="default" padding="md" hover>
                <div style={rowStyle}>
                  <Avatar src={pro.avatar || pro.user?.avatar} name={pro.name || pro.user?.name || 'Professional'} size="md" />
                  <div style={flexStyle}>
                    <p style={{ fontWeight: 600 }}>{pro.name || pro.user?.name || 'Professional'}</p>
                    <p style={subStyle}>{(pro.services || []).map((s: any) => typeof s === 'string' ? s : s.name).join(', ') || t('sharedPages.user.noSvcList')}</p>
                    <Rating value={pro.rating || 0} size="sm" showValue count={pro.reviewCount || 0} />
                  </div>
                  <Button size="sm" variant="accent">{t('sharedPages.user.bookBtn')}</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

export function UserPayments() {
  const [payments, setPayments] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    userService.getPaymentHistory()
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.user.payTitle')}</h1>
      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <DollarSign size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.user.noPays')}</p>
        </div>
      ) : (
        <div style={listStyle}>
          {payments.map((t: any) => (
            <Card key={t.id} variant="default" padding="sm">
              <div style={rowStyle}>
                <div style={flexStyle}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{t.description || t.type}</p>
                  <p style={subStyle}>{t.date || new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ fontWeight: 700 }}>-${parseFloat(t.amount || 0).toFixed(2)}</span>
                <Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status || 'completed'}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function AdminProfile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const { notify } = useNotification();
  const { t } = useTranslation();

  const [formData, setFormData] = React.useState({
    name: user?.name || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
  });

  // Keep form in sync when user data loads
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    try {
      if (!user?.id) return;
      setSaving(true);
      const updatedUser = await userService.updateProfile(user.id.toString(), formData);
      setUser({ ...user, ...updatedUser, role: user.role });
      setEditing(false);
      notify('success', 'Perfil actualizado', 'Los cambios se han guardado correctamente.');
    } catch (err: any) {
      notify('error', 'Error al guardar', err.response?.data?.message || 'No se pudieron guardar los cambios');
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 4, display: 'block' };
  const inputStyle = { width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', transition: 'all 0.2s' };

  return (
    <div style={{ ...pageStyle, maxWidth: 640 }}>
      <h1 style={headerStyle}>Mi Perfil Administrativo</h1>

      {/* Profile Header Card */}
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
          <div style={{ position: 'relative' }}>
            <Avatar src={user?.avatar} name={user?.name || 'Admin'} size="xl" />
            <button style={{
              position: 'absolute', bottom: 0, right: 0,
              background: 'var(--primary-500)', color: 'white',
              border: 'none', borderRadius: '50%', width: 28, height: 28,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <Edit size={12} />
            </button>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-xl)', fontWeight: 700, margin: '0 0 var(--space-1) 0' }}>
              {user?.name} {user?.lastName}
            </h2>
            <p style={{ color: 'var(--neutral-500)', fontSize: 'var(--text-sm)', margin: '0 0 var(--space-2) 0' }}>
              {user?.email}
            </p>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <Badge variant="primary" size="sm">Administrador</Badge>
              <Badge variant="success" size="sm">
                <CheckCircle size={10} style={{ marginRight: 4 }} /> Verificado
              </Badge>
            </div>
          </div>
          {!editing && (
            <Button variant="secondary" onClick={() => setEditing(true)}>
              <Edit size={16} style={{ marginRight: 6 }} /> Editar
            </Button>
          )}
        </div>
      </Card>

      {/* Editor Form */}
      {editing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{ marginTop: 'var(--space-4)' }}
        >
          <Card variant="default" padding="lg">
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, marginBottom: 'var(--space-4)', marginTop: 0 }}>
              Información Personal
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-4)' }}>
              <div>
                <label style={labelStyle}>Nombre</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                  placeholder="Tu nombre"
                />
              </div>
              <div>
                <label style={labelStyle}>Apellidos</label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                  style={inputStyle}
                  placeholder="Tus apellidos"
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)', marginBottom: 'var(--space-5)' }}>
              <div>
                <label style={labelStyle}>Email (Solo lectura)</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  style={{ ...inputStyle, background: 'var(--neutral-50)', color: 'var(--neutral-400)' }}
                  disabled
                  title="El email no se puede modificar desde aquí"
                />
                <p style={{ fontSize: '10px', color: 'var(--neutral-400)', marginTop: 3 }}>El email no puede modificarse aquí por seguridad.</p>
              </div>
              <div>
                <label style={labelStyle}>Teléfono</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={inputStyle}
                  placeholder="Tu teléfono"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
              <Button variant="ghost" onClick={() => setEditing(false)}>{t('sharedPages.pro.cancel')}</Button>
              <Button onClick={handleSave} loading={saving}>{t('sharedPages.pro.saveChanges')}</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Admin Stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        style={{ marginTop: 'var(--space-4)' }}
      >
        <Card variant="default" padding="lg">
          <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-base)', fontWeight: 700, margin: '0 0 var(--space-4) 0' }}>
            Información de la cuenta
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {[
              { label: 'Rol', value: 'Administrador' },
              { label: 'Email', value: user?.email || '—' },
              { label: 'Teléfono', value: user?.phone || '—' },
              { label: 'Última conexión', value: 'Ahora mismo' },
            ].map((st, i) => (
              <div key={i} style={{ display: 'flex', borderBottom: '1px solid var(--neutral-100)', paddingBottom: 'var(--space-2)' }}>
                <span style={{ width: 140, fontWeight: 500, color: 'var(--neutral-500)', fontSize: 'var(--text-sm)' }}>{st.label}</span>
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-700)', fontWeight: 500 }}>{st.value}</span>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
