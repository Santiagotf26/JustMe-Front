import { motion } from 'framer-motion';
import { Gift, Copy, CheckCircle, Star } from 'lucide-react';
import { useState } from 'react';
import { Card, Button, Badge } from '../../components/ui';
import { useNotification } from '../../context/NotificationContext';
import { mockCoupons, mockCurrentUser, type Coupon } from '../../data/mockData';
import './UserRewards.css';

export default function UserRewards() {
  const { notify } = useNotification();
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  
  const points = mockCurrentUser.loyaltyPoints || 350;
  const nextMilestone = 500;
  const progressPercent = Math.min((points / nextMilestone) * 100, 100);

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    notify('success', 'Code copied!', `Coupon code ${code} copied to clipboard.`);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="user-rewards">
      <div className="ur-header">
        <h1>Loyalty & Rewards</h1>
        <p>Earn points with every completed service</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="gradient" padding="lg" className="points-card">
          <div className="ur-top">
            <div className="ur-points-info">
              <span className="ur-pts-val">{points}</span>
              <span className="ur-pts-lbl">Total Points</span>
            </div>
            <Star size={40} className="ur-pts-icon" fill="rgba(255,255,255,0.2)" />
          </div>

          <div className="ur-progress-box">
            <div className="ur-prog-text">
              <span>Next Reward: 15% OFF Coupon</span>
              <span>{nextMilestone - points} points to go</span>
            </div>
            <div className="ur-prog-track">
              <motion.div 
                className="ur-prog-fill" 
                initial={{ width: 0 }} 
                animate={{ width: `${progressPercent}%` }} 
                transition={{ duration: 1, delay: 0.3 }} 
              />
            </div>
          </div>
        </Card>
      </motion.div>

      <section className="ur-coupons-sec">
        <h2>Your Rewards <Badge variant="primary" size="sm">Monthly Milestone</Badge></h2>
        
        <div className="ur-coupons-grid">
          {mockCoupons.map((c: Coupon, i: number) => (
            <motion.div key={c.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.1 * i }}>
              <Card variant="default" padding="none" className="coupon-card">
                <div className="coupon-left">
                  <span className="coupon-amt">{c.discount}% OFF</span>
                  <span className="coupon-desc">{c.description}</span>
                  <span className="coupon-exp">Expires: {c.expiresAt}</span>
                </div>
                <div className="coupon-right">
                  <div className="coupon-code">{c.code}</div>
                  <Button 
                    size="sm" 
                    variant={copiedCode === c.code ? 'secondary' : 'primary'}
                    icon={copiedCode === c.code ? <CheckCircle size={16} /> : <Copy size={16} />}
                    onClick={() => handleCopy(c.code)}
                  >
                    {copiedCode === c.code ? 'Copied' : 'Copy'}
                  </Button>
                </div>
                <div className="coupon-cutout-top" />
                <div className="coupon-cutout-bottom" />
              </Card>
            </motion.div>
          ))}

          {mockCoupons.length === 0 && (
            <div className="ur-empty">
              <Gift size={48} />
              <p>Keep booking services to unlock your first reward!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
