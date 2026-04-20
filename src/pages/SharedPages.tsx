// Shared pages for secondary views across all roles
// All data fetched from backend - no mock data
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, Avatar, Rating } from '../components/ui';
import { Modal } from '../components/ui/Modal';
import { Home, DollarSign, Plus, Scissors, Edit, Image as ImageIcon, Trash2, Search, Activity, XCircle, Star, MapPin, CheckCircle, Clock, Loader, TrendingUp } from 'lucide-react';
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
import { Navigation } from 'lucide-react';

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
  const [requests, setRequests] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t, i18n } = useTranslation();

  React.useEffect(() => {
    if (!professionalId) { setLoading(false); return; }
    bookingService.getProfessionalBookings(professionalId)
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setRequests(list.filter((b: any) => b.status === 'pending' || b.status === 'confirmed'));
      })
      .catch(e => { console.warn("Failed to fetch bookings", e); setRequests([]); })
      .finally(() => setLoading(false));
  }, [professionalId]);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.bookingReqTitle')}</h1>
      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Clock size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.pro.noPendingBookings')}</p>
        </div>
      ) : (
        <div style={listStyle}>
          {requests.map((b: any, i: number) => {
            const clientName = b.client?.name || b.user?.name || 'Client';
            const svcName = b.service?.name || b.serviceName || b.service || 'Service';
            const bDate = new Date(b.scheduledAt || b.date || Date.now());
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                <Card variant="default" padding="md">
                  <div style={rowStyle}>
                    <Avatar src={b.client?.avatar || b.professionalAvatar} name={clientName} size="md" />
                    <div style={flexStyle}>
                      <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{clientName}</p>
                      <p style={subStyle}>{svcName} • {bDate.toLocaleDateString(i18n.language)} at {b.time || bDate.toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}</p>
                      <p style={subStyle}>{b.locationType === 'home' ? <><Home size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('sharedPages.pro.homeService')}</> : <><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {t('sharedPages.pro.atStudio')}</>} • ${b.price || 0}</p>
                    </div>
                    <Badge variant={b.status === 'confirmed' ? 'success' : 'warning'}>{b.status}</Badge>
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
  const [bookings, setBookings] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    bookingService.getProfessionalBookings()
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.data || []);
        setBookings(list);
      })
      .catch(() => setBookings([]))
      .finally(() => setLoading(false));
  }, []);

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const hours = Array.from({ length: 10 }, (_, i) => `${9 + i}:00`);

  const bookedSlots = useMemo(() => {
    return hours.map(h => {
      const hourNum = parseInt(h);
      return bookings.some((b: any) => {
        const bDate = new Date(b.scheduledAt || b.date || Date.now());
        return bDate.getHours() === hourNum && (b.status === 'confirmed' || b.status === 'pending');
      });
    });
  }, [bookings]);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.calTitle')}</h1>
      <Card variant="default" padding="md">
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-4)', overflowX: 'auto' }}>
          {days.map((d, i) => {
            const date = new Date();
            date.setDate(date.getDate() - date.getDay() + 1 + i);
            return (
              <div key={d} style={{ flex: 1, textAlign: 'center', minWidth: 80 }}>
                <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>{d}</p>
                <p style={{ fontWeight: 700 }}>{date.getDate()}</p>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gap: 'var(--space-1)' }}>
          {hours.map((h, idx) => (
            <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-3)', borderBottom: '1px solid var(--neutral-100)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', width: 50 }}>{h}</span>
              <div style={{ flex: 1, height: 36, background: bookedSlots[idx] ? 'var(--primary-50)' : 'transparent', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', paddingLeft: 'var(--space-2)' }}>
                {bookedSlots[idx] && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-600)', fontWeight: 600 }}>{t('sharedPages.pro.booking')}</span>}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export function ProEarnings() {
  const { professionalId } = useAuth();
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!professionalId) { setLoading(false); return; }
    walletService.getTransactions(professionalId)
      .then(data => setTransactions(Array.isArray(data) ? data : (data?.data || [])))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [professionalId]);

  const payments = transactions.filter(t => t.type === 'payment');
  const totalEarned = payments.reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.earnTitle')}</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {[{ label: t('sharedPages.pro.totalEarned'), val: `$${totalEarned.toFixed(2)}` }, { label: t('sharedPages.pro.transactions'), val: String(transactions.length) }].map(s => (
          <Card key={s.label} variant="default" padding="md">
            <p style={subStyle}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{s.val}</p>
          </Card>
        ))}
      </div>
      <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>{t('sharedPages.pro.recentEarnings')}</h2>
      {payments.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>{t('sharedPages.pro.noEarnings')}</p>
      ) : (
        <div style={listStyle}>
          {payments.map((t: any) => (
            <Card key={t.id} variant="default" padding="sm">
              <div style={rowStyle}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-lg)', background: 'var(--success-50)', color: 'var(--success-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <DollarSign size={16} />
                </div>
                <div style={flexStyle}>
                  <p style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{t.description || t.type}</p>
                  <p style={subStyle}>{t.date || new Date(t.createdAt).toLocaleDateString()}</p>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--success-500)' }}>+${parseFloat(t.amount || 0).toFixed(2)}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export function ProServices() {
  const { professionalId, verificationStatus } = useAuth();
  const { notify } = useNotification();
  const [services, setServices] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingService, setEditingService] = React.useState<any>(null);
  const [formData, setFormData] = React.useState({ name: '', description: '', price: '', duration: '' });
  const [saving, setSaving] = React.useState(false);
  const { t } = useTranslation();

  const fetchServices = async () => {
    if (!professionalId) return;
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
    setFormData({ name: '', description: '', price: '', duration: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (svc: any) => {
    setEditingService(svc);
    setFormData({ name: svc.name || '', description: svc.description || '', price: String(svc.price || ''), duration: String(svc.duration || '') });
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
        name: formData.name,
        description: formData.description,
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

  const isBlocked = verificationStatus !== 'approved';

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
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{s.name}</p>
                    {s.description && <p style={{ ...subStyle, marginTop: 2 }}>{s.description}</p>}
                    <p style={subStyle}><Clock size={12} style={{ display: 'inline' }} /> {s.duration || 30} {t('sharedPages.pro.min')}</p>
                  </div>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 'var(--text-lg)', color: 'var(--primary-600)' }}>${s.price || 0}</span>
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
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.priceLabel')}</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="25" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>{t('sharedPages.pro.durLabel')}</label>
              <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="30" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
            </div>
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
  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>{t('sharedPages.pro.portTitle')}</h1>
        <Button size="sm" icon={<Plus size={16} />}>{t('sharedPages.pro.uploadBtn')}</Button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 'var(--space-3)' }}>
        {Array.from({ length: 9 }, (_, i) => (
          <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            style={{ aspectRatio: '1', borderRadius: 'var(--radius-xl)', background: 'var(--neutral-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--neutral-300)', position: 'relative', overflow: 'hidden', cursor: 'pointer' }}>
            <ImageIcon size={28} />
            <div style={{ position: 'absolute', top: 8, right: 8 }}>
              <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function ProProfileEditor() {
  const { user, professionalId } = useAuth();
  const { notify } = useNotification();
  const { t } = useTranslation();
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    bio: '', address: '', serviceRadius: 5, experience: '', specialties: '',
    latitude: 0, longitude: 0
  });

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
    if (!professionalId) return;
    setSaving(true);
    try {
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
      await professionalsService.updateProfile(professionalId, cleanData);
      notify('success', 'Profile saved', 'Your professional profile has been updated.');
    } catch (e) {
      notify('error', 'Error', 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', background: 'var(--neutral-0)', color: 'var(--neutral-900)' };
  const labelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 4, display: 'block' };

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.profParams')}</h1>
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label style={labelStyle}>{t('sharedPages.pro.fullName')}</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.bio')}</label><textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3} style={{ ...inputStyle, fontFamily: 'var(--font-body)', resize: 'vertical' }} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.experience')}</label><input type="text" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} placeholder="" style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.specialties')}</label><input type="text" value={formData.specialties} onChange={e => setFormData({ ...formData, specialties: e.target.value })} placeholder="" style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.phone')}</label><input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.email')}</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>{t('sharedPages.pro.address')}</label><input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} /></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div><label style={labelStyle}>{t('sharedPages.pro.lat')}</label><input type="number" step="0.0000001" value={formData.latitude} onChange={e => setFormData({ ...formData, latitude: parseFloat(e.target.value) || 0 })} style={inputStyle} /></div>
            <div><label style={labelStyle}>{t('sharedPages.pro.lng')}</label><input type="number" step="0.0000001" value={formData.longitude} onChange={e => setFormData({ ...formData, longitude: parseFloat(e.target.value) || 0 })} style={inputStyle} /></div>
          </div>
          <Button variant="secondary" icon={<Navigation size={14} />} onClick={handleDetectLocation}>{t('sharedPages.pro.detectLoc')}</Button>
          
          <div style={{ height: '350px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', border: '1.5px solid var(--neutral-200)', position: 'relative', marginTop: 'var(--space-2)' }}>
             <MapView 
               professionals={[]}
               userLocation={null}
               isPicker={true}
               center={{ lat: formData.latitude, lng: formData.longitude }}
               onPickerChange={handleMapClick}
               zoom={15}
             />
             <div style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 1000, background: 'rgba(255,255,255,0.9)', padding: '6px 12px', borderRadius: ' var(--radius-lg)', fontSize: '11px', fontWeight: '800', border: '1px solid var(--neutral-200)', color: 'var(--primary-600)', backdropFilter: 'blur(4px)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                {t('sharedPages.pro.mapHint')}
             </div>
          </div>

          <Button onClick={handleSave} loading={saving} size="lg" style={{ marginTop: 'var(--space-2)' }}>{t('sharedPages.pro.saveChanges')}</Button>
        </div>
      </Card>
    </div>
  );
}

