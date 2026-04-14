import { Bell, Search, Menu, Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import { Avatar } from '../ui/Avatar';
import { ThemeToggle, LanguageToggle } from '../ui';
import './TopBar.css';

interface TopBarProps {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: TopBarProps) {
  const { user } = useAuth();
  const { t } = useTranslation();

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
        <button className="topbar-icon-btn" id="notifications-btn">
          <Bell size={20} />
          <span className="topbar-badge">3</span>
        </button>
        {user && (
          <Avatar src={user.avatar} name={user.name} size="sm" status="online" />
        )}
      </div>
    </header>
  );
}
