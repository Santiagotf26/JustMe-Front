import { Bell, Search, Menu, Sparkles, Check, CheckCheck, User, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle, LanguageToggle } from '../ui';
import { apiClient } from '../../services/api';
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './TopBar.css';

interface TopBarProps {
  onMenuClick?: () => void;
}

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);

  const load = async () => {
    try {
      const [notifRes, countRes] = await Promise.all([
        apiClient.get<Notification[]>('/notifications'),
        apiClient.get<number>('/notifications/unread-count'),
      ]);
      setNotifications(notifRes.data);
      setUnread(typeof countRes.data === 'number' ? countRes.data : (countRes.data as any)?.count ?? 0);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000); // Poll every 30s
    return () => clearInterval(interval);
  }, []);

  const markRead = async (id: number) => {
    await apiClient.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    setUnread(prev => Math.max(0, prev - 1));
  };

  const markAllRead = async () => {
    await apiClient.patch('/notifications/read-all').catch(() => {});
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    setUnread(0);
  };

  return { notifications, unread, markRead, markAllRead };
}

const typeColors: Record<string, string> = {
  booking: 'var(--primary-500)',
  wallet: 'var(--success-500)',
  review: '#fbbf24',
  system: 'var(--neutral-400)',
};

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user, logout, role } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { notifications, unread, markRead, markAllRead } = useNotifications();

  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fullName = user ? `${user.name || ''} ${user.lastName || ''}`.trim() : '';

  // Navigate to the right profile/settings page based on role
  const getProfileRoute = () => {
    if (role === 'admin') return '/admin/profile';
    if (role === 'professional') return '/professional/profile';
    return '/user/profile';
  };

  const getSettingsRoute = () => {
    if (role === 'admin') return '/admin/settings';
    if (role === 'professional') return '/professional/profile';
    return '/user/profile';
  };

  const handleNavigate = (route: string) => {
    setShowProfile(false);
    navigate(route);
  };

  const handleLogout = () => {
    setShowProfile(false);
    logout();
    navigate('/login');
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="topbar-menu-btn" onClick={onMenuClick}>
          <Menu size={22} />
        </button>
        <div className="topbar-logo-mobile">
          <span className="logo-icon"><Sparkles size={20} /></span>
          <span className="logo-text">JustMe</span>
        </div>
      </div>

      <div className="topbar-search">
        <Search size={18} />
        <input type="text" placeholder={t('nav.searchPlaceholder')} />
      </div>

      <div className="topbar-right">
        <LanguageToggle size="sm" />
        <ThemeToggle size="sm" />

        {/* Notifications */}
        <div ref={notifRef} style={{ position: 'relative' }}>
          <button
            className="topbar-icon-btn"
            id="notifications-btn"
            onClick={() => { setShowNotif(v => !v); setShowProfile(false); }}
          >
            <Bell size={20} />
            {unread > 0 && <span className="topbar-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>

          {showNotif && (
            <div className="topbar-dropdown" style={{ width: 360 }}>
              <div className="topbar-dropdown-header">
                <span>Notificaciones</span>
                {unread > 0 && (
                  <button className="topbar-dropdown-action" onClick={markAllRead}>
                    <CheckCheck size={14} /> Marcar todo leído
                  </button>
                )}
              </div>
              <div className="topbar-dropdown-list" style={{ maxHeight: 380, overflowY: 'auto' }}>
                {notifications.length === 0 ? (
                  <div className="topbar-dropdown-empty">
                    <Bell size={28} style={{ opacity: 0.2 }} />
                    <p>Sin notificaciones</p>
                  </div>
                ) : notifications.map(n => (
                  <div
                    key={n.id}
                    className={`topbar-notif-item${n.isRead ? '' : ' unread'}`}
                    onClick={() => !n.isRead && markRead(n.id)}
                  >
                    <div
                      className="topbar-notif-dot"
                      style={{ background: typeColors[n.type] || typeColors.system }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="topbar-notif-title">{n.title}</p>
                      <p className="topbar-notif-msg">{n.message}</p>
                      <p className="topbar-notif-time">
                        {new Date(n.createdAt).toLocaleString('es', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                    </div>
                    {!n.isRead && (
                      <button
                        className="topbar-notif-read"
                        title="Marcar como leída"
                        onClick={e => { e.stopPropagation(); markRead(n.id); }}
                      >
                        <Check size={13} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        {user && (
          <div ref={profileRef} style={{ position: 'relative' }}>
            <button
              className="topbar-avatar-btn"
              onClick={() => { setShowProfile(v => !v); setShowNotif(false); }}
            >
              <Avatar src={user.avatar} name={user.name} size="sm" status="online" />
            </button>

            {showProfile && (
              <div className="topbar-dropdown" style={{ width: 270, right: 0 }}>
                {/* Profile header */}
                <div className="topbar-profile-header">
                  <Avatar src={user.avatar} name={user.name} size="md" status="online" />
                  <div style={{ minWidth: 0 }}>
                    <p className="topbar-profile-name">{fullName || user.name}</p>
                    <p className="topbar-profile-email">{user.email}</p>
                    <span className="topbar-profile-role">{user.roles?.[0]?.name || role || 'admin'}</span>
                  </div>
                </div>
                <div className="topbar-dropdown-divider" />
                <button
                  className="topbar-dropdown-item"
                  onClick={() => handleNavigate(getProfileRoute())}
                >
                  <User size={15} /> Mi Perfil
                </button>
                <button
                  className="topbar-dropdown-item"
                  onClick={() => handleNavigate(getSettingsRoute())}
                >
                  <Settings size={15} /> Configuración
                </button>
                <div className="topbar-dropdown-divider" />
                <button className="topbar-dropdown-item danger" onClick={handleLogout}>
                  <LogOut size={15} /> Cerrar sesión
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}



