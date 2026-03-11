import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Users, Briefcase, BarChart3, Settings, LogOut,
  Scissors, CalendarDays, Wallet, Star, Image as ImageIcon,
  Search, Heart, CreditCard, Home, UserCircle, ShieldCheck, FileText, Sparkles
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle } from '../ui/ThemeToggle';
import './Sidebar.css';

const userLinks = [
  { to: '/user', icon: <Home size={20} />, label: 'Home' },
  { to: '/user/search', icon: <Search size={20} />, label: 'Search' },
  { to: '/user/appointments', icon: <CalendarDays size={20} />, label: 'Appointments' },
  { to: '/user/favorites', icon: <Heart size={20} />, label: 'Favorites' },
  { to: '/user/payments', icon: <CreditCard size={20} />, label: 'Payments' },
  { to: '/user/profile', icon: <UserCircle size={20} />, label: 'Profile' },
];

const proLinks = [
  { to: '/professional', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
  { to: '/professional/requests', icon: <Briefcase size={20} />, label: 'Requests' },
  { to: '/professional/calendar', icon: <CalendarDays size={20} />, label: 'Calendar' },
  { to: '/professional/earnings', icon: <BarChart3 size={20} />, label: 'Earnings' },
  { to: '/professional/wallet', icon: <Wallet size={20} />, label: 'Wallet' },
  { to: '/professional/services', icon: <Scissors size={20} />, label: 'Services' },
  { to: '/professional/portfolio', icon: <ImageIcon size={20} />, label: 'Portfolio' },
  { to: '/professional/reviews', icon: <Star size={20} />, label: 'Reviews' },
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

export function Sidebar() {
  const { user, role, logout } = useAuth();
  const navigate = useNavigate();

  const links = role === 'admin' ? adminLinks : role === 'professional' ? proLinks : userLinks;
  const roleLabel = role === 'admin' ? 'Admin' : role === 'professional' ? 'Professional' : 'Customer';

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <motion.aside
      className="sidebar"
      initial={{ x: -260 }}
      animate={{ x: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="sidebar-brand">
        <div className="sidebar-logo">
          <span className="logo-icon"><Sparkles size={20} /></span>
          <span className="logo-text">JustMe</span>
        </div>
        <div className="sidebar-role-badge">
          <ShieldCheck size={12} />
          <span>{roleLabel}</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === '/user' || link.to === '/professional' || link.to === '/admin'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
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
    </motion.aside>
  );
}
