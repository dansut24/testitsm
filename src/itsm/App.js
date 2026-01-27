// src/itsm/App.js

// Global styles for MDEditor
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "../common/utils/supabaseClient";
import { ThemeModeProvider } from "./theme/ThemeContext";

// ✅ Central login page component (UI)
import CentralLogin from "../common/pages/CentralLogin";

// ✅ URL helpers to ALWAYS bounce to tenant central domain
import { getCentralLoginUrl } from "../common/utils/portalUrl";

// Layout & Auth
import Layout from "./components/Layout";
import Loading from "./pages/Loading";
import NotAuthorised from "./pages/NotAuthorised";
import ProtectedRoute from "./components/ProtectedRoute";

// Core Pages
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import ServiceRequests from "./pages/ServiceRequests";
import Changes from "./pages/Changes";
import Problems from "./pages/Problems";
import Assets from "./pages/Assets";
import KnowledgeBase from "./pages/KnowledgeBase";
import Reports from "./pages/Reports";
import Approvals from "./pages/Approvals";
import UserProfile from "./pages/UserProfile";
import Settings from "./pages/Settings";
import AdminSettings from "./pages/AdminSettings";

import TenantOnboardingPage from "./pages/TenantOnboardingPage";

// Create Pages
import NewIncident from "./pages/NewIncident";
import NewServiceRequest from "./pages/NewServiceRequest";
import NewChange from "./pages/NewChange";
import NewProblem from "./pages/NewProblem";
import NewAsset from "./pages/NewAsset";

// Detail Pages
import IncidentDetail from "./pages/IncidentDetail";
import ServiceRequestDetail from "./pages/ServiceRequestDetail";
import ChangeDetail from "./pages/ChangeDetail";
import ProblemDetail from "./pages/ProblemDetail";
import AssetDetail from "./pages/AssetDetail";
import ArticleDetail from "./pages/ArticleDetail";

// Other Features
import Announcements from "./pages/Announcements";
import WorkScheduler from "./pages/WorkScheduler";
import NotFound from "./pages/NotFound";
import SetPassword from "./pages/SetPassword";
import NewTab from "./pages/NewTab";

// Self-Service Pages (backwards compatibility if anyone hits /self-service on the ITSM host)
import SelfServiceLayout from "../selfservice/layouts/SelfServiceLayout";
import SelfServiceHome from "../selfservice/pages/SelfServiceHome";
import RaiseRequest from "../selfservice/pages/RaiseRequest";
import RaiseIncident from "../selfservice/pages/RaiseIncident";
import ServiceCatalog from "../selfservice/pages/ServiceCatalog";
import Checkout from "../selfservice/pages/Checkout";
import SelfServiceConfirmation from "../selfservice/pages/CheckoutConfirmation";
import SelfServiceKnowledgeBase from "../selfservice/pages/KnowledgeBase";

function ITSMRoutes() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // After login, we want to return to THIS module
  const centralLogin = getCentralLoginUrl("/itsm");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      setSession(session);
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  const isLoggedIn = !!session;

  return (
    <Routes>
      /**
       * ✅ IMPORTANT:
       * - /login should NEVER be handled on the -itsm host.
       * - If someone hits /login here, send them to tenant central login with redirect=/itsm
       */
      <Route path="/login" element={<Navigate to={centralLogin} replace />} />

      {/* These can stay on-module */}
      <Route path="/loading" element={<Loading />} />
      <Route path="/not-authorised" element={<NotAuthorised />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* ITSM base */}
      <Route
        path="/"
        element={isLoggedIn ? <Layout /> : <Navigate to={centralLogin} replace />}
      >
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="incidents" element={<Incidents />} />
        <Route path="service-requests" element={<ServiceRequests />} />
        <Route path="changes" element={<Changes />} />
        <Route path="problems" element={<Problems />} />
        <Route path="assets" element={<Assets />} />
        <Route path="knowledge-base" element={<KnowledgeBase />} />
        <Route path="reports" element={<Reports />} />
        <Route path="approvals" element={<Approvals />} />
        <Route path="profile" element={<UserProfile />} />
        <Route path="settings" element={<Settings />} />

        <Route
          path="admin-settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSettings />
            </ProtectedRoute>
          }
        />

        <Route
          path="tenant-onboarding"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <TenantOnboardingPage />
            </ProtectedRoute>
          }
        />

        {/* Create */}
        <Route path="new-incident" element={<NewIncident />} />
        <Route path="new-service-request" element={<NewServiceRequest />} />
        <Route path="new-change" element={<NewChange />} />
        <Route path="new-problem" element={<NewProblem />} />
        <Route path="new-asset" element={<NewAsset />} />

        {/* Detail */}
        <Route path="incidents/:id" element={<IncidentDetail />} />
        <Route path="service-requests/:id" element={<ServiceRequestDetail />} />
        <Route path="changes/:id" element={<ChangeDetail />} />
        <Route path="problems/:id" element={<ProblemDetail />} />
        <Route path="assets/:id" element={<AssetDetail />} />
        <Route path="knowledge-base/:id" element={<ArticleDetail />} />

        {/* Other */}
        <Route path="announcements" element={<Announcements />} />
        <Route path="work-scheduler" element={<WorkScheduler />} />
        <Route path="newtab/:id" element={<NewTab />} />
      </Route>

      {/* Self-Service (optional inside ITSM host) */}
      {isLoggedIn && (
        <Route path="/self-service" element={<SelfServiceLayout />}>
          <Route index element={<SelfServiceHome />} />
          <Route path="raise-request" element={<RaiseRequest />} />
          <Route path="raise-incident" element={<RaiseIncident />} />
          <Route path="catalog" element={<ServiceCatalog />} />
          <Route path="checkout" element={<Checkout />} />
          <Route path="confirmation" element={<SelfServiceConfirmation />} />
          <Route path="knowledge-base" element={<SelfServiceKnowledgeBase />} />
        </Route>
      )}

      {/* Catch-all */}
      <Route
        path="*"
        element={isLoggedIn ? <NotFound /> : <Navigate to={centralLogin} replace />}
      />
    </Routes>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100%",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <ITSMRoutes />
      </Box>
    </ThemeModeProvider>
  );
}

export default App;
