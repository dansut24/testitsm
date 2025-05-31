// src/components/ProtectedRoute.js
import React from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ element, allowedRoles }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const location = useLocation();

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to="/not-authorised" state={{ from: location }} replace />;
  }

  return element;
};

export default ProtectedRoute;