export function ProReviews() {
  const { professionalId } = useAuth();
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [stats, setStats] = React.useState({ avg: 0, count: 0 });
  const { t } = useTranslation();

  React.useEffect(() => {
    if (!professionalId) return;
    professionalsService.getReviews(professionalId)
      .then(data => {
        const list = Array.isArray(data) ? data : [];
        setReviews(list);
        if (list.length > 0) {
          const avg = list.reduce((s: number, r: any) => s + (r.rating || 0), 0) / list.length;
          setStats({ avg, count: list.length });
        }
      })
      .catch(() => setReviews([]))
      .finally(() => setLoading(false));
  }, [professionalId]);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>{t('sharedPages.pro.revTitle')}</h1>
      <Card variant="glass" padding="md">
        <div style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800 }}>{stats.avg.toFixed(1)}</p>
            <Rating value={stats.avg} size="md" />
            <p style={subStyle}>{t('sharedPages.pro.basedOn', { count: stats.count })}</p>
          </div>
        </div>
      </Card>
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Star size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>{t('sharedPages.pro.noRev')}</p>
        </div>
      ) : (
        <div style={{ ...listStyle, marginTop: 'var(--space-4)' }}>
          {reviews.map((r: any, i: number) => (
            <motion.div key={r.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
              <Card variant="default" padding="md">
                <div style={{ ...rowStyle, marginBottom: 'var(--space-2)' }}>
                  <Avatar src={r.userAvatar || r.user?.avatar} name={r.userName || r.user?.name || 'User'} size="sm" />
                  <div style={flexStyle}>
                    <p style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{r.userName || r.user?.name || 'User'}</p>
                    <p style={subStyle}>{r.date || new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Rating value={r.rating || 0} size="sm" />
                </div>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--neutral-600)', lineHeight: 'var(--leading-relaxed)' }}>{r.comment || r.text}</p>
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
    <div style={{...pageStyle, maxWidth: 640}}>
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
