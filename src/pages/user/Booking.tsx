import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, Home, Building, Check, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button, Card } from '../../components/ui';
import { mockProfessionals } from '../../data/mockData';
import { useNotification } from '../../context/NotificationContext';
import './Booking.css';

const timeSlots = ['9:00 AM','10:00 AM','11:00 AM','12:00 PM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM','6:00 PM'];

const bookingSteps = ['Service', 'Date & Time', 'Location', 'Confirm'];

export default function Booking() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const pro = mockProfessionals.find(p => p.id === id) || mockProfessionals[0];

  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [locationType, setLocationType] = useState<'professional' | 'home'>('professional');
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const services = [
    { name: 'Basic Service', duration: '30 min', price: pro.price },
    { name: 'Standard Service', duration: '45 min', price: pro.price + 10 },
    { name: 'Premium Service', duration: '60 min', price: pro.price + 25 },
  ];

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() + i + 1);
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), date: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), value: d.toISOString().split('T')[0] };
  });

  const selectedSvc = services.find(s => s.name === selectedService);

  const handleConfirm = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 2000));
    setLoading(false);
    setConfirmed(true);
    notify('success', 'Booking confirmed!', `Your appointment with ${pro.name} has been confirmed.`);
  };

  if (confirmed) {
    return (
      <div className="booking-page">
        <motion.div className="booking-success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 300 }}>
          <motion.div className="success-check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}>
            <Check size={48} />
          </motion.div>
          <h2>Booking Confirmed!</h2>
          <p>Your appointment with {pro.name} has been scheduled.</p>
          <Card variant="glass" padding="md" className="booking-summary-card">
            <div className="summary-row"><Calendar size={16} /> <span>{selectedDate}</span></div>
            <div className="summary-row"><Clock size={16} /> <span>{selectedTime}</span></div>
            <div className="summary-row"><MapPin size={16} /> <span>{locationType === 'home' ? 'Home Service' : pro.location.address}</span></div>
          </Card>
          <div className="success-actions">
            <Button onClick={() => navigate('/user/appointments')}>View Appointments</Button>
            <Button variant="ghost" onClick={() => navigate('/user')}>Go Home</Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="booking-header">
        <button className="back-btn" onClick={() => step > 0 ? setStep(step - 1) : navigate(-1)}>
          <ArrowLeft size={20} />
        </button>
        <h1>Book with {pro.name}</h1>
      </div>

      {/* Progress */}
      <div className="booking-progress">
        {bookingSteps.map((s, i) => (
          <div key={s} className={`bp-step ${i <= step ? 'bp-active' : ''} ${i < step ? 'bp-done' : ''}`}>
            <div className="bp-dot">{i < step ? <Check size={12} /> : i + 1}</div>
            <span>{s}</span>
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Service */}
        {step === 0 && (
          <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="booking-step">
            <h2>Choose a service</h2>
            <div className="service-options">
              {services.map(svc => (
                <Card key={svc.name} variant={selectedService === svc.name ? 'glass' : 'outlined'} hover padding="md"
                  className={`svc-option ${selectedService === svc.name ? 'svc-selected' : ''}`}
                  onClick={() => setSelectedService(svc.name)}>
                  <div className="svc-option-info">
                    <h3>{svc.name}</h3>
                    <span className="svc-dur"><Clock size={13} /> {svc.duration}</span>
                  </div>
                  <span className="svc-price">${svc.price}</span>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 2: Date & Time */}
        {step === 1 && (
          <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="booking-step">
            <h2>Select date</h2>
            <div className="date-grid">
              {dates.map(d => (
                <button key={d.value} className={`date-chip ${selectedDate === d.value ? 'date-active' : ''}`}
                  onClick={() => setSelectedDate(d.value)}>
                  <span className="date-day">{d.label}</span>
                  <span className="date-num">{d.date}</span>
                </button>
              ))}
            </div>
            <h2>Select time</h2>
            <div className="time-grid">
              {timeSlots.map(t => (
                <button key={t} className={`time-chip ${selectedTime === t ? 'time-active' : ''}`}
                  onClick={() => setSelectedTime(t)}>
                  {t}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Step 3: Location */}
        {step === 2 && (
          <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="booking-step">
            <h2>Service location</h2>
            <div className="location-options">
              <Card variant={locationType === 'professional' ? 'glass' : 'outlined'} hover padding="md"
                className={`loc-option ${locationType === 'professional' ? 'loc-selected' : ''}`}
                onClick={() => setLocationType('professional')}>
                <Building size={24} />
                <div>
                  <h3>Visit Professional</h3>
                  <p>{pro.location.address}</p>
                </div>
              </Card>
              <Card variant={locationType === 'home' ? 'glass' : 'outlined'} hover padding="md"
                className={`loc-option ${locationType === 'home' ? 'loc-selected' : ''}`}
                onClick={() => setLocationType('home')}>
                <Home size={24} />
                <div>
                  <h3>Home Service</h3>
                  <p>Professional comes to your location</p>
                </div>
              </Card>
            </div>
          </motion.div>
        )}

        {/* Step 4: Confirm */}
        {step === 3 && (
          <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="booking-step">
            <h2>Confirm your booking</h2>
            <Card variant="glass" padding="lg" className="confirm-card">
              <div className="confirm-pro">
                <img src={pro.avatar} alt={pro.name} className="confirm-avatar" />
                <div><h3>{pro.name}</h3><p>{selectedService}</p></div>
              </div>
              <div className="confirm-details">
                <div className="confirm-row"><Calendar size={16} /> <span>{new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}</span></div>
                <div className="confirm-row"><Clock size={16} /> <span>{selectedTime}</span></div>
                <div className="confirm-row"><MapPin size={16} /> <span>{locationType === 'home' ? 'Home Service' : pro.location.address}</span></div>
              </div>
              <div className="confirm-price-row">
                <span>Estimated price</span>
                <span className="confirm-total">${selectedSvc?.price || pro.price}</span>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="booking-actions">
        {step > 0 && <Button variant="ghost" onClick={() => setStep(step - 1)} icon={<ArrowLeft size={18} />}>Back</Button>}
        {step < 3 ? (
          <Button onClick={() => setStep(step + 1)} iconRight={<ArrowRight size={18} />}
            disabled={(step === 0 && !selectedService) || (step === 1 && (!selectedDate || !selectedTime))}>
            Continue
          </Button>
        ) : (
          <Button onClick={handleConfirm} loading={loading} variant="accent" size="lg">
            Confirm Booking
          </Button>
        )}
      </div>
    </div>
  );
}
