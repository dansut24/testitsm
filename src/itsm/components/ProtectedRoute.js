// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import NotAuthorised from "../pages/NotAuthorised";
import { useAuth } from "../context/AuthContext"; // ✅ Import context

const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, authLoading } = useAuth(); // ✅ Use context

  if (authLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <NotAuthorised />;
  }

  return children;
};

export default ProtectedRoute;
