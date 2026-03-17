import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Check, Sparkles, Heart, Scissors, AlertCircle } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { Scene3D } from '../../components/three/Scene3D';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail, validatePassword, validateRequired, validatePhone, getPasswordStrength } from '../../utils/validators';
import './Register.css';

const steps = ['Account Type', 'Basic Info', 'Credentials'];

export default function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const { notify } = useNotification();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'user' | 'professional'>('user');
  const [form, setForm] = useState({ name: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const update = (key: string, val: string) => {
    setForm(prev => ({ ...prev, [key]: val }));
    if (touched[key]) validateField(key, val);
  };

  const validateField = (key: string, value?: string) => {
    const val = value ?? form[key as keyof typeof form];
    let err: string | null = null;
    switch (key) {
      case 'name': err = validateRequired(val, 'Full name'); break;
      case 'phone': err = validatePhone(val); break;
      case 'email': err = validateEmail(val); break;
      case 'password': err = validatePassword(val); break;
      case 'confirmPassword':
        err = val !== form.password ? 'Passwords do not match' : null;
        break;
    }
    setErrors(prev => ({ ...prev, [key]: err || undefined }));
    return !err;
  };

  const handleBlur = (key: string) => {
    setTouched(prev => ({ ...prev, [key]: true }));
    validateField(key);
  };

  const validateStep = (): boolean => {
    if (step === 0) return true;
    if (step === 1) {
      const fields = ['name', 'phone'];
      fields.forEach(f => { setTouched(prev => ({ ...prev, [f]: true })); validateField(f); });
      return fields.every(f => {
        const val = form[f as keyof typeof form];
        if (f === 'name') return !validateRequired(val, 'Full name');
        if (f === 'phone') return !validatePhone(val);
        return true;
      });
    }
    if (step === 2) {
      const fields = ['email', 'password', 'confirmPassword'];
      fields.forEach(f => { setTouched(prev => ({ ...prev, [f]: true })); validateField(f); });
      return fields.every(f => {
        const val = form[f as keyof typeof form];
        if (f === 'email') return !validateEmail(val);
        if (f === 'password') return !validatePassword(val);
        if (f === 'confirmPassword') return val === form.password;
        return true;
      });
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep()) return;
    if (step < 2) { setStep(step + 1); return; }

    setLoading(true);
    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: role
      });
      notify('success', 'Account created!', 'Welcome to JustMe. Let\'s get started.');
      navigate(role === 'professional' ? '/professional' : '/user');
    } catch (err: any) {
      notify('error', 'Registration failed', err.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const pwdStrength = getPasswordStrength(form.password);

  return (
    <div className="register-page">
      <div className="register-3d-side">
        <Scene3D color1="#f59e0b" color2="#dc2626" scale={2.2} distort={0.4} />
        <div className="login-3d-overlay" />
        <div className="login-3d-content">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <h2>Join the<br /><span className="text-gradient">revolution</span></h2>
            <p>Start your beauty journey today.</p>
          </motion.div>
        </div>
      </div>

      <motion.div className="login-form-side" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <div className="login-form-container">
          <Link to="/" className="login-back-brand">
            <span className="nav-logo-icon"><Sparkles size={20} /></span>
            <span className="nav-logo-text" style={{ color: 'var(--neutral-900)' }}>JustMe</span>
          </Link>

          <h1>Create account</h1>
          <p className="login-subtitle">Start booking or offering beauty services</p>

          {/* Progress */}
          <div className="register-progress">
            {steps.map((s, i) => (
              <div key={s} className={`progress-step ${i <= step ? 'progress-active' : ''} ${i < step ? 'progress-done' : ''}`}>
                <div className="progress-dot">
                  {i < step ? <Check size={12} /> : <span>{i + 1}</span>}
                </div>
                <span className="progress-label">{s}</span>
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="register-step">
                  <p className="step-question">How will you use JustMe?</p>
                  <div className="role-cards">
                    <motion.div className={`role-card ${role === 'user' ? 'role-card-active' : ''}`} onClick={() => setRole('user')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <span className="role-card-emoji"><Heart size={32} /></span>
                      <h3>I want to book services</h3>
                      <p>Find and book beauty professionals near you</p>
                    </motion.div>
                    <motion.div className={`role-card ${role === 'professional' ? 'role-card-active' : ''}`} onClick={() => setRole('professional')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <span className="role-card-emoji"><Scissors size={32} /></span>
                      <h3>I'm a professional</h3>
                      <p>Offer your beauty services and grow your business</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="register-step">
                  <div className="form-field">
                    <Input label="Full name" icon={<User size={18} />} value={form.name} onChange={e => update('name', e.target.value)} onBlur={() => handleBlur('name')} className={touched.name && errors.name ? 'input-error' : ''} />
                    <AnimatePresence>
                      {touched.name && errors.name && (
                        <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                          <AlertCircle size={12} /> {errors.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="form-field">
                    <Input label="Phone number" icon={<Phone size={18} />} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} onBlur={() => handleBlur('phone')} className={touched.phone && errors.phone ? 'input-error' : ''} />
                    <AnimatePresence>
                      {touched.phone && errors.phone && (
                        <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                          <AlertCircle size={12} /> {errors.phone}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="register-step">
                  <div className="form-field">
                    <Input label="Email address" icon={<Mail size={18} />} type="email" value={form.email} onChange={e => update('email', e.target.value)} onBlur={() => handleBlur('email')} className={touched.email && errors.email ? 'input-error' : ''} />
                    <AnimatePresence>
                      {touched.email && errors.email && (
                        <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                          <AlertCircle size={12} /> {errors.email}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="form-field">
                    <Input label="Password" icon={<Lock size={18} />} type="password" value={form.password} onChange={e => update('password', e.target.value)} onBlur={() => handleBlur('password')} className={touched.password && errors.password ? 'input-error' : ''} />
                    {form.password && (
                      <div className="pwd-strength">
                        <div className="pwd-strength-bar">
                          <div className="pwd-strength-fill" style={{ width: `${(pwdStrength.score / 5) * 100}%`, background: pwdStrength.color }} />
                        </div>
                        <span className="pwd-strength-label" style={{ color: pwdStrength.color }}>{pwdStrength.label}</span>
                      </div>
                    )}
                    <AnimatePresence>
                      {touched.password && errors.password && (
                        <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                          <AlertCircle size={12} /> {errors.password}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="form-field">
                    <Input label="Confirm password" icon={<Lock size={18} />} type="password" value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)} onBlur={() => handleBlur('confirmPassword')} className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''} />
                    <AnimatePresence>
                      {touched.confirmPassword && errors.confirmPassword && (
                        <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                          <AlertCircle size={12} /> {errors.confirmPassword}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="register-actions">
              {step > 0 && (
                <Button type="button" variant="ghost" onClick={() => setStep(step - 1)} icon={<ArrowLeft size={18} />}>
                  Back
                </Button>
              )}
              <Button type="submit" fullWidth={step === 0} loading={loading && step === 2} iconRight={step < 2 ? <ArrowRight size={18} /> : undefined}>
                {step < 2 ? 'Continue' : 'Create Account'}
              </Button>
            </div>
          </form>

          <p className="login-signup">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
