import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Sparkles, AlertCircle, CheckCircle } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { apiClient } from '../../services/api';
import './Login.css';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Ingresa tu correo electrónico'); return; }
    setError(null);
    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      setSent(true);
    } catch {
      setError('Ocurrió un error. Intenta nuevamente.');
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

          <h1>Recuperar contraseña</h1>
          <p className="login-subtitle">
            Ingresa tu correo y te enviaremos un código de verificación.
          </p>

          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'var(--success-50, #f0fdf4)',
                  border: '1.5px solid var(--success-300, #86efac)',
                  borderRadius: '12px',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                <CheckCircle size={40} color="#22c55e" />
                <div>
                  <p style={{ fontWeight: 700, color: 'var(--neutral-900)', marginBottom: 4 }}>
                    ¡Revisa tu correo!
                  </p>
                  <p style={{ color: 'var(--neutral-500)', fontSize: 14 }}>
                    Si el correo está registrado, recibirás un código de 6 dígitos en los próximos minutos.
                  </p>
                </div>
                <Button
                  onClick={() => navigate('/reset-password', { state: { email } })}
                  fullWidth
                  iconRight={<ArrowRight size={18} />}
                >
                  Ingresar el código
                </Button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="login-form">
                <div className="form-field">
                  <Input
                    label="Correo electrónico"
                    type="email"
                    icon={<Mail size={18} />}
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>

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
                  Enviar código
                </Button>
              </motion.form>
            )}
          </AnimatePresence>

          <p className="login-signup">
            ¿Recordaste tu contraseña? <Link to="/login">Iniciar sesión</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
