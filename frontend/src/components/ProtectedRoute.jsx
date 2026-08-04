import { Navigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function ProtectedRoute({ children, roles = null, adminOnly = false }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div data-testid="auth-loading" className="min-h-screen flex items-center justify-center text-sm label-mono">
        Loading…
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  const allowed = adminOnly ? ["admin"] : roles;
  if (allowed && !allowed.includes(user.role)) {
    // Send to their home
    const home = user.role === "admin" ? "/admin"
      : user.role === "parent" ? "/parent"
      : user.role === "counselor" ? "/counselor"
      : user.role === "principal" ? "/principal"
      : "/dashboard";
    return <Navigate to={home} replace />;
  }
  return children;
}
