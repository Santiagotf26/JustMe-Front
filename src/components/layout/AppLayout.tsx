import { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomNav } from './BottomNav';
import { useAuth } from '../../context/AuthContext';
import './AppLayout.css';

const pageVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isAuthenticated, isLoggingIn } = useAuth();

  useEffect(() => {
    if (!isLoggingIn) {
      if (!isAuthenticated) {
        navigate('/login');
      } else {
        const currentRole = localStorage.getItem('justme_role');
        const path = location.pathname;
        
        // Basic role-based route protection
        if (path.startsWith('/admin') && currentRole !== 'admin') {
          navigate(currentRole === 'professional' ? '/professional' : '/user');
        } else if (path.startsWith('/professional') && currentRole !== 'professional' && currentRole !== 'admin') {
          // Admins can see professional pages, but users cannot
          navigate('/user');
        } else if (path.startsWith('/user') && currentRole !== 'user' && currentRole !== 'admin') {
          // Admins can see user pages, but professionals cannot
          navigate('/professional');
        }
      }
    }
  }, [isLoggingIn, isAuthenticated, navigate, location.pathname]);

  if (isLoggingIn) {
    return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Loading...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <TopBar onMenuClick={() => setSidebarOpen(prev => !prev)} />
      <main className="app-main">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{ minHeight: '100%' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  );
}
