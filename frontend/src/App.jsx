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
    <img 
      src="/logo.png" 
      alt="PhilixMate Logo" 
      style={{
        width: 64, height: 64, borderRadius: 18,
        marginBottom: 20,
        boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
        animation: 'float 2s ease-in-out infinite',
        objectFit: 'cover'
      }} 
    />
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

// ── SEO Metadata Helpers ──────────────────────────────────────────────────────
const updateMetaTag = (nameAttr, nameVal, contentVal, attributeType = 'name') => {
  let element = document.querySelector(`meta[${attributeType}="${nameVal}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeType, nameVal);
    document.head.appendChild(element);
  }
  element.setAttribute('content', contentVal);
};

const updateCanonicalLink = (url) => {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', url);
};

// ── App Routes ────────────────────────────────────────────────────────────────
const AppRoutes = () => {
  const { loading } = useAuth();
  const location = useLocation();

  useEffect(() => {
    let path = location.pathname;
    if (path.startsWith('/chat/')) path = '/chat';
    if (path.startsWith('/profile/')) path = '/profile';

    const pageMetadata = {
      '/': {
        title: 'PhilixMate | Discover your next favorite film',
        description: "Find movie companions who share your passion. Match with people watching the same movie at the same cinema. Never watch alone again.",
        robots: 'index, follow',
        ogTitle: 'PhilixMate — Never Watch Movies Alone Again',
        ogDescription: "The world's most intelligent movie companion platform. Find your perfect cinema match in seconds.",
      },
      '/login': {
        title: 'Login | PhilixMate',
        description: 'Sign in to PhilixMate to find cinema buddies, match with movie partners, and start chatting.',
        robots: 'index, follow',
      },
      '/signup': {
        title: 'Create account | PhilixMate',
        description: 'Join PhilixMate today. Choose your favorite film genres, match with cinema companions, and share your cinematic journey.',
        robots: 'index, follow',
      },
      '/forgot-password': {
        title: 'Reset password | PhilixMate',
        description: 'Forgot your password? Request a secure password reset link to access your PhilixMate account.',
        robots: 'index, follow',
      },
      '/reset-password': {
        title: 'Choose new password | PhilixMate',
        description: 'Enter a new secure password for your PhilixMate account.',
        robots: 'noindex, nofollow',
      },
      '/verify-email': {
        title: 'Verify Email | PhilixMate',
        description: 'Verify your email address to activate your PhilixMate account.',
        robots: 'noindex, nofollow',
      },
      '/dashboard': {
        title: 'Dashboard | PhilixMate',
        description: 'View your movie companions, active matching sessions, and matching queue.',
        robots: 'noindex, nofollow',
      },
      '/search': {
        title: 'Search | PhilixMate',
        description: 'Search the movie catalog, cinemas, showtimes, and active movie rooms.',
        robots: 'noindex, nofollow',
      },
      '/matching': {
        title: 'Matching | PhilixMate',
        description: 'Find your match for upcoming film screenings near you.',
        robots: 'noindex, nofollow',
      },
      '/discover': {
        title: 'Discover | PhilixMate',
        description: 'Explore popular movies, trending theaters, and community events.',
        robots: 'noindex, nofollow',
      },
      '/watchlist': {
        title: 'Watchlist | PhilixMate',
        description: 'Manage your personal movie watchlist and notify friends of showtimes you are planning to attend.',
        robots: 'noindex, nofollow',
      },
      '/profile': {
        title: 'Profile | PhilixMate',
        description: 'View and edit your movie tastes, biography, languages, and settings.',
        robots: 'noindex, nofollow',
      },
      '/sessions': {
        title: 'Sessions | PhilixMate',
        description: 'Manage your movie companion sessions and active chats.',
        robots: 'noindex, nofollow',
      },
      '/upgrade': {
        title: 'Upgrade | PhilixMate',
        description: 'Unlock premium matching features, ads removal, and unlimited connection requests on PhilixMate.',
        robots: 'noindex, nofollow',
      },
      '/notifications': {
        title: 'Notifications | PhilixMate',
        description: 'Stay updated on matching invitations, message alerts, and cinema notifications.',
        robots: 'noindex, nofollow',
      },
      '/chat': {
        title: 'Chat | PhilixMate',
        description: 'Chat with your movie companions and plan your cinema outings.',
        robots: 'noindex, nofollow',
      },
    };

    const meta = pageMetadata[path] || {
      title: 'PhilixMate',
      description: "The world's most intelligent movie companion platform.",
      robots: 'noindex, nofollow',
    };

    // Update title
    document.title = meta.title;

    // Update meta tags
    updateMetaTag('name', 'description', meta.description);
    updateMetaTag('name', 'robots', meta.robots);

    // Open Graph
    updateMetaTag('property', 'og:title', meta.ogTitle || meta.title, 'property');
    updateMetaTag('property', 'og:description', meta.ogDescription || meta.description, 'property');
    updateMetaTag('property', 'og:url', `https://www.philixmate.in${location.pathname}`, 'property');
    updateMetaTag('property', 'og:type', 'website', 'property');
    updateMetaTag('property', 'og:image', 'https://www.philixmate.in/logo.png', 'property');

    // Twitter
    updateMetaTag('name', 'twitter:card', 'summary_large_image');
    updateMetaTag('name', 'twitter:title', meta.ogTitle || meta.title);
    updateMetaTag('name', 'twitter:description', meta.ogDescription || meta.description);
    updateMetaTag('name', 'twitter:image', 'https://www.philixmate.in/logo.png');

    // Canonical
    updateCanonicalLink(`https://www.philixmate.in${location.pathname}`);
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
