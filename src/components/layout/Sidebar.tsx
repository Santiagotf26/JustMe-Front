import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, Briefcase, BarChart3, Settings, LogOut,
  Scissors, CalendarDays, Wallet, Star, Image as ImageIcon,
  Search, Heart, CreditCard, Home, UserCircle, ShieldCheck, FileText, Sparkles,
  ArrowLeftRight, Clock, X, Gift
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle } from '../ui/ThemeToggle';
import { ModeTransition } from '../ui/ModeTransition';
import { BecomeProfessionalModal } from '../ui/BecomeProfessionalModal';
import './Sidebar.css';

const userLinks = [
  { to: '/user', icon: <Home size={20} />, label: 'Home' },
  { to: '/user/search', icon: <Search size={20} />, label: 'Search' },
  { to: '/user/appointments', icon: <CalendarDays size={20} />, label: 'Appointments' },
  { to: '/user/favorites', icon: <Heart size={20} />, label: 'Favorites' },
  { to: '/user/payments', icon: <CreditCard size={20} />, label: 'Payments' },
  { to: '/user/rewards', icon: <Gift size={20} />, label: 'Rewards' },
  { to: '/user/profile', icon: <UserCircle size={20} />, label: 'Profile' },
];

const proLinks = [
  { to: '/professional', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/professional/calendar', icon: <CalendarDays size={20} />, label: 'Calendar' },
  { to: '/professional/wallet', icon: <Wallet size={20} />, label: 'Wallet' },
  { to: '/professional/services', icon: <Scissors size={20} />, label: 'Services' },
  { to: '/professional/portfolio', icon: <ImageIcon size={20} />, label: 'Portfolio' },
  { to: '/professional/reviews', icon: <Star size={20} />, label: 'Reviews' },
  { to: '/professional/schedule', icon: <Clock size={20} />, label: 'Schedule' },
  { to: '/professional/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
  { to: '/professional/profile', icon: <UserCircle size={20} />, label: 'Profile' },
];

const adminLinks = [
  { to: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
  { to: '/admin/professionals', icon: <Briefcase size={20} />, label: 'Professionals' },
  { to: '/admin/services', icon: <Scissors size={20} />, label: 'Services' },
  { to: '/admin/transactions', icon: <FileText size={20} />, label: 'Transactions' },
  { to: '/admin/analytics', icon: <BarChart3 size={20} />, label: 'Analytics' },
  { to: '/admin/settings', icon: <Settings size={20} />, label: 'Settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { user, role, logout, switchRole, verificationStatus, refreshVerificationStatus } = useAuth();
  const navigate = useNavigate();
  const [showModeTransition, setShowModeTransition] = useState(false);
  const [targetMode, setTargetMode] = useState<'user' | 'professional'>('user');
  const [showBecomeProModal, setShowBecomeProModal] = useState(false);

  const links = role === 'admin' ? adminLinks : role === 'professional' ? proLinks : userLinks;
  const roleLabel = role === 'admin' ? 'Admin' : role === 'professional' ? 'Professional' : 'Customer';

  const handleLogout = () => {
    logout();
    navigate('/');
    onClose?.();
  };

  const handleRoleSwitch = () => {
    if (role === 'user') {
      // If user is not an approved professional, show the application modal
      if (verificationStatus !== 'approved') {
        setShowBecomeProModal(true);
        return;
      }
      setTargetMode('professional');
      setShowModeTransition(true);
    } else if (role === 'professional') {
      setTargetMode('user');
      setShowModeTransition(true);
    }
    onClose?.();
  };

  const handleTransitionComplete = () => {
    setShowModeTransition(false);
    if (targetMode === 'professional') {
      switchRole('professional');
      navigate('/professional');
    } else {
      switchRole('user');
      navigate('/user');
    }
  };

  const handleBecomeProSuccess = async () => {
    await refreshVerificationStatus();
  };

  // Determine the switch button text
  const switchButtonText = role === 'user'
    ? (verificationStatus === 'approved' ? 'Switch to Professional Mode' : 'Become a Professional')
    : 'Switch to Client Mode';

  return (
    <>
      {/* Mode Transition Overlay */}
      <ModeTransition
        targetMode={targetMode}
        isVisible={showModeTransition}
        onComplete={handleTransitionComplete}
      />

      {/* Become Professional Modal */}
      <BecomeProfessionalModal
        isOpen={showBecomeProModal}
        onClose={() => setShowBecomeProModal(false)}
        onSuccess={handleBecomeProSuccess}
      />

      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <div className="sidebar-logo">
            <span className="logo-icon"><Sparkles size={20} /></span>
            <span className="logo-text">JustMe</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--space-2)' }}>
            <div className="sidebar-role-badge">
              <ShieldCheck size={12} />
              <span>{roleLabel}</span>
            </div>
            <button onClick={onClose} className="sidebar-close-btn">
              <X size={18} />
            </button>
          </div>
        </div>

        <nav className="sidebar-nav">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/user' || link.to === '/professional' || link.to === '/admin'}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Role Switch Button */}
          {role !== 'admin' && (
            <button className="sidebar-role-switch" onClick={handleRoleSwitch}>
              <ArrowLeftRight size={16} />
              {switchButtonText}
            </button>
          )}

          {user && (
            <div className="sidebar-user">
              <Avatar src={user.avatar} name={user.name} size="sm" />
              <div className="sidebar-user-info">
                <p className="sidebar-user-name">{user.name}</p>
                <p className="sidebar-user-email">{user.email}</p>
              </div>
            </div>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <ThemeToggle size="sm" />
          </div>
          <button className="sidebar-link sidebar-logout" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
