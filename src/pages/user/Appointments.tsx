import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Tabs, Card, Avatar, Badge, Button } from '../../components/ui';
import { mockBookings } from '../../data/mockData';
import './Appointments.css';

export default function Appointments() {
  const [activeTab, setActiveTab] = useState('upcoming');
  const upcoming = mockBookings.filter(b => b.status === 'pending' || b.status === 'confirmed');
  const past = mockBookings.filter(b => b.status === 'completed' || b.status === 'cancelled');
  const list = activeTab === 'upcoming' ? upcoming : past;

  const statusColors: Record<string, 'primary' | 'success' | 'warning' | 'error'> = {
    pending: 'warning', confirmed: 'primary', completed: 'success', cancelled: 'error',
  };

  return (
    <div className="appointments-page">
      <h1>My Appointments</h1>
      <Tabs tabs={[{ id: 'upcoming', label: `Upcoming (${upcoming.length})` }, { id: 'past', label: `Past (${past.length})` }]} onChange={setActiveTab} />

      <div className="appointments-list">
        {list.length === 0 ? (
          <div className="empty-state"><Calendar size={48} /><p>No {activeTab} appointments</p></div>
        ) : (list.map((b, i) => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
            <Card variant="default" padding="md" hover className="appointment-card">
              <div className="appt-top">
                <Avatar src={b.professionalAvatar} name={b.professionalName} size="md" />
                <div className="appt-info">
                  <h3>{b.professionalName}</h3>
                  <p className="appt-service">{b.service}</p>
                </div>
                <Badge variant={statusColors[b.status]} size="md">{b.status}</Badge>
              </div>
              <div className="appt-details">
                <span><Calendar size={14} /> {new Date(b.date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
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
