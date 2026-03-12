import { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Save, Trash2, Plus } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { useNotification } from '../../context/NotificationContext';
import './ProSchedule.css';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ProSchedule() {
  const { notify } = useNotification();
  const [activeDays, setActiveDays] = useState<Record<string, boolean>>({
    Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: true, Sunday: false
  });

  const toggleDay = (day: string) => setActiveDays(prev => ({ ...prev, [day]: !prev[day] }));

  const handleSave = () => {
    notify('success', 'Schedule Updated', 'Your availability settings have been saved.');
  };

  return (
    <div className="pro-schedule">
      <div className="ps-header">
        <h1>Schedule Configuration</h1>
        <p>Set your working hours to control when clients can book you</p>
      </div>

      <div className="ps-content">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ps-left">
          <Card variant="default" padding="lg">
            <h2 className="ps-card-title"><Calendar size={18} /> Working Days</h2>
            <div className="ps-days-list">
              {daysOfWeek.map(day => (
                <div key={day} className={`ps-day-row ${!activeDays[day] ? 'ps-day-off' : ''}`}>
                  <label className="ps-toggle">
                    <input type="checkbox" checked={activeDays[day]} onChange={() => toggleDay(day)} />
                    <span className="ps-slider"></span>
                  </label>
                  <span className="ps-day-name">{day}</span>
                  {activeDays[day] ? (
                    <div className="ps-time-inputs">
                      <input type="time" defaultValue="09:00" />
                      <span>to</span>
                      <input type="time" defaultValue="18:00" />
                    </div>
                  ) : (
                    <span className="ps-closed-lbl">Off</span>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <Card variant="default" padding="lg" className="mt-4">
            <div className="ps-card-header">
              <h2 className="ps-card-title"><Clock size={18} /> Breaks & Blocked Time</h2>
              <Button size="sm" variant="secondary" icon={<Plus size={14} />}>Add Break</Button>
            </div>
            <div className="ps-breaks-list">
              <div className="ps-break-row">
                <span className="ps-break-name">Lunch Break (All active days)</span>
                <div className="ps-time-inputs">
                  <input type="time" defaultValue="13:00" />
                  <span>to</span>
                  <input type="time" defaultValue="14:00" />
                </div>
                <button className="ps-btn-delete"><Trash2 size={16} /></button>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ps-right">
          <Card variant="default" padding="lg" className="ps-settings-card">
            <h2 className="ps-card-title">Booking Preferences</h2>
            
            <div className="ps-form-group">
              <label>Maximum Daily Appointments</label>
              <input type="number" defaultValue={8} min={1} max={20} />
              <p className="ps-help-text">Stop accepting bookings after this limit is reached</p>
            </div>

            <div className="ps-form-group">
              <label>Buffer Time Between Appointments</label>
              <select defaultValue="15">
                <option value="0">No buffer</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>

            <div className="ps-form-group">
              <label>Minimum Advance Notice</label>
              <select defaultValue="2">
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
              </select>
              <p className="ps-help-text">How much lead time you need before a booking</p>
            </div>
          </Card>

          <Card variant="glass" padding="md" className="ps-info-card">
            <h3><Badge variant="primary" size="sm">Auto-Booking Active</Badge></h3>
            <p>Clients are automatically confirmed if they book within an available slot that doesn't conflict with your schedule.</p>
          </Card>

          <Button className="ps-save-btn" onClick={handleSave} icon={<Save size={18} />}>
            Save Schedule Configuration
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
