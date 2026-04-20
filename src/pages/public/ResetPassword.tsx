import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Key, Eye, EyeOff, ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { apiClient } from '../../services/api';
import './Login.css';

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState((location.state as any)?.email || '');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !token || !newPassword) { setError('Todos los campos son requeridos'); return; }
    if (newPassword.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return; }
    setError(null);
    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', { email, token, newPassword });
      setDone(true);
    } catch (err: any) {
      const msg = err.response?.data?.message;
      setError(typeof msg === 'string' ? msg : 'Código inválido o expirado.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-3d-side" style={{ background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)' }} />
      <motion.div
        className="login-form-side"
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="login-form-container">
          <Link to="/login" className="login-back-brand">
            <span className="nav-logo-icon"><Sparkles size={20} /></span>
            <span className="nav-logo-text" style={{ color: 'var(--neutral-900)' }}>JustMe</span>
          </Link>

          <h1>Nueva contraseña</h1>
          <p className="login-subtitle">
            Ingresa el código de 6 dígitos que enviamos a tu correo y escoge tu nueva contraseña.
          </p>

          <AnimatePresence mode="wait">
            {done ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--success-50, #f0fdf4)',
                  border: '1.5px solid var(--success-300, #86efac)',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle size={44} color="#22c55e" />
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 4 }}>
                    ¡Contraseña actualizada!
                  </p>
                  <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>
                    Ya puedes iniciar sesión con tu nueva contraseña.
                  </p>
                </div>
                <Button onClick={() => navigate('/login')} fullWidth iconRight={<ArrowRight size={18} />}>
                  Ir al login
                </Button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="login-form">
                <Input
                  label="Correo electrónico"
                  type="email"
                  icon={<Mail size={18} />}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />

                <Input
                  label="Código de verificación"
                  type="text"
                  icon={<Key size={18} />}
                  value={token}
                  onChange={e => setToken(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                />

                <Input
                  label="Nueva contraseña"
                  type={showPwd ? 'text' : 'password'}
                  icon={<Lock size={18} />}
                  iconRight={
                    <button type="button" onClick={() => setShowPwd(!showPwd)} style={{ display: 'flex', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit' }}>
                      {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  }
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="field-error"
                      style={{ background: 'var(--error-50)', padding: '10px 14px', borderRadius: '8px', display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--error-500)' }}
                      initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    >
                      <AlertCircle size={16} /> {error}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button type="submit" fullWidth loading={loading} size="lg" iconRight={<ArrowRight size={18} />}>
                  Cambiar contraseña
                </Button>

                <p style={{ textAlign: 'center', fontSize: 13, color: 'var(--neutral-500)' }}>
                  ¿No recibiste el código?{' '}
                  <Link to="/forgot-password" style={{ color: 'var(--primary-500)', fontWeight: 600 }}>
                    Reenviar
                  </Link>
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
