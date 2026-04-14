import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Calendar, Save, Trash2, Plus, Loader as LoaderIcon } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { professionalsService } from '../../services/professionalsService';
import { useTranslation } from 'react-i18next';
import './ProSchedule.css';

export default function ProSchedule() {
  const { t } = useTranslation();
  const englishDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const dayKeys: Record<string, string> = {
    Monday: 'monday',
    Tuesday: 'tuesday',
    Wednesday: 'wednesday',
    Thursday: 'thursday',
    Friday: 'friday',
    Saturday: 'saturday',
    Sunday: 'sunday'
  };

  const { notify } = useNotification();
  const { professionalId } = useAuth();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [schedule, setSchedule] = useState<any>({
    activeDays: { Monday: true, Tuesday: true, Wednesday: true, Thursday: true, Friday: true, Saturday: true, Sunday: false },
    dayTimes: {
      Monday: { start: '09:00', end: '18:00' },
      Tuesday: { start: '09:00', end: '18:00' },
      Wednesday: { start: '09:00', end: '18:00' },
      Thursday: { start: '09:00', end: '18:00' },
      Friday: { start: '09:00', end: '18:00' },
      Saturday: { start: '09:00', end: '18:00' },
      Sunday: { start: '09:00', end: '18:00' },
    },
    breaks: [{ name: t('proSchedule.lunchBreak'), start: '13:00', end: '14:00' }],
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
          setSchedule((prev: any) => ({ ...prev, ...data.schedule }));
        }
      })
      .catch(console.warn)
      .finally(() => setLoading(false));
  }, [professionalId]);

  const toggleDay = (engDay: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      activeDays: { ...prev.activeDays, [engDay]: !prev.activeDays[engDay] }
    }));
  };

  const updateDayTime = (engDay: string, field: 'start' | 'end', value: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      dayTimes: { ...prev.dayTimes, [engDay]: { ...prev.dayTimes[engDay], [field]: value } }
    }));
  };

  const updateBreak = (idx: number, field: 'start' | 'end', value: string) => {
    setSchedule((prev: any) => ({
      ...prev,
      breaks: prev.breaks.map((b: any, i: number) => i === idx ? { ...b, [field]: value } : b)
    }));
  };

  const removeBreak = (idx: number) => {
    setSchedule((prev: any) => ({ ...prev, breaks: prev.breaks.filter((_: any, i: number) => i !== idx) }));
  };

  const addBreak = () => {
    setSchedule((prev: any) => ({
      ...prev,
      breaks: [...prev.breaks, { name: t('proSchedule.newBreak'), start: '15:00', end: '15:30' }]
    }));
  };

  const handleSave = async () => {
    if (!professionalId) return;
    setSaving(true);
    try {
      await professionalsService.updateProfile(professionalId, { schedule } as any);
      notify('success', t('proSchedule.success'), t('proSchedule.successMsg'));
    } catch (err: any) {
      notify('error', t('proSchedule.error'), err?.response?.data?.message || t('proSchedule.errorMsg'));
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
        <h1>{t('proSchedule.title')}</h1>
        <p>{t('proSchedule.subtitle')}</p>
      </div>

      <div className="ps-content">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="ps-left">
          <Card variant="default" padding="lg">
            <h2 className="ps-card-title"><Calendar size={18} /> {t('proSchedule.workingDays.title')}</h2>
            <div className="ps-days-list">
              {englishDays.map((engDay) => {
                const isActive = schedule.activeDays[engDay];
                const dayLabel = t(`proSchedule.workingDays.${dayKeys[engDay]}`);
                return (
                  <div key={engDay} className={`ps-day-row ${!isActive ? 'ps-day-off' : ''}`}>
                    <label className="ps-toggle">
                      <input type="checkbox" checked={isActive} onChange={() => toggleDay(engDay)} />
                      <span className="ps-slider"></span>
                    </label>
                    <span className="ps-day-name">{dayLabel}</span>
                    {isActive ? (
                      <div className="ps-time-inputs">
                        <input type="time" value={schedule.dayTimes[engDay]?.start || '09:00'} onChange={e => updateDayTime(engDay, 'start', e.target.value)} />
                        <span>{t('proSchedule.to')}</span>
                        <input type="time" value={schedule.dayTimes[engDay]?.end || '18:00'} onChange={e => updateDayTime(engDay, 'end', e.target.value)} />
                      </div>
                    ) : (
                      <span className="ps-closed-lbl">{t('proSchedule.off')}</span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          <Card variant="default" padding="lg" className="mt-4">
            <div className="ps-card-header">
              <h2 className="ps-card-title"><Clock size={18} /> {t('proSchedule.breaks')}</h2>
              <Button size="sm" variant="secondary" icon={<Plus size={14} />} onClick={addBreak}>{t('proSchedule.addBreak')}</Button>
            </div>
            <div className="ps-breaks-list">
              {schedule.breaks.map((brk: any, idx: number) => (
                <div key={idx} className="ps-break-row">
                  <span className="ps-break-name">{brk.name}</span>
                  <div className="ps-time-inputs">
                    <input type="time" value={brk.start} onChange={e => updateBreak(idx, 'start', e.target.value)} />
                    <span>{t('proSchedule.to')}</span>
                    <input type="time" value={brk.end} onChange={e => updateBreak(idx, 'end', e.target.value)} />
                  </div>
                  <button className="ps-btn-delete" onClick={() => removeBreak(idx)}><Trash2 size={16} /></button>
                </div>
              ))}
              {schedule.breaks.length === 0 && (
                <p style={{ color: 'var(--neutral-400)', fontSize: 'var(--text-sm)', textAlign: 'center', padding: 'var(--space-3)' }}>{t('proSchedule.noBreaks')}</p>
              )}
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="ps-right">
          <Card variant="default" padding="lg" className="ps-settings-card">
            <h2 className="ps-card-title">{t('proSchedule.preferences')}</h2>

            <div className="ps-form-group">
              <label>{t('proSchedule.maxAppts')}</label>
              <input type="number" value={schedule.maxAppointments} min={1} max={20} onChange={e => setSchedule((prev: any) => ({ ...prev, maxAppointments: parseInt(e.target.value) || 8 }))} />
              <p className="ps-help-text">{t('proSchedule.stopMsg')}</p>
            </div>

            <div className="ps-form-group">
              <label>{t('proSchedule.buffer')}</label>
              <select value={String(schedule.bufferTime)} onChange={e => setSchedule((prev: any) => ({ ...prev, bufferTime: parseInt(e.target.value) }))}>
                <option value="0">{t('proSchedule.noBuffer')}</option>
                <option value="10">10 {t('proSchedule.minutes')}</option>
                <option value="15">15 {t('proSchedule.minutes')}</option>
                <option value="30">30 {t('proSchedule.minutes')}</option>
              </select>
            </div>

            <div className="ps-form-group">
              <label>{t('proSchedule.advance')}</label>
              <select value={String(schedule.advanceNotice)} onChange={e => setSchedule((prev: any) => ({ ...prev, advanceNotice: parseInt(e.target.value) }))}>
                <option value="1">1 {t('proSchedule.hours')}</option>
                <option value="2">2 {t('proSchedule.hours')}</option>
                <option value="12">12 {t('proSchedule.hours')}</option>
                <option value="24">24 {t('proSchedule.hours')}</option>
              </select>
              <p className="ps-help-text">{t('proSchedule.advanceHelp')}</p>
            </div>
          </Card>

          <Card variant="glass" padding="md" className="ps-info-card">
            <h3><Badge variant="primary" size="sm">{t('proSchedule.autoBooking')}</Badge></h3>
            <p>{t('proSchedule.autoBookingMsg')}</p>
          </Card>

          <Button className="ps-save-btn" onClick={handleSave} icon={<Save size={18} />} loading={saving}>
            {t('proSchedule.saveBtn')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
