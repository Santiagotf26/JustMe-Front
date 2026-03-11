import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Sparkles, User, Scissors, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { Scene3D } from '../../components/three/Scene3D';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { validateEmail, validatePassword } from '../../utils/validators';
import './Login.css';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { notify } = useNotification();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [role, setRole] = useState<'user' | 'professional' | 'admin'>('user');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validate = () => {
    const emailErr = validateEmail(email);
    const pwdErr = validatePassword(password);
    const errs: typeof errors = {};
    if (emailErr) errs.email = emailErr;
    if (pwdErr) errs.password = pwdErr;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleBlur = (field: 'email' | 'password') => {
    setTouched(prev => ({ ...prev, [field]: true }));
    if (field === 'email') {
      const err = validateEmail(email);
      setErrors(prev => ({ ...prev, email: err || undefined }));
    } else {
      const err = validatePassword(password);
      setErrors(prev => ({ ...prev, password: err || undefined }));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!validate()) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 1200));
    login(role);
    notify('success', 'Welcome back!', 'You have been logged in successfully.');
    setLoading(false);
    if (role === 'admin') navigate('/admin');
    else if (role === 'professional') navigate('/professional');
    else navigate('/user');
  };

  return (
    <div className="login-page">
      {/* 3D Background */}
      <div className="login-3d-side">
        <Scene3D color1="#b91c1c" color2="#f59e0b" scale={2.5} distort={0.45} />
        <div className="login-3d-overlay" />
        <div className="login-3d-content">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            <h2>Welcome back to<br /><span className="text-gradient">JustMe</span></h2>
            <p>Your beauty, your terms.</p>
          </motion.div>
        </div>
      </div>

      {/* Form Side */}
      <motion.div
        className="login-form-side"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="login-form-container">
          <Link to="/" className="login-back-brand">
            <span className="nav-logo-icon"><Sparkles size={20} /></span>
            <span className="nav-logo-text" style={{ color: 'var(--neutral-900)' }}>JustMe</span>
          </Link>

          <h1>Sign in</h1>
          <p className="login-subtitle">Enter your credentials to access your account</p>

          {/* Role Selector */}
          <div className="role-selector">
            {(['user', 'professional', 'admin'] as const).map(r => (
              <motion.button
                key={r}
                className={`role-btn ${role === r ? 'role-btn-active' : ''}`}
                onClick={() => setRole(r)}
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {r === 'user' ? <><User size={16} /> Client</> : r === 'professional' ? <><Scissors size={16} /> Professional</> : <><ShieldCheck size={16} /> Admin</>}
              </motion.button>
            ))}
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-field">
              <Input
                label="Email address"
                type="email"
                icon={<Mail size={18} />}
                value={email}
                onChange={e => { setEmail(e.target.value); if (touched.email) { const err = validateEmail(e.target.value); setErrors(prev => ({ ...prev, email: err || undefined })); } }}
                onBlur={() => handleBlur('email')}
                className={touched.email && errors.email ? 'input-error' : ''}
              />
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
                label="Password"
                type={showPwd ? 'text' : 'password'}
                icon={<Lock size={18} />}
                iconRight={
                  <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                }
                value={password}
                onChange={e => { setPassword(e.target.value); if (touched.password) { const err = validatePassword(e.target.value); setErrors(prev => ({ ...prev, password: err || undefined })); } }}
                onBlur={() => handleBlur('password')}
                className={touched.password && errors.password ? 'input-error' : ''}
              />
              <AnimatePresence>
                {touched.password && errors.password && (
                  <motion.span className="field-error" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
                    <AlertCircle size={12} /> {errors.password}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>

            <div className="login-options">
              <label className="login-remember"><input type="checkbox" /> Remember me</label>
              <a href="#" className="login-forgot">Forgot password?</a>
            </div>
            <Button type="submit" fullWidth loading={loading} size="lg" iconRight={<ArrowRight size={18} />}>
              Sign In
            </Button>
          </form>

          <div className="login-divider"><span>or continue with</span></div>

          <div className="social-buttons">
            <button className="social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A10.99 10.99 0 0 0 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.99 10.99 0 0 0 1 12c0 1.78.43 3.46 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="social-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              Apple
            </button>
          </div>

          <p className="login-signup">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
