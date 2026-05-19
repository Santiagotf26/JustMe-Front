import { lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Preloader, LoginModal } from './components/ui';
import { useAuth } from './context/AuthContext';
import { useEffect } from 'react';

// ── Public pages (NOT lazy — immediate load for landing/auth) ──
import Landing from './pages/public/Landing';
import Register from './pages/public/Register';
import ForgotPassword from './pages/public/ForgotPassword';
import ResetPassword from './pages/public/ResetPassword';

// ── User pages (LAZY — only loaded when role === 'user') ──
const UserHome = lazy(() => import('./pages/user/UserHome'));
const SearchPage = lazy(() => import('./pages/user/Search'));
const ProfessionalProfile = lazy(() => import('./pages/user/ProfessionalProfile'));
const Booking = lazy(() => import('./pages/user/Booking'));
const Appointments = lazy(() => import('./pages/user/Appointments'));
const UserProfile = lazy(() => import('./pages/user/UserProfile'));
const UserRewards = lazy(() => import('./pages/user/UserRewards'));

// ── Professional pages (LAZY — only loaded when role === 'professional') ──
const ProDashboard = lazy(() => import('./pages/professional/ProDashboard'));
const ProWallet = lazy(() => import('./pages/professional/ProWallet'));
const ProSchedule = lazy(() => import('./pages/professional/ProSchedule'));
const ProAnalytics = lazy(() => import('./pages/professional/ProAnalytics'));

// ── Admin pages (LAZY — only loaded when role === 'admin') ──
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));

// ── Shared sub-pages (LAZY via wrappers) ──
import {
  LazyProBookingRequests as ProBookingRequests,
  LazyProCalendar as ProCalendar,
  LazyProEarnings as ProEarnings,
  LazyProServices as ProServices,
  LazyProPortfolio as ProPortfolio,
  LazyProProfileEditor as ProProfileEditor,
  LazyProReviews as ProReviews,
  LazyAdminUsers as AdminUsers,
  LazyAdminProfessionals as AdminProfessionals,
  LazyAdminServices as AdminServices,
  LazyAdminTransactions as AdminTransactions,
  LazyAdminAnalytics as AdminAnalytics,
  LazyAdminSettings as AdminSettings,
  LazyAdminProfile as AdminProfile,
  LazyUserFavorites as UserFavorites,
  LazyUserPayments as UserPayments,
} from './pages/LazySharedPages';

import './styles/index.css';

/**
 * Legacy Login Redirect
 * If a user navigates to /login, we redirect to home and open the modal.
 */
function LoginRedirect() {
  const { openLoginModal } = useAuth();
  useEffect(() => {
    openLoginModal();
  }, [openLoginModal]);
  return <Navigate to="/" replace />;
}

function App() {
  return (
    <ThemeProvider>
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Preloader />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<LoginRedirect />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

              {/* User Routes (lazy loaded) */}
              <Route element={<ProtectedRoute allowedRoles={['user', 'professional', 'admin']} />}>
                <Route path="/user" element={<AppLayout />}>
                  <Route index element={<UserHome />} />
                  <Route path="search" element={<SearchPage />} />
                  <Route path="professional/:id" element={<ProfessionalProfile />} />
                  <Route path="booking/:id" element={<Booking />} />
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="favorites" element={<UserFavorites />} />
                  <Route path="payments" element={<UserPayments />} />
                  <Route path="rewards" element={<UserRewards />} />
                  <Route path="profile" element={<UserProfile />} />
                </Route>
              </Route>

              {/* Professional Routes (lazy loaded) */}
              <Route element={<ProtectedRoute allowedRoles={['professional', 'admin']} />}>
                <Route path="/professional" element={<AppLayout />}>
                  <Route index element={<ProDashboard />} />
                  <Route path="requests" element={<ProBookingRequests />} />
                  <Route path="calendar" element={<ProCalendar />} />
                  <Route path="earnings" element={<ProEarnings />} />
                  <Route path="wallet" element={<ProWallet />} />
                  <Route path="services" element={<ProServices />} />
                  <Route path="portfolio" element={<ProPortfolio />} />
                  <Route path="reviews" element={<ProReviews />} />
                  <Route path="profile" element={<ProProfileEditor />} />
                  <Route path="schedule" element={<ProSchedule />} />
                  <Route path="analytics" element={<ProAnalytics />} />
                </Route>
              </Route>

              {/* Admin Routes (lazy loaded) */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin" element={<AppLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="professionals" element={<AdminProfessionals />} />
                  <Route path="services" element={<AdminServices />} />
                  <Route path="transactions" element={<AdminTransactions />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="profile" element={<AdminProfile />} />
                </Route>
              </Route>
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <GlobalModals />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
    </ThemeProvider>
  );
}

function GlobalModals() {
  const { isLoginModalOpen, closeLoginModal } = useAuth();
  return <LoginModal isOpen={isLoginModalOpen} onClose={closeLoginModal} />;
}

export default App;
