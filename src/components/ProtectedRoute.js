// src/components/ProtectedRoute.js
import React from "react";
import { Navigate } from "react-router-dom";
import NotAuthorised from "../pages/NotAuthorised";

const ProtectedRoute = ({ allowedRoles, children }) => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <NotAuthorised />;
  }

  return children;
};

export default ProtectedRoute;
