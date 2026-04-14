import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Spinner from './common/Spinner';

/**
 * Wrap a route's element in <ProtectedRoute> to require login.
 * Optionally pass `role` to restrict to a specific role (e.g. "admin").
 *
 * Usage in App.jsx:
 *   <Route path="/admin" element={<ProtectedRoute role="admin"><AdminPage /></ProtectedRoute>} />
 */
export default function ProtectedRoute({ children, role }) {
  const { user, loading } = useAuth();

  // Still checking session — show spinner instead of flashing login page
  if (loading) {
    return <Spinner message="Checking authentication..." />;
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but wrong role
  if (role && user.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
}
