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
import NotFound from "./pages/NotFound";
import IncidentDetail from "./pages/IncidentDetail";

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
          height: "100vh",
          width: "100vw",
          overflow: "hidden", // Prevent double scrollbars
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
            <Route path="service-requests" element={<ServiceRequests />} />
            <Route path="changes" element={<Changes />} />
            <Route path="problems" element={<Problems />} />
            <Route path="assets" element={<Assets />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
            <Route path="reports" element={<Reports />} />
            <Route path="approvals" element={<Approvals />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="settings" element={<Settings />} />
            <Route path="new-incident" element={<NewIncident />} />
            <Route path="incidents/:id" element={<IncidentDetail />} />
          </Route>

          {/* 404 Fallback */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;
