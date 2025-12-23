// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import NotAuthorised from "../pages/NotAuthorised";
import { useAuth } from "../../common/context/AuthContext";

const ProtectedRoute = ({ allowedRoles = [], children }) => {
  const { user, authLoading } = useAuth();
  const location = useLocation();

  // ✅ TEMP BYPASS (testing only)
  // Use either env flag OR URL param:
  const bypassEnv = import.meta.env.VITE_BYPASS_AUTH === "true";
  const bypassParam = new URLSearchParams(location.search).get("bypass");
  const bypass = bypassEnv || bypassParam === "1" || bypassParam === "true";

  if (bypass) {
    return children;
  }

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If allowedRoles not provided, treat as "any logged-in user"
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    return <NotAuthorised />;
  }

  return children;
};

export default ProtectedRoute;
