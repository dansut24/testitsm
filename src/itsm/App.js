import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { supabase } from "../common/utils/supabaseClient";
import { ThemeModeProvider } from "./theme/ThemeContext"; // ✅ new theme provider

// Layout & Auth
import Layout from "./components/Layout";
import Login from "./pages/Login";
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

// Detail & Create Pages
import NewIncident from "./pages/NewIncident";
import NewServiceRequest from "./pages/NewServiceRequest";
import NewChange from "./pages/NewChange";
import NewProblem from "./pages/NewProblem";
import NewAsset from "./pages/NewAsset";

import IncidentDetail from "./pages/IncidentDetail";
import ServiceRequestDetail from "./pages/ServiceRequestDetail";
import ChangeDetail from "./pages/ChangeDetail";
import ProblemDetail from "./pages/ProblemDetail";
import AssetDetail from "./pages/AssetDetail";
import ArticleDetail from "./pages/ArticleDetail";

// Other ITSM Features
import Announcements from "./pages/Announcements";
import WorkScheduler from "./pages/WorkScheduler";
import NotFound from "./pages/NotFound";

// Magic link verification & password setup
import SetPassword from "./pages/SetPassword";

// New Tab Page
import NewTab from "./pages/NewTab";

function AppRoutes() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  if (loading) return <div>Loading...</div>;

  const isLoggedIn = !!session;

  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/login" element={<Login />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/not-authorised" element={<NotAuthorised />} />
      <Route path="/set-password" element={<SetPassword />} />

      {/* Authenticated Pages */}
      {isLoggedIn && (
        <Route path="/" element={<Layout />}>
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
          <Route path="new-incident" element={<NewIncident />} />
          <Route path="new-service-request" element={<NewServiceRequest />} />
          <Route path="new-change" element={<NewChange />} />
          <Route path="new-problem" element={<NewProblem />} />
          <Route path="new-asset" element={<NewAsset />} />
          <Route path="incidents/:id" element={<IncidentDetail />} />
          <Route path="service-requests/:id" element={<ServiceRequestDetail />} />
          <Route path="changes/:id" element={<ChangeDetail />} />
          <Route path="problems/:id" element={<ProblemDetail />} />
          <Route path="assets/:id" element={<AssetDetail />} />
          <Route path="knowledge-base/:id" element={<ArticleDetail />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="work-scheduler" element={<WorkScheduler />} />

          {/* New Tab Route */}
          <Route path="new-tab/:id" element={<NewTab />} />
        </Route>
      )}

      {/* Catch All */}
      <Route path="*" element={isLoggedIn ? <NotFound /> : <Login />} />
    </Routes>
  );
}

function App() {
  return (
    <ThemeModeProvider>
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          overflowX: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <AppRoutes />
      </Box>
    </ThemeModeProvider>
  );
}

export default App;
