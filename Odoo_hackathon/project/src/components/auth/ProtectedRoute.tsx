import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../../context/AuthContext';
import { canAccess, type ModuleKey } from '../../lib/rbac';
import { Loading } from '../ui/Feedback';

export function ProtectedRoute({ module, children }: { module?: ModuleKey; children: ReactNode }) {
  const { session, roleName, loading } = useAuth();

  if (loading) return <Loading message="Authenticating..." />;
  if (!session) return <Navigate to="/login" replace />;

  if (module && !canAccess(module, roleName)) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100">Access Denied</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Your role ({roleName}) does not have permission to access this module.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
