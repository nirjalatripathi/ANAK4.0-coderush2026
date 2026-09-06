import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Loading from './Loading';

export default function RoleRoute({ roles, children, adminLock = false }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-8"><Loading /></div>;
  if (!user || !roles.includes(user.role)) {
    if (adminLock) return <Navigate to="/access-denied" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}
