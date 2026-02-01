import { Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore.js";

export function ProtectedRoute({ children, requireAdmin = false }) {
  const { token, user } = useAuthStore();

  // Not authenticated - redirect to login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Requires admin but user is not admin - redirect to dashboard
  if (requireAdmin && user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

  return children;
}
