import { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera, MapPin, Heart, CreditCard, Star, Edit3, Save, X, Loader, Navigation } from 'lucide-react';
import { Card, Avatar, Button, Badge } from '../../components/ui';
import { BecomeProfessionalModal } from '../../components/ui/BecomeProfessionalModal';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { userService } from '../../services/userService';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import './UserProfile.css';

export default function UserProfile() {
  const { user, logout, verificationStatus, refreshVerificationStatus, setUser } = useAuth();
  const { bookings } = useBookings();
  const navigate = useNavigate();
  const { notify } = useNotification();

  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editPhone, setEditPhone] = useState(user?.phone || '');
  const [saving, setSaving] = useState(false);

  // Favorites & payments from API
  const [favorites, setFavorites] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [showBecomeProModal, setShowBecomeProModal] = useState(false);

  // Geolocation
  const [detectingLocation, setDetectingLocation] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true);
      try {
        const [favs, pays] = await Promise.all([
          userService.getFavorites().catch(() => []),
          userService.getPaymentHistory().catch(() => []),
        ]);
        setFavorites(Array.isArray(favs) ? favs : []);
        setPayments(Array.isArray(pays) ? pays : []);
      } catch {
        setFavorites([]);
        setPayments([]);
      } finally {
        setDataLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSaveProfile = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      await userService.updateProfile(String(user.id), {
        name: editName,
        phone: editPhone,
      });
      // Update local user state
      setUser({ ...user, name: editName, phone: editPhone });
      setEditing(false);
      notify('success', 'Profile updated', 'Your profile has been saved successfully.');
    } catch (err: any) {
      notify('error', 'Error', err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDetectLocation = () => {
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await userService.updateProfile(String(user?.id), {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          notify('success', 'Location saved', 'Your location has been updated.');
        } catch {
          notify('error', 'Error', 'Failed to save location');
        } finally {
          setDetectingLocation(false);
        }
      },
      () => {
        notify('error', 'Error', 'Could not detect your location');
        setDetectingLocation(false);
      }
    );
  };

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <motion.div className="profile-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="profile-avatar-wrap">
          <Avatar src={user?.avatar} name={user?.name || 'User'} size="xl" />
          <button className="avatar-edit"><Camera size={14} /></button>
        </div>

        {editing ? (
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Name"
              style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '8px', border: '1px solid var(--neutral-200)', background: 'var(--neutral-0)', color: 'var(--neutral-900)' }}
            />
            <input
              type="tel"
              value={editPhone}
              onChange={(e) => setEditPhone(e.target.value)}
              placeholder="Phone"
              style={{ width: '100%', padding: '8px 12px', marginBottom: '8px', borderRadius: '8px', border: '1px solid var(--neutral-200)', background: 'var(--neutral-0)', color: 'var(--neutral-900)' }}
            />
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
              <Button size="sm" onClick={handleSaveProfile} loading={saving} icon={<Save size={14} />}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)} icon={<X size={14} />}>Cancel</Button>
            </div>
          </div>
        ) : (
          <>
            <h1>{user?.name}</h1>
            <p className="profile-email">{user?.email}</p>
            <p className="profile-phone">{user?.phone}</p>
            <Button variant="secondary" size="sm" icon={<Edit3 size={14} />} onClick={() => {
              setEditName(user?.name || '');
              setEditPhone(user?.phone || '');
              setEditing(true);
            }}>Edit Profile</Button>
          </>
        )}
      </motion.div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-item"><span className="stat-val">{bookings.filter(b => b.status === 'completed').length}</span><span className="stat-label">Bookings</span></div>
        <div className="stat-item"><span className="stat-val">{favorites.length}</span><span className="stat-label">Favorites</span></div>
        <div className="stat-item"><span className="stat-val">{bookings.filter(b => b.status === 'completed').length}</span><span className="stat-label">Reviews</span></div>
      </div>

      {/* Become Professional CTA */}
      {user?.role === 'user' && verificationStatus === 'none' && (
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Card variant="gradient" padding="md" className="become-pro-cta">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--neutral-0)' }}>Become a Professional</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)' }}>Offer your services and start earning today.</p>
              </div>
              <Button size="sm" variant="primary" onClick={() => setShowBecomeProModal(true)}>
                Get Started
              </Button>
            </div>
          </Card>
        </div>
      )}

      {verificationStatus === 'pending' && (
        <div style={{ marginBottom: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: 'var(--radius-md)' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: '#b45309' }}>
            ⏳ Tu solicitud para ser profesional está siendo revisada.
          </p>
        </div>
      )}

      {/* Location */}
      <section className="profile-section">
        <h2><MapPin size={18} /> Location</h2>
        <Button size="sm" variant="secondary" icon={<Navigation size={14} />} onClick={handleDetectLocation} loading={detectingLocation}>
          {detectingLocation ? 'Detecting...' : 'Detect My Location'}
        </Button>
      </section>

      {/* Addresses */}
      <section className="profile-section">
        <h2><MapPin size={18} /> Saved Addresses</h2>
        {user?.addresses && user.addresses.length > 0 ? (
          user.addresses.map((addr: any, i: number) => (
            <Card key={i} variant="default" padding="sm" className="addr-card">
              <Badge variant="primary" size="sm">{addr.label || addr.title || 'Address'}</Badge>
              <p>{addr.address}</p>
            </Card>
          ))
        ) : (
          <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)' }}>No saved addresses</p>
        )}
        <Button variant="ghost" size="sm">+ Add Address</Button>
      </section>

      {/* Favorites */}
      <section className="profile-section">
        <h2><Heart size={18} /> Favorite Professionals</h2>
        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <Loader size={24} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
          </div>
        ) : favorites.length === 0 ? (
          <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)' }}>No favorites yet. Browse professionals and add them to your favorites!</p>
        ) : (
          <div className="favorites-list">
            {favorites.map((pro: any) => (
              <Card key={pro.id} variant="default" padding="sm" hover className="fav-card">
                <Avatar src={pro.avatar || pro.user?.avatar} name={pro.name || pro.user?.name || 'Professional'} size="sm" />
                <div className="fav-info"><p className="fav-name">{pro.name || pro.user?.name}</p><p className="fav-svc">{pro.services?.[0]?.name || pro.services?.[0] || ''}</p></div>
                <div className="fav-rating"><Star size={13} fill="#fbbf24" color="#fbbf24" /> {pro.rating || 0}</div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Payment History */}
      <section className="profile-section">
        <h2><CreditCard size={18} /> Payment History</h2>
        {dataLoading ? (
          <div style={{ textAlign: 'center', padding: '1rem' }}>
            <Loader size={24} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
          </div>
        ) : payments.length === 0 ? (
          <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)' }}>No payments yet</p>
        ) : (
          payments.slice(0, 5).map((p: any) => (
            <Card key={p.id} variant="default" padding="sm" className="payment-row">
              <div className="pay-info"><p className="pay-desc">{p.description || p.type}</p><p className="pay-date">{p.date || new Date(p.createdAt).toLocaleDateString()}</p></div>
              <span className="pay-amount">-${parseFloat(p.amount || 0).toFixed(2)}</span>
            </Card>
          ))
        )}
      </section>

      {/* Account Actions */}
      <section className="profile-section" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Button variant="danger" onClick={() => { logout(); navigate('/login'); }}>Cerrar Sesión</Button>
      </section>

      {/* Become Professional Modal */}
      <BecomeProfessionalModal
        isOpen={showBecomeProModal}
        onClose={() => setShowBecomeProModal(false)}
        onSuccess={refreshVerificationStatus}
      />
    </div>
  );
}
