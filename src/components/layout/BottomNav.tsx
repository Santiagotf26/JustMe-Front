import { NavLink } from 'react-router-dom';
import { Home, Search, CalendarDays, Heart, UserCircle, LayoutDashboard, Briefcase, Wallet, BarChart3, Users } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './BottomNav.css';

const userTabs = [
  { to: '/user', icon: <Home size={22} />, label: 'Home' },
  { to: '/user/search', icon: <Search size={22} />, label: 'Search' },
  { to: '/user/appointments', icon: <CalendarDays size={22} />, label: 'Bookings' },
  { to: '/user/favorites', icon: <Heart size={22} />, label: 'Saved' },
  { to: '/user/profile', icon: <UserCircle size={22} />, label: 'Profile' },
];

const proTabs = [
  { to: '/professional', icon: <LayoutDashboard size={22} />, label: 'Home' },
  { to: '/professional/requests', icon: <Briefcase size={22} />, label: 'Requests' },
  { to: '/professional/calendar', icon: <CalendarDays size={22} />, label: 'Calendar' },
  { to: '/professional/wallet', icon: <Wallet size={22} />, label: 'Wallet' },
  { to: '/professional/profile', icon: <UserCircle size={22} />, label: 'Profile' },
];

const adminTabs = [
  { to: '/admin', icon: <LayoutDashboard size={22} />, label: 'Dashboard' },
  { to: '/admin/users', icon: <Users size={22} />, label: 'Users' },
  { to: '/admin/professionals', icon: <Briefcase size={22} />, label: 'Pros' },
  { to: '/admin/analytics', icon: <BarChart3 size={22} />, label: 'Analytics' },
  { to: '/admin/settings', icon: <UserCircle size={22} />, label: 'Settings' },
];

export function BottomNav() {
  const { role } = useAuth();
  const tabs = role === 'admin' ? adminTabs : role === 'professional' ? proTabs : userTabs;

  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.to === '/user' || tab.to === '/professional' || tab.to === '/admin'}
          className={({ isActive }) => `bottom-nav-item ${isActive ? 'bottom-nav-active' : ''}`}
        >
          <span className="bottom-nav-icon">{tab.icon}</span>
          <span className="bottom-nav-label">{tab.label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
