import { motion } from 'framer-motion';
import { Camera, MapPin, Heart, CreditCard, Star, Edit3 } from 'lucide-react';
import { Card, Avatar, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useBookings } from '../../hooks/useBookings';
import { mockProfessionals, mockTransactions } from '../../data/mockData';
import { useNavigate } from 'react-router-dom';
import './UserProfile.css';

export default function UserProfile() {
  const { user, switchRole, logout } = useAuth();
  const { bookings } = useBookings();
  const navigate = useNavigate();
  const favorites = mockProfessionals.slice(0, 3);
  const payments = mockTransactions.filter(t => t.type === 'payment').slice(0, 3);

  return (
    <div className="user-profile-page">
      {/* Profile Header */}
      <motion.div className="profile-header" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="profile-avatar-wrap">
          <Avatar src={user?.avatar} name={user?.name || 'User'} size="xl" />
          <button className="avatar-edit"><Camera size={14} /></button>
        </div>
        <h1>{user?.name}</h1>
        <p className="profile-email">{user?.email}</p>
        <p className="profile-phone">{user?.phone}</p>
        <Button variant="secondary" size="sm" icon={<Edit3 size={14} />}>Edit Profile</Button>
      </motion.div>

      {/* Stats */}
      <div className="profile-stats">
        <div className="stat-item"><span className="stat-val">{bookings.filter(b => b.status === 'completed').length}</span><span className="stat-label">Bookings</span></div>
        <div className="stat-item"><span className="stat-val">{favorites.length}</span><span className="stat-label">Favorites</span></div>
        <div className="stat-item"><span className="stat-val">{bookings.filter(b => b.status === 'completed').length}</span><span className="stat-label">Reviews</span></div>
      </div>

      {user?.role === 'user' && (
        <div style={{ marginBottom: 'var(--space-4)' }} className="mt-4 mb-4">
          <Card variant="gradient" padding="md" className="become-pro-cta">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 'var(--text-lg)', color: 'var(--neutral-0)' }}>Become a Professional</h3>
                <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'rgba(255,255,255,0.8)' }}>Offer your services and start earning today.</p>
              </div>
              <Button size="sm" variant="primary" onClick={() => { switchRole('professional'); navigate('/professional'); }}>
                Get Started
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Addresses */}
      <section className="profile-section">
        <h2><MapPin size={18} /> Saved Addresses</h2>
        {user?.addresses?.map((addr: any, i: number) => (
          <Card key={i} variant="default" padding="sm" className="addr-card">
            <Badge variant="primary" size="sm">{addr.label || addr.title || 'Address'}</Badge>
            <p>{addr.address}</p>
          </Card>
        ))}
        <Button variant="ghost" size="sm">+ Add Address</Button>
      </section>

      {/* Favorites */}
      <section className="profile-section">
        <h2><Heart size={18} /> Favorite Professionals</h2>
        <div className="favorites-list">
          {favorites.map(pro => (
            <Card key={pro.id} variant="default" padding="sm" hover className="fav-card">
              <Avatar src={pro.avatar} name={pro.name} size="sm" />
              <div className="fav-info"><p className="fav-name">{pro.name}</p><p className="fav-svc">{pro.services[0]}</p></div>
              <div className="fav-rating"><Star size={13} fill="#fbbf24" color="#fbbf24" /> {pro.rating}</div>
            </Card>
          ))}
        </div>
      </section>

      {/* Payment History */}
      <section className="profile-section">
        <h2><CreditCard size={18} /> Payment History</h2>
        {payments.map(p => (
          <Card key={p.id} variant="default" padding="sm" className="payment-row">
            <div className="pay-info"><p className="pay-desc">{p.description}</p><p className="pay-date">{p.date}</p></div>
            <span className="pay-amount">-${p.amount}</span>
          </Card>
        ))}
      </section>

      {/* Account Actions */}
      <section className="profile-section" style={{ marginTop: '2rem', textAlign: 'center' }}>
        <Button variant="danger" onClick={() => { logout(); navigate('/login'); }}>Cerrar Sesión</Button>
      </section>
    </div>
  );
}
