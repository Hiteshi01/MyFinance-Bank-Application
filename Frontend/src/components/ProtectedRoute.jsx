import { Navigate } from "react-router-dom";
import { getSession, isAuthenticated } from "../utils/api";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/customer-login" />;
  }

  const session = getSession();
  if (allowedRoles.length > 0 && !allowedRoles.includes(session?.role)) {
    return <Navigate to={session?.role === "admin" ? "/admin-dashboard" : "/dashboard"} replace />;
  }

  return children;
};

export default ProtectedRoute;
