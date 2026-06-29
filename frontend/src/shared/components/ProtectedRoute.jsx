import { Navigate } from 'react-router-dom';
import { useAuth } from '../../core/contexts/AuthContext';

/**
 * ProtectedRoute — Guards authenticated-only routes.
 * Loading state is handled at the App level (AppLoadingSplash),
 * so we simply redirect unauthenticated users to /login.
 */
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  // Auth is still initializing — render nothing and let the
  // App-level splash handle the loading UX.
  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
