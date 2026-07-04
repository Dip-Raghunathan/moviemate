import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './core/contexts/AuthContext';
import { ToastProvider } from './core/contexts/ToastContext';
import ProtectedRoute from './shared/components/ProtectedRoute';
import GlobalContainer from './shared/components/GlobalContainer';
import ErrorBoundary from './shared/components/ErrorBoundary';
import OfflineBanner from './shared/components/OfflineBanner';

// ── Lazy Loaded Pages ─────────────────────────────────────────────────────────
const Home = lazy(() => import('./features/home/pages/Home'));
const Login = lazy(() => import('./features/authentication/pages/Login'));
const Signup = lazy(() => import('./features/authentication/pages/Signup'));
const ForgotPassword = lazy(() => import('./features/authentication/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./features/authentication/pages/ResetPassword'));
const Dashboard = lazy(() => import('./features/matching/pages/Dashboard'));
const Matching = lazy(() => import('./features/matching/pages/Matching'));
const Chat = lazy(() => import('./features/chat/pages/Chat'));
const Profile = lazy(() => import('./features/profile/pages/Profile'));
const SessionsPage = lazy(() => import('./features/profile/pages/SessionsPage'));
const UpgradePage = lazy(() => import('./features/profile/pages/UpgradePage'));
const DiscoverPage = lazy(() => import('./features/discover/pages/DiscoverPage'));
const WatchlistPage = lazy(() => import('./features/watchlist/pages/WatchlistPage'));
const SearchPage = lazy(() => import('./features/matching/pages/SearchPage'));
const NotificationsPage = lazy(() => import('./features/matching/pages/NotificationsPage'));
const VerifyEmail = lazy(() => import('./features/authentication/pages/VerifyEmail'));

// ── App Loading Splash ────────────────────────────────────────────────────────
const AppLoadingSplash = () => (
  <div role="status" aria-live="polite" style={{
    position: 'fixed', inset: 0,
    background: '#05050a',
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease forwards',
  }}>
    {/* Logo */}
    <div style={{
      width: 64, height: 64, borderRadius: 18,
      background: 'linear-gradient(135deg, #e8102a, #ff4b5e)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 20,
      boxShadow: '0 8px 32px rgba(232,16,42,0.4)',
      animation: 'float 2s ease-in-out infinite',
    }}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18"/>
        <line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/>
        <line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>
      </svg>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 32 }}>
      <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.375rem', color: '#f0f0fa', letterSpacing: '-0.02em' }}>PhilixMate</span>
    </div>
    {/* Animated loading dots */}
    <div style={{ display: 'flex', gap: 8 }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: 8, height: 8, borderRadius: '50%',
          background: i === 0 ? '#e8102a' : 'rgba(255,255,255,0.15)',
          animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
        }} />
      ))}
    </div>
  </div>
);

// ── App Routes ────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    const titles = {
      '/': 'PhilixMate | Discover your next favorite film',
      '/login': 'Login | PhilixMate',
      '/signup': 'Create account | PhilixMate',
      '/forgot-password': 'Reset password | PhilixMate',
      '/dashboard': 'Dashboard | PhilixMate',
      '/search': 'Search | PhilixMate',
      '/matching': 'Matching | PhilixMate',
      '/discover': 'Discover | PhilixMate',
      '/watchlist': 'Watchlist | PhilixMate',
      '/profile': 'Profile | PhilixMate',
      '/sessions': 'Sessions | PhilixMate',
      '/upgrade': 'Upgrade | PhilixMate',
      '/notifications': 'Notifications | PhilixMate',
      '/verify-email': 'Verify Email | PhilixMate',
    };

    document.title = titles[location.pathname] || 'PhilixMate';
  }, [location.pathname]);

  if (loading) return <AppLoadingSplash />;

  return (
    <Suspense fallback={<AppLoadingSplash />}>
      <Routes>
        {/* Public */}
        <Route path="/"                      element={<Home />} />
        <Route path="/login"                 element={<Login />} />
        <Route path="/signup"                element={<Signup />} />
        <Route path="/forgot-password"       element={<ForgotPassword />} />
        <Route path="/reset-password"        element={<ResetPassword />} />
        <Route path="/verify-email"          element={<VerifyEmail />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/search"    element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
        <Route path="/matching"  element={<ProtectedRoute><Matching /></ProtectedRoute>} />
        <Route path="/discover" element={<ProtectedRoute><DiscoverPage /></ProtectedRoute>} />
        <Route path="/watchlist" element={<ProtectedRoute><WatchlistPage /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
        <Route path="/chat/:roomId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/profile"   element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/sessions"  element={<ProtectedRoute><SessionsPage /></ProtectedRoute>} />
        <Route path="/upgrade"   element={<ProtectedRoute><UpgradePage /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
};

// ── Root App ──────────────────────────────────────────────────────────────────
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <OfflineBanner />
            <GlobalContainer>
              <AppRoutes />
            </GlobalContainer>
          </ErrorBoundary>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
