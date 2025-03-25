
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/use-auth';
import { Spinner } from '@/components/ui/spinner';

interface RoleProtectedRouteProps {
  children: ReactNode;
  roles: string[];
  redirectTo?: string;
}

const RoleProtectedRoute = ({ 
  children, 
  roles, 
  redirectTo = '/dashboard' 
}: RoleProtectedRouteProps) => {
  const { user, userProfile, loading, hasRole } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!userProfile || !hasRole(roles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
