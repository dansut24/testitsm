// src/itsm/App.js

// Global styles for MDEditor
import "@uiw/react-md-editor/markdown-editor.css";
import "@uiw/react-markdown-preview/markdown.css";

import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Box } from "@mui/material";

import AuthGate from "./AuthGate";

// Layout
import Layout from "./components/Layout";

// Public/utility pages allowed without session checks (optional)
import Loading from "./pages/Loading";
import SetPassword from "./pages/SetPassword";
import NotFound from "./pages/NotFound";
import NotAuthorised from "./pages/NotAuthorised";

// Core pages
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

// Create pages
import NewIncident from "./pages/NewIncident";
import NewServiceRequest from "./pages/NewServiceRequest";
import NewChange from "./pages/NewChange";
import NewProblem from "./pages/NewProblem";
import NewAsset from "./pages/NewAsset";

// Detail pages
import IncidentDetail from "./pages/IncidentDetail";
import ServiceRequestDetail from "./pages/ServiceRequestDetail";
import ChangeDetail from "./pages/ChangeDetail";
import ProblemDetail from "./pages/ProblemDetail";
import AssetDetail from "./pages/AssetDetail";
import ArticleDetail from "./pages/ArticleDetail";

// Other
import Announcements from "./pages/Announcements";
import WorkScheduler from "./pages/WorkScheduler";
import NewTab from "./pages/NewTab";

export default function App() {
  return (
    <AuthGate>
      {/* Keep your glass/background wrapper if you want */}
      <Box sx={{ minHeight: "100vh", width: "100%" }}>
        <Routes>
          {/* These routes can exist but are still inside AuthGate
              (meaning you need session to reach them). */}
          <Route path="/loading" element={<Loading />} />
          <Route path="/not-authorised" element={<NotAuthorised />} />
          <Route path="/set-password" element={<SetPassword />} />

          <Route path="/" element={<Layout />}>
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

            {/* Admin */}
            <Route path="admin-settings" element={<AdminSettings />} />
            <Route path="tenant-onboarding" element={<TenantOnboardingPage />} />

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

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </AuthGate>
  );
}
