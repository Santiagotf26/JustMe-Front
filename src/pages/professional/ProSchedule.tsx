import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Save, Trash2, Plus, Loader as LoaderIcon } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { professionalsService } from '../../services/professionalsService';
import './ProSchedule.css';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

interface ScheduleData {
  activeDays: Record<string, boolean>;
  dayTimes: Record<string, { start: string; end: string }>;
  breaks: { name: string; start: string; end: string }[];
  maxAppointments: number;
  bufferTime: number;
  advanceNotice: number;
}

export default function ProSchedule() {
  const { notify } = useNotification();
  const { professionalId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [schedule, setSchedule] = useState<ScheduleData>({
    activeDays: { Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: true, Sunday: false },
    dayTimes: Object.fromEntries(daysOfWeek.map(d => [d, { start: '09:00', end: '18:00' }])),
    breaks: [{ name: 'Lunch Break', start: '13:00', end: '14:00' }],
    maxAppointments: 8,
    bufferTime: 15,
    advanceNotice: 2,
  });

  // Load schedule from backend
  useEffect(() => {
    if (!professionalId) { setLoading(false); return; }
    professionalsService.getProfessionalById(professionalId)
      .then(data => {
        if (data?.schedule) {
          setSchedule(prev => ({ ...prev, ...data.schedule }));
        }
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [professionalId]);

  const toggleDay = (day: string) => setSchedule(prev => ({
    ...prev,
    activeDays: { ...prev.activeDays, [day]: !prev.activeDays[day] }
  }));

  const updateDayTime = (day: string, field: 'start' | 'end', value: string) => setSchedule(prev => ({
    ...prev,
    dayTimes: { ...prev.dayTimes, [day]: { ...prev.dayTimes[day], [field]: value } }
  }));

  const updateBreak = (idx: number, field: 'start' | 'end', value: string) => {
    setSchedule(prev => ({
      ...prev,
      breaks: prev.breaks.map((b, i) => i === idx ? { ...b, [field]: value } : b)
    }));
  };

  const removeBreak = (idx: number) => {
    setSchedule(prev => ({ ...prev, breaks: prev.breaks.filter((_, i) => i !== idx) }));
  };

  const addBreak = () => {
    setSchedule(prev => ({
      ...prev,
      breaks: [...prev.breaks, { name: 'New Break', start: '15:00', end: '15:30' }]
    }));
  };

  const handleSave = async () => {
    if (!professionalId) return;
    setSaving(true);
    try {
      await professionalsService.updateProfile(professionalId, { schedule } as any);
      notify('success', 'Schedule Updated', 'Your availability settings have been saved.');
    } catch (err: any) {
      notify('error', 'Error', err?.response?.data?.message || 'Failed to save schedule');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="pro-schedule" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <LoaderIcon size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

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
                <div key={day} className={`ps-day-row ${!schedule.activeDays[day] ? 'ps-day-off' : ''}`}>
                  <label className="ps-toggle">
                    <input type="checkbox" checked={schedule.activeDays[day]} onChange={() => toggleDay(day)} />
                    <span className="ps-slider"></span>
                  </label>
                  <span className="ps-day-name">{day}</span>
                  {schedule.activeDays[day] ? (
                    <div className="ps-time-inputs">
                      <input type="time" value={schedule.dayTimes[day]?.start || '09:00'} onChange={e => updateDayTime(day, 'start', e.target.value)} />
                      <span>to</span>
                      <input type="time" value={schedule.dayTimes[day]?.end || '18:00'} onChange={e => updateDayTime(day, 'end', e.target.value)} />
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
              <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addBreak}>Add Break</Button>
            </div>
            <div className="ps-breaks-list">
              {schedule.breaks.map((brk, idx) => (
                <div key={idx} className="ps-break-row">
                  <span className="ps-break-name">{brk.name}</span>
                  <div className="ps-time-inputs">
                    <input type="time" value={brk.start} onChange={e => updateBreak(idx, 'start', e.target.value)} />
                    <span>to</span>
                    <input type="time" value={brk.end} onChange={e => updateBreak(idx, 'end', e.target.value)} />
                  </div>
                  <button className="ps-btn-delete" onClick={() => removeBreak(idx)}><Trash2 size={16} /></button>
                </div>
              ))}
              {schedule.breaks.length === 0 && (
                <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-3)' }}>No breaks configured</p>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ps-right">
          <Card variant="default" padding="lg" className="ps-settings-card">
            <h2 className="ps-card-title">Booking Preferences</h2>

            <div className="ps-form-group">
              <label>Maximum Daily Appointments</label>
              <input type="number" value={schedule.maxAppointments} min={1} max={20} onChange={e => setSchedule(prev => ({ ...prev, maxAppointments: parseInt(e.target.value) || 8 }))} />
              <p className="ps-help-text">Stop accepting bookings after this limit is reached</p>
            </div>

            <div className="ps-form-group">
              <label>Buffer Time Between Appointments</label>
              <select value={String(schedule.bufferTime)} onChange={e => setSchedule(prev => ({ ...prev, bufferTime: parseInt(e.target.value) }))}>
                <option value="0">No buffer</option>
                <option value="10">10 minutes</option>
                <option value="15">15 minutes</option>
                <option value="30">30 minutes</option>
              </select>
            </div>

            <div className="ps-form-group">
              <label>Minimum Advance Notice</label>
              <select value={String(schedule.advanceNotice)} onChange={e => setSchedule(prev => ({ ...prev, advanceNotice: parseInt(e.target.value) }))}>
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

          <Button className="ps-save-btn" onClick={handleSave} icon={<Save size={18} />} loading={saving}>
            Save Schedule Configuration
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
