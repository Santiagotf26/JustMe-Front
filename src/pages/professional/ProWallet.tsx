import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, History, AlertCircle, CheckCircle2, XCircle, Loader } from 'lucide-react';
import { Card, Button, Badge, Modal } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { professionalsService } from '../../services/professionalsService';
import { useTranslation } from 'react-i18next';
import './ProWallet.css';

export default function ProWallet() {
  const { t, i18n } = useTranslation();
  const { professionalId } = useAuth();
  const [balance, setBalance] = useState<number | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRecharge, setShowRecharge] = useState(false);
  const [amount, setAmount] = useState('');
  const [recharging, setRecharging] = useState(false);
  const [rechargeStatus, setRechargeStatus] = useState<'success' | 'error' | null>(null);

  useEffect(() => {
    const fetchWallet = async () => {
      if (!professionalId) return;
      try {
        const [prof, txs] = await Promise.all([
          professionalsService.getProfessionalById(professionalId),
          professionalsService.getTransactions(professionalId).catch(() => [])
        ]);
        setBalance(prof?.walletBalance ?? 0);
        setTransactions(txs || []);
      } catch (err) {
        console.warn('Failed to load wallet', err);
      } finally {
        setLoading(false);
      }
    };
    fetchWallet();
  }, [professionalId]);

  const handleRecharge = async (customAmt?: number) => {
    const amtToPay = customAmt || Number(amount);
    if (!amtToPay || isNaN(amtToPay)) return;
    
    setRecharging(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setBalance(prev => (prev || 0) + amtToPay);
      setRechargeStatus('success');
      setAmount('');
      setTimeout(() => {
        setShowRecharge(false);
        setRechargeStatus(null);
      }, 3000);
    } catch (err) {
      setRechargeStatus('error');
    } finally {
      setRecharging(false);
    }
  };

  const getBalanceStatusLabel = () => {
    if (balance === null) return '...';
    if (balance < -5) return t('proWallet.accountSuspended');
    if (balance < 0) return t('proWallet.negative');
    if (balance < 5) return t('proWallet.below', { defaultValue: 'Low Balance' });
    return t('sharedPages.pro.verified');
  };

  if (loading) {
    return (
      <div className="pro-wallet" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Loader size={32} style={{ animation: 'spin 0.8s linear infinite', color: 'var(--primary-500)' }} />
      </div>
    );
  }

  const thisMonthEarnings = transactions
    .filter(tx => tx.type === 'earning' || tx.type === 'recharge')
    .filter(tx => {
      const d = new Date(tx.createdAt || tx.date);
      const now = new Date();
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const commissionsPaid = transactions
    .filter(tx => tx.type === 'commission')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const handleClose = () => {
    if (!recharging) {
      setShowRecharge(false);
      setRechargeStatus(null);
    }
  };

  return (
    <div className="pro-wallet">
      <div className="wallet-header">
        <h1>{t('proWallet.title')}</h1>
        <Badge variant={balance !== null && balance < 0 ? 'error' : 'success'} size="md">
          {getBalanceStatusLabel()}
        </Badge>
      </div>

      <div className="wallet-grid">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="wallet-main">
          {/* Balance Card */}
          <Card variant="gradient" padding="lg" className="wallet-balance-card">
            <div className="wallet-top">
              <div>
                <span className="wallet-label">{t('proWallet.available')}</span>
                <h2 className="wallet-amount">${balance !== null ? balance.toFixed(2) : '0.00'}</h2>
              </div>
              <Button className="recharge-btn" variant="secondary" icon={<Plus size={18} />} onClick={() => setShowRecharge(true)}>
                {t('proWallet.rechargeBtn')}
              </Button>
            </div>
            <div className="wallet-info-row">
              <div className="wallet-info-item">
                <span className="w-info-label">{t('proWallet.rate')}</span>
                <span className="w-info-val">10%</span>
              </div>
              <div className="wallet-info-item">
                <span className="w-info-label">Status</span>
                <span className="w-info-val">Active</span>
              </div>
            </div>
          </Card>

          {balance !== null && balance < 5 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="low-balance-warning">
              <AlertCircle size={20} />
              <div>
                <strong>{balance < -5 ? t('proWallet.accountSuspended') : t('proWallet.lowBalancePop')}</strong>
                <p>{balance < -5 ? t('proWallet.suspendedMsg') : t('proWallet.lowBalanceMsg', { status: balance < 0 ? t('proWallet.negative') : t('proWallet.below') })}</p>
              </div>
            </motion.div>
          )}

          {/* Stats */}
          <div className="wallet-stats">
            <Card variant="default" padding="md" className="wallet-stat-card">
              <div className="ws-icon" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
                <ArrowDownLeft size={20} />
              </div>
              <div>
                <span className="ws-label">{t('proWallet.thisMonth')}</span>
                <span className="ws-val">${thisMonthEarnings.toFixed(2)}</span>
              </div>
            </Card>
            <Card variant="default" padding="md" className="wallet-stat-card">
              <div className="ws-icon" style={{ background: 'var(--error-50)', color: 'var(--error-600)' }}>
                <ArrowUpRight size={20} />
              </div>
              <div>
                <span className="ws-label">{t('proWallet.commPaid')}</span>
                <span className="ws-val">${commissionsPaid.toFixed(2)}</span>
              </div>
            </Card>
          </div>

          {/* Transactions */}
          <div className="wallet-section">
            <h2><History size={18} /> {t('proWallet.txHistory')}</h2>
            <div className="txn-list">
              {transactions.length === 0 ? (
                <div className="pw-empty">
                  <Wallet size={40} />
                  <p>{t('proWallet.noTx')}</p>
                </div>
              ) : (
                transactions.map((tx) => (
                  <Card key={tx.id} variant="default" padding="sm" className="txn-card">
                    <div className={`txn-icon ${tx.type === 'earning' || tx.type === 'recharge' ? 'txn-in' : 'txn-out'}`}>
                      {tx.type === 'earning' || tx.type === 'recharge' ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                    </div>
                    <div className="txn-info">
                      <span className="txn-desc">{tx.description || t('adminDash.transaction')}</span>
                      <span className="txn-date">{new Date(tx.createdAt || tx.date).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="txn-right">
                      <span className={`txn-amount ${tx.type === 'earning' || tx.type === 'recharge' ? 'txn-positive' : 'txn-negative'}`}>
                        {tx.type === 'earning' || tx.type === 'recharge' ? '+' : '-'}${tx.amount.toFixed(2)}
                      </span>
                      <Badge size="sm" variant={tx.status === 'completed' ? 'success' : 'warning'}>{tx.status}</Badge>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recharge Modal */}
      <Modal 
        isOpen={showRecharge} 
        onClose={handleClose} 
        title={t('proWallet.rechargeTitle')}
        size="md"
      >
        <div className="recharge-panel">
          {rechargeStatus === 'success' ? (
            <div className="recharge-status-view">
              <CheckCircle2 size={48} color="var(--success-500)" />
              <h3>{t('proWallet.successTitle')}</h3>
              <p>{t('proWallet.successMsg', { amount: `$${amount || '0'}` })}</p>
            </div>
          ) : rechargeStatus === 'error' ? (
            <div className="recharge-status-view">
              <XCircle size={48} color="var(--error-500)" />
              <h3>{t('proWallet.failTitle')}</h3>
              <p>{t('proWallet.failMsg')}</p>
              <Button onClick={() => setRechargeStatus(null)}>{t('userHome.retry')}</Button>
            </div>
          ) : (
            <>
              <h3>{t('proWallet.selectAmount')}</h3>
              <div className="recharge-amounts">
                {[10, 25, 50, 100].map(v => (
                  <button key={v} className="recharge-amount-btn" onClick={() => handleRecharge(v)}>
                    ${v}
                  </button>
                ))}
              </div>
              <div className="recharge-custom">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={e => setAmount(e.target.value)} 
                  placeholder="0.00" 
                />
                <Button 
                  loading={recharging} 
                  disabled={!amount || Number(amount) <= 0}
                  onClick={() => handleRecharge()}
                >
                  {t('proWallet.rechargeBtn')}
                </Button>
              </div>
              <p className="recharge-hint">Payment processed via MercadoPago secure gateway.</p>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
