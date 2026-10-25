import { Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-3 border-blue-600 border-t-transparent"></div>
        <p className="mt-3 text-sm text-gray-500">Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // RBAC Role Check
  if (allowedRoles && allowedRoles.length > 0) {
    const currentRole = user?.role || 'student';
    if (!allowedRoles.includes(currentRole)) {
      return (
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mb-4 font-bold text-lg">
            403
          </div>
          <h1 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h1>
          <p className="text-sm text-gray-600 mb-6">
            Your current account role (<span className="font-semibold capitalize">{currentRole}</span>)
            does not have permission to view this resource.
          </p>
          <Link
            to="/dashboard"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors inline-block"
          >
            Return to Dashboard
          </Link>
        </div>
      );
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;

