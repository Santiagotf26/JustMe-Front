import { useState } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, TrendingUp, AlertCircle, CreditCard, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { mockTransactions } from '../../data/mockData';
import { useNotification } from '../../context/NotificationContext';
import './ProWallet.css';

export default function ProWallet() {
  const { notify } = useNotification();
  const [showRecharge, setShowRecharge] = useState(false);
  const balance = 450;
  const commissionRate = 9;

  const handleRecharge = () => {
    setShowRecharge(false);
    notify('success', 'Wallet recharged!', '$100 has been added to your wallet.');
  };

  return (
    <div className="pro-wallet">
      <h1>Wallet</h1>

      {/* Balance Card */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card variant="gradient" padding="lg" className="wallet-balance-card">
          <div className="wallet-top">
            <div>
              <p className="wallet-label">Available Balance</p>
              <h2 className="wallet-amount">${balance.toFixed(2)}</h2>
            </div>
            <WalletIcon size={32} opacity={0.4} />
          </div>
          <div className="wallet-info-row">
            <div className="wallet-info-item"><span className="w-info-label">Commission Rate</span><span className="w-info-val">{commissionRate}%</span></div>
            <div className="wallet-info-item"><span className="w-info-label">Total Earned</span><span className="w-info-val">$12,340</span></div>
          </div>
          <Button variant="secondary" size="sm" icon={<Plus size={16} />} onClick={() => setShowRecharge(!showRecharge)}
            className="recharge-btn">Recharge Wallet</Button>
        </Card>
      </motion.div>

      {balance < 50 && (
        <motion.div className="low-balance-warning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertCircle size={18} />
          <div>
            <p><strong>Low balance warning</strong></p>
            <p>Your balance is below $50. Recharge to keep appearing in search results.</p>
          </div>
        </motion.div>
      )}

      {/* Recharge Panel */}
      {showRecharge && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card variant="glass" padding="md" className="recharge-panel">
            <h3>Quick Recharge</h3>
            <div className="recharge-amounts">
              {[25, 50, 100, 200].map(amt => (
                <button key={amt} className="recharge-amount-btn">${amt}</button>
              ))}
            </div>
            <div className="recharge-custom">
              <input type="number" placeholder="Custom amount" />
              <Button size="sm" onClick={handleRecharge} icon={<CreditCard size={16} />}>Recharge</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="wallet-stats">
        <Card variant="default" padding="md" className="wallet-stat-card">
          <div className="ws-icon" style={{ background: 'var(--success-50)', color: 'var(--success-500)' }}><TrendingUp size={18} /></div>
          <div><span className="ws-val">$2,340</span><span className="ws-label">This Month</span></div>
        </Card>
        <Card variant="default" padding="md" className="wallet-stat-card">
          <div className="ws-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-500)' }}><ArrowDownRight size={18} /></div>
          <div><span className="ws-val">$210.60</span><span className="ws-label">Commissions Paid</span></div>
        </Card>
      </div>

      {/* Transaction History */}
      <section className="wallet-section">
        <h2>Transaction History</h2>
        <div className="txn-list">
          {mockTransactions.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card variant="default" padding="sm" className="txn-card">
                <div className={`txn-icon ${t.type === 'recharge' || t.type === 'payment' ? 'txn-in' : 'txn-out'}`}>
                  {t.type === 'recharge' || t.type === 'payment' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                </div>
                <div className="txn-info">
                  <p className="txn-desc">{t.description}</p>
                  <p className="txn-date">{t.date}</p>
                </div>
                <div className="txn-right">
                  <span className={`txn-amount ${t.type === 'commission' || t.type === 'payout' ? 'txn-negative' : 'txn-positive'}`}>
                    {t.type === 'commission' || t.type === 'payout' ? '-' : '+'}${t.amount}
                  </span>
                  <Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status}</Badge>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
