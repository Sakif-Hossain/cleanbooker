import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  redirectPath?: string;
  requireBusiness?: boolean;
  requireClient?: boolean;
  children?: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  redirectPath = "/",
  requireBusiness = false,
  requireClient = false,
  children,
}) => {
  const { isAuthenticated, user } = useAuth();

  // Not logged in → redirect to login
  if (!isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  // Role-based access
  if (requireBusiness && user?.role !== "business") {
    return <Navigate to="/" replace />;
  }
  if (requireClient && user?.role !== "customer") {
    return <Navigate to="/" replace />;
  }

  // Render either children or nested routes
  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;
