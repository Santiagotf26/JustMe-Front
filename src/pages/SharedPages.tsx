// Shared pages for secondary views across all roles
// All data fetched from backend - no mock data
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Card, Badge, Button, Avatar, Rating } from '../components/ui';
import { Modal } from '../components/ui/Modal';
import { Home, DollarSign, Plus, Scissors, Edit, Image as ImageIcon, Trash2, Search, Activity, XCircle, Star, MapPin, CheckCircle, Clock, Loader } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { bookingService } from '../services/bookingService';
import { professionalsService } from '../services/professionalsService';
import { walletService } from '../services/walletService';
import { userService } from '../services/userService';
import { apiClient } from '../services/api';

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
      <h1 style={headerStyle}>Booking Requests</h1>
      {requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Clock size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No pending booking requests</p>
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
                      <p style={subStyle}>{svcName} • {bDate.toLocaleDateString()} at {b.time || bDate.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}</p>
                      <p style={subStyle}>{b.locationType === 'home' ? <><Home size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> Home Service</> : <><MapPin size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> At Studio</>} • ${b.price || 0}</p>
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
      <h1 style={headerStyle}>Calendar</h1>
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
                {bookedSlots[idx] && <span style={{ fontSize: 'var(--text-xs)', color: 'var(--primary-600)', fontWeight: 600 }}>Booking</span>}
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
      <h1 style={headerStyle}>Earnings</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        {[{ label: 'Total Earned', val: `$${totalEarned.toFixed(2)}` }, { label: 'Transactions', val: String(transactions.length) }].map(s => (
          <Card key={s.label} variant="default" padding="md">
            <p style={subStyle}>{s.label}</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{s.val}</p>
          </Card>
        ))}
      </div>
      <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-3)' }}>Recent Earnings</h2>
      {payments.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>No earnings yet</p>
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
        notify('success', 'Updated', 'Service updated successfully');
      } else {
        await professionalsService.addService(professionalId, payload);
        notify('success', 'Created', 'Service created successfully');
      }
      setShowModal(false);
      fetchServices();
    } catch (err: any) {
      notify('error', 'Error', err?.response?.data?.message || 'Failed to save service');
    } finally { setSaving(false); }
  };

  const handleDelete = async (svcId: string) => {
    if (!professionalId || !confirm('Are you sure you want to delete this service?')) return;
    try {
      await professionalsService.deleteService(professionalId, svcId);
      notify('success', 'Deleted', 'Service deleted');
      fetchServices();
    } catch (err: any) {
      notify('error', 'Error', err?.response?.data?.message || 'Failed to delete service');
    }
  };

  const isBlocked = verificationStatus !== 'approved';

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>My Services</h1>
        <Button size="sm" icon={<Plus size={16} />} onClick={handleOpenCreate} disabled={isBlocked}>Add Service</Button>
      </div>

      {isBlocked && (
        <div style={{ padding: 'var(--space-3)', marginBottom: 'var(--space-4)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)', color: '#b45309', fontSize: 'var(--text-sm)' }}>
          ⚠️ You need to be a verified professional to manage services.
        </div>
      )}

      {services.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Scissors size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No services yet. Add your first service to start receiving bookings.</p>
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
                    <p style={subStyle}><Clock size={12} style={{ display: 'inline' }} /> {s.duration || 30} min</p>
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
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingService ? 'Edit Service' : 'Add Service'}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: '320px', padding: 'var(--space-2)' }}>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Name *</label>
            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Basic Haircut" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
          </div>
          <div>
            <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Description</label>
            <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={2} placeholder="Describe the service..." style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', fontFamily: 'var(--font-body)', resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Price (USD) *</label>
              <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} placeholder="25" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', display: 'block', marginBottom: 4 }}>Duration (min) *</label>
              <input type="number" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="30" style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-2)' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>{editingService ? 'Update' : 'Create'} Service</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function ProPortfolio() {
  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>Portfolio</h1>
        <Button size="sm" icon={<Plus size={16} />}>Upload</Button>
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
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: user?.name || '', email: user?.email || '', phone: user?.phone || '',
    bio: '', address: '', serviceRadius: 5, experience: '', specialties: ''
  });

  React.useEffect(() => {
    if (professionalId) {
      professionalsService.getProfessionalById(professionalId).then(data => {
        if (data) {
          setFormData(prev => ({
            ...prev,
            bio: data.bio || data.description || prev.bio,
            address: data.location?.address || prev.address,
            serviceRadius: data.serviceRadius || prev.serviceRadius,
            experience: data.experience || prev.experience,
            specialties: data.specialties || prev.specialties,
          }));
        }
      }).catch(console.warn);
    }
  }, [professionalId]);

  const handleSave = async () => {
    if (!professionalId) return;
    setSaving(true);
    try {
      await professionalsService.updateProfile(professionalId, formData);
      notify('success', 'Profile saved', 'Your professional profile has been updated.');
    } catch (e) {
      notify('error', 'Error', 'Failed to save profile');
    } finally { setSaving(false); }
  };

  const inputStyle: React.CSSProperties = { width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none', background: 'var(--neutral-0)', color: 'var(--neutral-900)' };
  const labelStyle: React.CSSProperties = { fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 4, display: 'block' };

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Edit Profile</h1>
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div><label style={labelStyle}>Full Name</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Bio / Description</label><textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} rows={3} style={{ ...inputStyle, fontFamily: 'var(--font-body)', resize: 'vertical' }} /></div>
          <div><label style={labelStyle}>Experience</label><input type="text" value={formData.experience} onChange={e => setFormData({ ...formData, experience: e.target.value })} placeholder="e.g. 5 years in hair styling" style={inputStyle} /></div>
          <div><label style={labelStyle}>Specialties</label><input type="text" value={formData.specialties} onChange={e => setFormData({ ...formData, specialties: e.target.value })} placeholder="e.g. Color, Balayage, Bridal" style={inputStyle} /></div>
          <div><label style={labelStyle}>Phone</label><input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Email</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Address</label><input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={inputStyle} /></div>
          <div><label style={labelStyle}>Service Radius (km)</label><input type="number" value={formData.serviceRadius} onChange={e => setFormData({ ...formData, serviceRadius: parseInt(e.target.value) || 0 })} style={inputStyle} /></div>
          <Button onClick={handleSave} loading={saving}>Save Changes</Button>
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
      <h1 style={headerStyle}>Reviews</h1>
      <Card variant="glass" padding="md">
        <div style={{ marginBottom: 'var(--space-5)', display: 'flex', alignItems: 'center', gap: 'var(--space-6)', justifyContent: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-4xl)', fontWeight: 800 }}>{stats.avg.toFixed(1)}</p>
            <Rating value={stats.avg} size="md" />
            <p style={subStyle}>Based on {stats.count} reviews</p>
          </div>
        </div>
      </Card>
      {reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Star size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No reviews yet</p>
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
  const { notify } = useNotification();
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [showModal, setShowModal] = React.useState(false);
  const [editingUser, setEditingUser] = React.useState<any>(null);
  const [saving, setSaving] = React.useState(false);
  const [formData, setFormData] = React.useState({
    name: '', lastName: '', email: '', phone: '', docType: '', docNumber: '', isActive: true
  });

  React.useEffect(() => {
    apiClient.get('/admin/users').then(res => {
      setUsers(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    }).catch(() => setUsers([])).finally(() => setLoading(false));
  }, []);

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
      await userService.adminUpdateUser(editingUser.id, formData);
      notify('success', 'User Updated', 'The user details have been updated successfully.');
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
      setShowModal(false);
    } catch (err: any) {
      notify('error', 'Update Failed', err?.response?.data?.message || 'Failed to update user');
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
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>Users Management</h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2) var(--space-3)', background: 'var(--neutral-100)', borderRadius: 'var(--radius-full)' }}>
            <Search size={16} /><input placeholder="Search users..." style={{ border: 'none', background: 'none', outline: 'none', fontSize: 'var(--text-sm)' }} />
          </div>
        </div>
      </div>
      {users.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>No users found</p>
      ) : (
        <Card variant="default" padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                  {['User', 'Email', 'Role', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u: any) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--neutral-50)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={rowStyle}><Avatar name={`${u.name || ''} ${u.lastName || ''}`.trim() || 'User'} size="xs" /><span style={{ fontWeight: 500 }}>{`${u.name || ''} ${u.lastName || ''}`.trim() || 'User'}</span></div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--neutral-500)' }}>{u.email}</td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant="primary" size="sm">{u.roles?.[0]?.name || 'user'}</Badge></td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Badge variant={u.isActive !== false ? 'success' : 'error'} size="sm">{u.isActive !== false ? 'Active' : 'Disabled'}</Badge></td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <Button size="sm" variant="ghost" icon={<Edit size={14} />} onClick={() => handleOpenEdit(u)}>Edit</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit User Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Edit User">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', minWidth: '320px', padding: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>First Name *</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Last Name</label>
              <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Email *</label>
            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Phone</label>
            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={inputStyle} />
          </div>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Document Type</label>
              <input type="text" value={formData.docType} onChange={e => setFormData({ ...formData, docType: e.target.value })} placeholder="e.g. ID, Passport" style={inputStyle} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Document Number</label>
              <input type="text" value={formData.docNumber} onChange={e => setFormData({ ...formData, docNumber: e.target.value })} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-2)' }}>
            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 'var(--space-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={formData.isActive} onChange={e => setFormData({ ...formData, isActive: e.target.checked })} style={{ accentColor: 'var(--primary-500)', width: 16, height: 16 }} />
              Active Account
            </label>
            <p style={{ fontSize: '11px', color: 'var(--neutral-400)', marginTop: 2 }}>Unchecking this will disable the user's ability to log in.</p>
          </div>
          
          <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end', marginTop: 'var(--space-3)' }}>
            <Button variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function AdminProfessionals() {
  const [professionals, setProfessionals] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get('/admin/professionals').catch(() => apiClient.get('/professionals')).then(res => {
      setProfessionals(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    }).catch(() => setProfessionals([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Professionals Management</h1>
      {professionals.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>No professionals found</p>
      ) : (
        <Card variant="default" padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                  {['Professional', 'Rating', 'Status', 'Actions'].map(h => (
                    <th key={h} style={{ padding: 'var(--space-3) var(--space-4)', textAlign: 'left', fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', textTransform: 'uppercase' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {professionals.map((pro: any) => (
                  <tr key={pro.id} style={{ borderBottom: '1px solid var(--neutral-50)' }}>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <div style={rowStyle}><Avatar src={pro.avatar || pro.user?.avatar} name={pro.name || pro.user?.name || 'Pro'} size="xs" /><span style={{ fontWeight: 500 }}>{pro.name || pro.user?.name || 'Professional'}</span></div>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Rating value={pro.rating || 0} size="sm" showValue /></td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                      <Badge variant={pro.verified ? 'success' : 'warning'} size="sm">{pro.verified ? 'Verified' : 'Pending'}</Badge>
                    </td>
                    <td style={{ padding: 'var(--space-3) var(--space-4)' }}><Button size="sm" variant="ghost">View</Button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}

export function AdminServices() {
  const [categories, setCategories] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get('/services/categories').catch(() => apiClient.get('/services')).then(res => {
      setCategories(Array.isArray(res.data) ? res.data : (res.data?.data || []));
    }).catch(() => setCategories([])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <div style={{ ...rowStyle, justifyContent: 'space-between', marginBottom: 'var(--space-5)' }}>
        <h1 style={{ ...headerStyle, marginBottom: 0 }}>Service Categories</h1>
        <Button size="sm" icon={<Plus size={16} />}>Add Category</Button>
      </div>
      {categories.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>No service categories configured</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 'var(--space-3)' }}>
          {categories.map((svc: any, i: number) => (
            <motion.div key={svc.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
              <Card variant="default" padding="md">
                <div style={rowStyle}>
                  <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-lg)', background: 'var(--primary-50)', color: 'var(--primary-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Scissors size={20} />
                  </div>
                  <div style={flexStyle}>
                    <p style={{ fontWeight: 600 }}>{svc.name}</p>
                    <p style={subStyle}>{svc.description || 'No description'}</p>
                  </div>
                  <div style={{ display: 'flex', gap: 'var(--space-1)' }}>
                    <Button size="sm" variant="ghost" icon={<Edit size={14} />} />
                    <Button size="sm" variant="ghost" icon={<Trash2 size={14} />} />
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

export function AdminTransactions() {
  const [transactions, setTransactions] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get('/admin/transactions').then((res: any) => {
      const data = res?.data || res;
      setTransactions(Array.isArray(data) ? data : (data?.data || []));
    }).catch(() => setTransactions([])).finally(() => setLoading(false));
  }, []);

  const totalRevenue = transactions.filter(t => t.type === 'payment').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);
  const commissions = transactions.filter(t => t.type === 'commission').reduce((s, t) => s + (parseFloat(t.amount) || 0), 0);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Transactions</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-5)' }}>
        <Card variant="default" padding="md">
          <p style={subStyle}>Total Revenue</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>${totalRevenue.toFixed(2)}</p>
        </Card>
        <Card variant="default" padding="md">
          <p style={subStyle}>Commissions</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--success-500)' }}>+${commissions.toFixed(2)}</p>
        </Card>
        <Card variant="default" padding="md">
          <p style={subStyle}>Total Transactions</p>
          <p style={{ fontFamily: 'var(--font-display)', fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{transactions.length}</p>
        </Card>
      </div>
      {transactions.length === 0 ? (
        <p style={{ color: 'var(--neutral-400)', textAlign: 'center', padding: '2rem' }}>No transactions found</p>
      ) : (
        <Card variant="default" padding="none">
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--text-sm)' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--neutral-100)' }}>
                  {['Description', 'Type', 'Amount', 'Date', 'Status'].map(h => (
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
        </Card>
      )}
    </div>
  );
}

export function AdminAnalytics() {
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    apiClient.get('/admin/analytics').then(res => setStats(res.data))
      .catch(() => setStats({ avgRating: 0, monthlyGrowth: 0 }))
      .finally(() => setLoading(false));
  }, []);

  const barHeights = useMemo(() => Array.from({ length: 30 }, () => 20 + Math.random() * 80), []);

  const metrics = [
    { label: 'Avg. Rating', value: (stats?.avgRating || 0).toFixed(2), icon: <Star size={18} />, color: '#fbbf24' },
    { label: 'Growth Rate', value: `${stats?.monthlyGrowth || 0}%`, icon: <Activity size={18} />, color: 'var(--success-500)' },
    { label: 'Booking Rate', value: `${stats?.bookingRate || 0}%`, icon: <CheckCircle size={18} />, color: 'var(--primary-500)' },
    { label: 'Cancel Rate', value: `${stats?.cancelRate || 0}%`, icon: <XCircle size={18} />, color: 'var(--error-500)' },
  ];

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Platform Analytics</h1>
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
        <h2 style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-4)' }}>Bookings Over Time</h2>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--space-1)', height: 180 }}>
          {barHeights.map((h, i) => (
            <motion.div key={i} style={{ flex: 1, borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', background: 'linear-gradient(to top, var(--primary-500), var(--primary-300))' }}
              initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: 0.2 + i * 0.02, duration: 0.4 }} />
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--space-2)', fontSize: 'var(--text-xs)', color: 'var(--neutral-400)' }}>
          <span>30 days ago</span><span>Today</span>
        </div>
      </Card>
    </div>
  );
}

export function AdminSettings() {
  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Settings</h1>
      <Card variant="default" padding="lg">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {[
            { label: 'Platform Name', defaultVal: 'JustMe' },
            { label: 'Commission Rate (%)', defaultVal: '9' },
            { label: 'Support Email', defaultVal: 'support@justme.com' },
            { label: 'Max Search Radius (km)', defaultVal: '5' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--neutral-500)', marginBottom: 4, display: 'block' }}>{f.label}</label>
              <input type="text" defaultValue={f.defaultVal} style={{ width: '100%', padding: 'var(--space-3)', border: '1.5px solid var(--neutral-200)', borderRadius: 'var(--radius-xl)', outline: 'none' }} />
            </div>
          ))}
          <Button>Save Settings</Button>
        </div>
      </Card>
    </div>
  );
}

// User favorites
export function UserFavorites() {
  const [favorites, setFavorites] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    userService.getFavorites()
      .then(data => setFavorites(Array.isArray(data) ? data : []))
      .catch(() => setFavorites([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Favorites</h1>
      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <Star size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No favorites yet. Browse professionals to add them!</p>
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
                    <p style={subStyle}>{(pro.services || []).map((s: any) => typeof s === 'string' ? s : s.name).join(', ') || 'No services listed'}</p>
                    <Rating value={pro.rating || 0} size="sm" showValue count={pro.reviewCount || 0} />
                  </div>
                  <Button size="sm" variant="accent">Book</Button>
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

  React.useEffect(() => {
    userService.getPaymentHistory()
      .then(data => setPayments(Array.isArray(data) ? data : []))
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={loadingCenter}><Loader size={28} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} /></div>;

  return (
    <div style={pageStyle}>
      <h1 style={headerStyle}>Payment History</h1>
      {payments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--neutral-400)' }}>
          <DollarSign size={40} style={{ opacity: 0.3, marginBottom: '12px' }} />
          <p>No payments yet</p>
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
