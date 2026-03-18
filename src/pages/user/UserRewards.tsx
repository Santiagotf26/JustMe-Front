import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gift, Star, Copy, Check, Loader } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { userService } from '../../services/userService';
import { useNotification } from '../../context/NotificationContext';
import './UserRewards.css';

interface Coupon {
  id: string;
  code: string;
  discount: number;
  description: string;
  expiresAt: string;
}

export default function UserRewards() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoupons = async () => {
      setLoading(true);
      try {
        const data = await userService.getCoupons();
        setCoupons(Array.isArray(data) ? data : []);
      } catch {
        setCoupons([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCoupons();
  }, []);

  const handleCopy = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    notify('success', 'Copied!', `Coupon code ${code} copied to clipboard.`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="rewards-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  return (
    <div className="rewards-page">
      <div className="rewards-header">
        <h1>Rewards & Coupons</h1>
        <p>Earn rewards and use exclusive coupons on your next booking</p>
      </div>

      {/* Points Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="gradient" padding="lg" className="points-card">
          <div className="points-top">
            <div>
              <p className="points-label">Loyalty Points</p>
              <h2 className="points-value">{(user as any)?.loyaltyPoints || 0}</h2>
            </div>
            <Star size={32} opacity={0.4} />
          </div>
          <div className="points-progress">
            <div className="points-bar">
              <div className="points-fill" style={{ width: `${Math.min(((user as any)?.loyaltyPoints || 0) / 500 * 100, 100)}%` }} />
            </div>
            <p className="points-hint">Earn 500 points to unlock a premium reward</p>
          </div>
        </Card>
      </motion.div>

      {/* Coupons */}
      <section className="rewards-section">
        <h2><Gift size={18} /> Available Coupons</h2>
        {coupons.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 2rem', color: 'var(--neutral-400)' }}>
            <Gift size={48} style={{ opacity: 0.3, marginBottom: '12px' }} />
            <p>No coupons available at the moment</p>
            <p style={{ fontSize: 'var(--text-xs)' }}>Keep using JustMe to earn rewards!</p>
          </div>
        ) : (
          <div className="coupons-grid">
            {coupons.map((coupon, i) => (
              <motion.div
                key={coupon.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card variant="glass" padding="md" className="coupon-card">
                  <div className="coupon-discount">
                    <span className="coupon-pct">{coupon.discount}%</span>
                    <span className="coupon-off">OFF</span>
                  </div>
                  <div className="coupon-info">
                    <h3>{coupon.description}</h3>
                    <div className="coupon-code-row">
                      <code>{coupon.code}</code>
                      <button onClick={() => handleCopy(coupon.code, coupon.id)} className="coupon-copy-btn">
                        {copiedId === coupon.id ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    </div>
                    <p className="coupon-expires">
                      Expires: {new Date(coupon.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
