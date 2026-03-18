import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet as WalletIcon, TrendingUp, AlertCircle, CreditCard, Plus, ArrowUpRight, ArrowDownRight, Loader } from 'lucide-react';
import { Card, Button, Badge } from '../../components/ui';
import { walletService, USD_TO_COP_RATE } from '../../services/walletService';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import './ProWallet.css';

export default function ProWallet() {
  const { notify } = useNotification();
  const { professionalId } = useAuth();
  const [showRecharge, setShowRecharge] = useState(false);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [currency, setCurrency] = useState<'USD' | 'COP'>('USD');
  const [recharging, setRecharging] = useState(false);
  const commissionRate = 9;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (!professionalId) { setLoading(false); return; }
        const walletData = await walletService.getBalance(professionalId).catch(() => ({ balance: 0, transactions: [] }));
        setBalance(walletData?.balance ?? 0);
        setTransactions(walletData?.transactions || []);
      } catch {
        setBalance(0);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [professionalId]);

  const handleRecharge = async (amount?: number) => {
    const amt = amount || parseFloat(rechargeAmount);
    if (!amt || amt <= 0) {
      notify('error', 'Error', 'Please enter a valid amount');
      return;
    }
    setRecharging(true);
    try {
      await walletService.recharge(professionalId!, { amount: amt, currency });
      // Refresh balance
      const walletData = await walletService.getBalance(professionalId!).catch(() => ({ balance: 0, transactions: [] }));
      setBalance(walletData?.balance ?? balance + (currency === 'COP' ? amt * 0.00024 : amt));
      setTransactions(walletData?.transactions || []);
      setShowRecharge(false);
      setRechargeAmount('');
      const displayAmt = currency === 'COP' ? `$${amt.toLocaleString()} COP` : `$${amt} USD`;
      notify('success', 'Wallet recharged!', `${displayAmt} has been added to your wallet.`);
    } catch (err: any) {
      notify('error', 'Recharge failed', err?.response?.data?.message || 'Could not process recharge');
    } finally {
      setRecharging(false);
    }
  };

  // Currency conversion display
  const conversionText = currency === 'COP' && rechargeAmount
    ? `≈ $${(parseFloat(rechargeAmount) * 0.00024).toFixed(2)} USD`
    : currency === 'USD' && rechargeAmount
      ? `≈ $${(parseFloat(rechargeAmount) * USD_TO_COP_RATE).toLocaleString()} COP`
      : '';

  // Calculate stats from transactions
  const thisMonthEarnings = transactions
    .filter(t => t.type === 'payment' || t.type === 'recharge')
    .filter(t => {
      const d = new Date(t.date || t.createdAt);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  const commissionsPaid = transactions
    .filter(t => t.type === 'commission')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);

  if (loading) {
    return (
      <div className="pro-wallet" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

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
            <div className="wallet-info-item"><span className="w-info-label">Total Earned</span><span className="w-info-val">${thisMonthEarnings.toFixed(2)}</span></div>
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
            <h3>Recharge Wallet</h3>

            {/* Currency Selector */}
            <div style={{ display: 'flex', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
              <button
                className={`recharge-amount-btn ${currency === 'USD' ? 'active' : ''}`}
                onClick={() => setCurrency('USD')}
                style={currency === 'USD' ? { background: 'var(--primary-500)', color: 'white' } : {}}
              >
                🇺🇸 USD
              </button>
              <button
                className={`recharge-amount-btn ${currency === 'COP' ? 'active' : ''}`}
                onClick={() => setCurrency('COP')}
                style={currency === 'COP' ? { background: 'var(--primary-500)', color: 'white' } : {}}
              >
                🇨🇴 COP
              </button>
            </div>

            {/* Quick amounts */}
            <div className="recharge-amounts">
              {(currency === 'USD' ? [5, 10, 20, 50] : [20000, 50000, 100000, 200000]).map(amt => (
                <button
                  key={amt}
                  className="recharge-amount-btn"
                  disabled={recharging}
                  onClick={() => handleRecharge(amt)}
                >
                  {currency === 'COP' ? `$${amt.toLocaleString()}` : `$${amt}`}
                </button>
              ))}
            </div>

            <div className="recharge-custom">
              <div style={{ flex: 1 }}>
                <input
                  type="number"
                  placeholder={`Custom amount (${currency})`}
                  value={rechargeAmount}
                  onChange={(e) => setRechargeAmount(e.target.value)}
                />
                {conversionText && (
                  <p style={{ fontSize: 'var(--text-xs)', color: 'var(--neutral-400)', marginTop: '4px' }}>
                    {conversionText}
                  </p>
                )}
              </div>
              <Button size="sm" onClick={() => handleRecharge()} icon={<CreditCard size={16} />} loading={recharging}>
                Recharge
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Stats */}
      <div className="wallet-stats">
        <Card variant="default" padding="md" className="wallet-stat-card">
          <div className="ws-icon" style={{ background: 'var(--success-50)', color: 'var(--success-500)' }}><TrendingUp size={18} /></div>
          <div><span className="ws-val">${thisMonthEarnings.toFixed(2)}</span><span className="ws-label">This Month</span></div>
        </Card>
        <Card variant="default" padding="md" className="wallet-stat-card">
          <div className="ws-icon" style={{ background: 'var(--warning-50)', color: 'var(--warning-500)' }}><ArrowDownRight size={18} /></div>
          <div><span className="ws-val">${commissionsPaid.toFixed(2)}</span><span className="ws-label">Commissions Paid</span></div>
        </Card>
      </div>

      {/* Transaction History */}
      <section className="wallet-section">
        <h2>Transaction History</h2>
        <div className="txn-list">
          {transactions.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--neutral-400)' }}>
              <CreditCard size={32} style={{ opacity: 0.4, marginBottom: '8px' }} />
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.map((t: any, i: number) => (
              <motion.div key={t.id || i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card variant="default" padding="sm" className="txn-card">
                  <div className={`txn-icon ${t.type === 'recharge' || t.type === 'payment' ? 'txn-in' : 'txn-out'}`}>
                    {t.type === 'recharge' || t.type === 'payment' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div className="txn-info">
                    <p className="txn-desc">{t.description || t.type}</p>
                    <p className="txn-date">{t.date || new Date(t.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="txn-right">
                    <span className={`txn-amount ${t.type === 'commission' || t.type === 'payout' ? 'txn-negative' : 'txn-positive'}`}>
                      {t.type === 'commission' || t.type === 'payout' ? '-' : '+'}${parseFloat(t.amount || 0).toFixed(2)}
                    </span>
                    <Badge variant={t.status === 'completed' ? 'success' : 'warning'} size="sm">{t.status || 'completed'}</Badge>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
