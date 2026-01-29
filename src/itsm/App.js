// src/itsm/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import AuthGate from "./AuthGate";

import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import Loading from "./pages/Loading";
import SetPassword from "./pages/SetPassword";

import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import ServiceRequests from "./pages/ServiceRequests";
import Changes from "./pages/Changes";
import Assets from "./pages/Assets";
import KnowledgeBase from "./pages/KnowledgeBase";
import Reports from "./pages/Reports";
import Approvals from "./pages/Approvals";
import Profile from "./pages/UserProfile";
import Settings from "./pages/Settings";

export default function App() {
  return (
    <AuthGate>
      <Routes>
        <Route path="/loading" element={<Loading />} />
        <Route path="/set-password" element={<SetPassword />} />

        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="incidents" element={<Incidents />} />
          <Route path="service-requests" element={<ServiceRequests />} />
          <Route path="changes" element={<Changes />} />
          <Route path="assets" element={<Assets />} />
          <Route path="knowledge-base" element={<KnowledgeBase />} />
          <Route path="reports" element={<Reports />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthGate>
  );
}
