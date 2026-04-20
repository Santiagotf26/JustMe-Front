import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, User, Phone, ArrowRight, ArrowLeft, Check, Sparkles, Heart, Scissors, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { LanguageToggle } from '../../components/ui';
import { Scene3D } from '../../components/three/Scene3D';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail, validatePassword, validateRequired, validatePhone, getPasswordStrength } from '../../utils/validators';
import './Register.css';

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  const steps = [
    t('register.step0'),
    t('register.step1'),
    t('register.step2')
  ];

  const { register } = useAuth();
  const { notify } = useNotification();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'user' | 'professional'>('user');
  const [form, setForm] = useState({ name: '', lastName: '', docType: 'CC', docNumber: '', phone: '', email: '', password: '', confirmPassword: '' });
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirmPwd, setShowConfirmPwd] = useState(false);
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
      case 'name': err = validateRequired(val, 'Nombre'); break;
      case 'lastName': err = validateRequired(val, 'Apellidos'); break;
      case 'docType': err = validateRequired(val, 'Tipo de documento'); break;
      case 'docNumber': err = validateRequired(val, 'Número de documento'); break;
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
      const fields = ['name', 'lastName', 'docType', 'docNumber', 'phone'];
      fields.forEach(f => { setTouched(prev => ({ ...prev, [f]: true })); validateField(f); });
      return fields.every(f => {
        const val = form[f as keyof typeof form];
        if (f === 'name') return !validateRequired(val, 'Nombre');
        if (f === 'lastName') return !validateRequired(val, 'Apellidos');
        if (f === 'docType') return !validateRequired(val, 'Tipo de documento');
        if (f === 'docNumber') return !validateRequired(val, 'Número de documento');
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
        lastName: form.lastName,
        docType: form.docType,
        docNumber: form.docNumber,
        email: form.email,
        password: form.password,
        phone: form.phone,
        role: role
      });

      const userRole = localStorage.getItem('justme_role') || role;
      notify('success', '¡Cuenta creada!', 'Bienvenido a JustMe.');
      navigate(userRole === 'admin' ? '/admin' : userRole === 'professional' ? '/professional' : '/user');
    } catch (err: any) {
      const status = err.response?.status;
      const msg = err.response?.data?.message;
      if (status === 409) {
        // Email duplicado: llevar al paso 2 y marcar el campo en rojo
        setStep(2);
        setTouched(prev => ({ ...prev, email: true }));
        setErrors(prev => ({ ...prev, email: 'Este correo ya está registrado' }));
      } else {
        notify('error', 'Error al registrarse', typeof msg === 'string' ? msg : 'No se pudo crear la cuenta.');
      }
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
            <h2>{t('register.title')}<br /><span className="text-gradient">JustMe</span></h2>
            <p>{t('register.subtitle')}</p>
          </motion.div>
        </div>
      </div>

      <motion.div className="login-form-side" initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
        <div className="login-form-container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Link to="/" className="login-back-brand">
              <span className="nav-logo-icon"><Sparkles size={20} /></span>
              <span className="nav-logo-text" style={{ color: 'var(--neutral-900)' }}>JustMe</span>
            </Link>
            <LanguageToggle size="sm" />
          </div>

          <h1>{t('register.createAcc')}</h1>
          <p className="login-subtitle">{t('register.createAccSub')}</p>

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
                  <p className="step-question">{t('register.question')}</p>
                  <div className="role-cards">
                    <motion.div className={`role-card ${role === 'user' ? 'role-card-active' : ''}`} onClick={() => setRole('user')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <span className="role-card-emoji"><Heart size={32} /></span>
                      <h3>{t('register.roleUserTitle')}</h3>
                      <p>{t('register.roleUserDesc')}</p>
                    </motion.div>
                    <motion.div className={`role-card ${role === 'professional' ? 'role-card-active' : ''}`} onClick={() => setRole('professional')} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <span className="role-card-emoji"><Scissors size={32} /></span>
                      <h3>{t('register.roleProTitle')}</h3>
                      <p>{t('register.roleProDesc')}</p>
                    </motion.div>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="register-step">
                  <div className="form-field">
                    <Input label={t('register.name')} icon={<User size={18} />} value={form.name} onChange={e => update('name', e.target.value)} onBlur={() => handleBlur('name')} className={touched.name && errors.name ? 'input-error' : ''} />
                    <AnimatePresence>
                      {touched.name && errors.name && (
                        <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                          <AlertCircle size={12} /> {errors.name}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="form-field">
                    <Input label={t('register.lastName')} icon={<User size={18} />} value={form.lastName} onChange={e => update('lastName', e.target.value)} onBlur={() => handleBlur('lastName')} className={touched.lastName && errors.lastName ? 'input-error' : ''} />
                    <AnimatePresence>
                      {touched.lastName && errors.lastName && (
                        <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                          <AlertCircle size={12} /> {errors.lastName}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  {/* Tipo de documento */}
                  <div className="form-field">
                    <label style={{ fontSize: 13, fontWeight: 600, color: 'var(--neutral-700)', display: 'block', marginBottom: 6 }}>Tipo de documento</label>
                    <select
                      value={form.docType}
                      onChange={e => update('docType', e.target.value)}
                      style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid var(--neutral-200)', background: 'var(--surface-primary)', color: 'var(--neutral-900)', fontSize: 14 }}
                    >
                      <option value="CC">Cédula de Ciudadanía (CC)</option>
                      <option value="CE">Cédula de Extranjería (CE)</option>
                      <option value="TI">Tarjeta de Identidad (TI)</option>
                      <option value="PP">Pasaporte (PP)</option>
                      <option value="NIT">NIT</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <Input label="Número de documento" icon={<User size={18} />} value={form.docNumber} onChange={e => update('docNumber', e.target.value)} onBlur={() => handleBlur('docNumber')} className={touched.docNumber && errors.docNumber ? 'input-error' : ''} />
                    <AnimatePresence>
                      {touched.docNumber && errors.docNumber && (
                        <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                          <AlertCircle size={12} /> {errors.docNumber}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="form-field">
                    <Input label={t('register.phone')} icon={<Phone size={18} />} type="tel" value={form.phone} onChange={e => update('phone', e.target.value)} onBlur={() => handleBlur('phone')} className={touched.phone && errors.phone ? 'input-error' : ''} />
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
                    <Input label={t('register.email')} icon={<Mail size={18} />} type="email" value={form.email} onChange={e => update('email', e.target.value)} onBlur={() => handleBlur('email')} className={touched.email && errors.email ? 'input-error' : ''} />
                    <AnimatePresence>
                      {touched.email && errors.email && (
                        <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                          <AlertCircle size={12} /> {errors.email}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                  <div className="form-field">
                    <Input
                      label={t('register.password')}
                      icon={<Lock size={18} />}
                      type={showPwd ? 'text' : 'password'}
                      iconRight={
                        <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
                          {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      }
                      value={form.password}
                      onChange={e => update('password', e.target.value)}
                      onBlur={() => handleBlur('password')}
                      className={touched.password && errors.password ? 'input-error' : ''}
                    />
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
                    <Input
                      label={t('register.confirmPassword')}
                      icon={<Lock size={18} />}
                      type={showConfirmPwd ? 'text' : 'password'}
                      iconRight={
                        <button type="button" onClick={() => setShowConfirmPwd(!showConfirmPwd)} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
                          {showConfirmPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      }
                      value={form.confirmPassword}
                      onChange={e => update('confirmPassword', e.target.value)}
                      onBlur={() => handleBlur('confirmPassword')}
                      className={touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}
                    />
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
                  {t('register.btnBack')}
                </Button>
              )}
              <Button type="submit" fullWidth={step === 0} loading={loading && step === 2} iconRight={step < 2 ? <ArrowRight size={18} /> : undefined}>
                {step < 2 ? t('register.btnContinue') : t('register.btnCreate')}
              </Button>
            </div>
          </form>

          <p className="login-signup">
            {t('register.hasAccount')} <Link to="/login">{t('register.signInLink')}</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
