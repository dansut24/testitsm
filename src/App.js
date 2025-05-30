import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Layout from "./components/Layout";
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
import Login from "./pages/Login";
import Loading from "./pages/Loading";
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
import ArticleDetail from "./pages/ArticleDetail"; // ✅ Added
import NotFound from "./pages/NotFound";

// Self-Service Portal
import SelfServiceLayout from "./layouts/SelfServiceLayout";
import SelfServiceHome from "./pages/SelfService/SelfServiceHome";
import RaiseRequest from "./pages/SelfService/RaiseRequest";
import RaiseIncident from "./pages/SelfService/RaiseIncident";
import SelfServiceKnowledgeBase from "./pages/SelfService/KnowledgeBase";
import ServiceCatalog from "./pages/SelfService/ServiceCatalog";
import Checkout from "./pages/SelfService/Checkout";
import Confirmation from "./pages/SelfService/Confirmation";

function App() {
  return (
    <Router>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          width: "100vw",
          overflowX: "hidden",
          overflowY: "auto",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/loading" element={<Loading />} />

          {/* Self-Service Portal */}
          <Route path="/self-service" element={<SelfServiceLayout />}>
            <Route index element={<SelfServiceHome />} />
            <Route path="raise-request" element={<RaiseRequest />} />
            <Route path="raise-incident" element={<RaiseIncident />} />
            <Route path="catalog" element={<ServiceCatalog />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="confirmation" element={<Confirmation />} />
            <Route path="knowledge-base" element={<SelfServiceKnowledgeBase />} />
          </Route>

          {/* ITSM Admin Routes */}
          <Route path="/" element={<Layout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="incidents" element={<Incidents />} />
            <Route path="incidents/:id" element={<IncidentDetail />} />
            <Route path="new-incident" element={<NewIncident />} />
            <Route path="service-requests" element={<ServiceRequests />} />
            <Route path="service-requests/:id" element={<ServiceRequestDetail />} />
            <Route path="new-service-request" element={<NewServiceRequest />} />
            <Route path="changes" element={<Changes />} />
            <Route path="changes/:id" element={<ChangeDetail />} />
            <Route path="new-change" element={<NewChange />} />
            <Route path="problems" element={<Problems />} />
            <Route path="problems/:id" element={<ProblemDetail />} />
            <Route path="new-problem" element={<NewProblem />} />
            <Route path="assets" element={<Assets />} />
            <Route path="assets/:id" element={<AssetDetail />} />
            <Route path="new-asset" element={<NewAsset />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="knowledge-base/:id" element={<ArticleDetail />} /> {/* ✅ Added */}
            <Route path="reports" element={<Reports />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
