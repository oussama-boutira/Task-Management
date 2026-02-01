import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";
import { useEffect, useState } from "react";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { token, user, checkAuth, logout } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);
  const [isValid, setIsValid] = useState(false);

  useEffect(() => {
    const validateAuth = async () => {
      if (!token) {
        setIsChecking(false);
        setIsValid(false);
        return;
      }

      try {
        const valid = await checkAuth();
        setIsValid(valid);
        if (!valid) {
          logout(); // Clear invalid token
        }
      } catch (error) {
        console.error("Auth validation failed:", error);
        logout();
        setIsValid(false);
      } finally {
        setIsChecking(false);
      }
    };

    validateAuth();
  }, [token, checkAuth, logout]);

  // Show loading while checking auth
  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!token || !isValid) {
    return <Navigate to="/login" replace />;
  }

  // Requires admin but user is not admin - redirect to dashboard
  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
