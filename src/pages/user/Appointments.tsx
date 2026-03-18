import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin, Loader } from 'lucide-react';
import { Tabs, Card, Avatar, Badge, Button } from '../../components/ui';
import { useBookings } from '../../hooks/useBookings';
import './Appointments.css';

export default function Appointments() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const { bookings, loading } = useBookings();

  const upcoming = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const past = bookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const list = activeTab === 'upcoming' ? upcoming : past;

  const statusColors: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
    pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'error',
  };

  if (loading) {
    return (
      <div className="appointments-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  return (
    <div className="appointments-page">
      <h1>My Appointments</h1>
      <Tabs tabs={[{ id: 'upcoming', label: `Upcoming (${upcoming.length})` }, { id: 'past', label: `Past (${past.length})` }]} onChange={setActiveTab} />

      <div className="appointments-list">
        {list.length === 0 ? (
          <div className="empty-state">
            <Calendar size={48} style={{ color: 'var(--neutral-300)', marginBottom: '16px' }} />
            <p>No {activeTab} appointments</p>
          </div>
        ) : (list.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card variant="default" padding="md" hover className="appointment-card">
              <div className="appt-top">
                <Avatar src={b.professionalAvatar} name={b.professionalName} size="md" />
                <div className="appt-info">
                  <h3>{b.professionalName}</h3>
                  <p className="appt-service">{b.service}</p>
                </div>
                <Badge variant={statusColors[b.status] || 'primary'} size="md">{b.status}</Badge>
              </div>
              <div className="appt-details">
                {b.date && <span><Calendar size={14} /> {new Date(b.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>}
                <span><Clock size={14} /> {b.time}</span>
                <span><MapPin size={14} /> {b.locationType === 'home' ? 'Home' : 'Professional'}</span>
              </div>
              <div className="appt-bottom">
                <span className="appt-price">${b.price}</span>
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <div className="appt-actions">
                    <Button size="sm" variant="ghost">Reschedule</Button>
                    <Button size="sm" variant="danger">Cancel</Button>
                  </div>
                )}
                {b.status === 'completed' && <Button size="sm" variant="secondary">Leave Review</Button>}
              </div>
            </Card>
          </motion.div>
        )))}
      </div>
    </div>
  );
}
