import { motion } from 'framer-motion';
import { Camera, MapPin, Heart, CreditCard, Star, Edit3 } from 'lucide-react';
import { Card, Avatar, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { mockBookings, mockProfessionals, mockTransactions } from '../../data/mockData';
import './UserProfile.css';

export default function UserProfile() {
  const { user } = useAuth();
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
        <div className="stat-item"><span className="stat-val">{mockBookings.filter(b => b.status === 'completed').length}</span><span className="stat-label">Bookings</span></div>
        <div className="stat-item"><span className="stat-val">{favorites.length}</span><span className="stat-label">Favorites</span></div>
        <div className="stat-item"><span className="stat-val">{mockBookings.filter(b => b.status === 'completed').length}</span><span className="stat-label">Reviews</span></div>
      </div>

      {/* Addresses */}
      <section className="profile-section">
        <h2><MapPin size={18} /> Saved Addresses</h2>
        {user?.addresses.map((addr, i) => (
          <Card key={i} variant="default" padding="sm" className="addr-card">
            <Badge variant="primary" size="sm">{addr.label}</Badge>
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
    </div>
  );
}
