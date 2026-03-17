import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, TrendingUp, AlertCircle, CreditCard, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { mockTransactions } from '../../data/mockData';
import { walletService } from '../../services/walletService';
import { useNotification } from '../../context/NotificationContext';
import './ProWallet.css';

export default function ProWallet() {
  const { notify } = useNotification();
  const [showRecharge, setShowRecharge] = useState(false);
  const [balance, setBalance] = useState(-2);
  const [transactions, setTransactions] = useState<any[]>(mockTransactions);
  const commissionRate = 9;

  useEffect(() => {
    walletService.getBalance()
      .then(res => setBalance(res.balance))
      .catch((e) => console.warn('Failed to fetch balance', e));

    walletService.getTransactions()
      .then(data => setTransactions(data))
      .catch((e) => console.warn('Failed to fetch txns', e));
  }, []);

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
              <h2 className={`wallet-amount ${balance < 0 ? 'text-red-500' : ''}`}>
                {balance < 0 ? '-' : ''}${Math.abs(balance).toFixed(2)}
              </h2>
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

      {balance <= 5 && balance >= -5 && (
        <motion.div className="low-balance-warning" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AlertCircle size={18} />
          <div>
            <p><strong>Low balance warning</strong></p>
            <p>Your balance is {balance < 0 ? 'negative' : `below $5.00`}. Recharge soon to keep appearing in search results.</p>
          </div>
        </motion.div>
      )}

      {balance < -5 && (
        <motion.div className="low-balance-warning critical-warning" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ background: 'var(--error-100)', border: '1px solid var(--error-500)' }}>
          <AlertCircle size={18} color="var(--error-600)" />
          <div>
            <p style={{ color: 'var(--error-700)' }}><strong>Account Suspended</strong></p>
            <p style={{ color: 'var(--error-600)' }}>Your balance has dropped below -$5.00. You are currently hidden from search results. Recharge immediately to restore your visibility.</p>
          </div>
        </motion.div>
      )}

      {/* Recharge Panel */}
      {showRecharge && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
          <Card variant="glass" padding="md" className="recharge-panel">
            <h3>Quick Recharge</h3>
            <div className="recharge-amounts">
              {[5, 10, 20, 50].map(amt => (
                <button 
                  key={amt} 
                  className="recharge-amount-btn" 
                  onClick={() => {
                    setShowRecharge(false);
                    notify('success', 'Wallet recharged', `$${amt} has been added.`);
                  }}>
                  ${amt}
                </button>
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
          {transactions.map((t: any, i: number) => (
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
