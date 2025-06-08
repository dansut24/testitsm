import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// ITSM Pages
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import UserDashboard from "./pages/UserDashboard";
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
import Login from "./pages/Login";
import Signup from "./pages/Signup";
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
import ArticleDetail from "./pages/ArticleDetail";
import Announcements from "./pages/Announcements";
import WorkScheduler from "./pages/WorkScheduler";
import LinkComplete from "./pages/LinkComplete";
import Pricing from "./pages/Pricing";
import StartTrial from "./pages/StartTrial";
import TenantSetupWizard from "./pages/TenantSetupWizard";

// Self-Service Portal
import SelfServiceLayout from "./layouts/SelfServiceLayout";
import SelfServiceHome from "./pages/SelfService/SelfServiceHome";
import RaiseRequest from "./pages/SelfService/RaiseRequest";
import RaiseIncident from "./pages/SelfService/RaiseIncident";
import SelfServiceKnowledgeBase from "./pages/SelfService/KnowledgeBase";
import ServiceCatalog from "./pages/SelfService/ServiceCatalog";
import Checkout from "./pages/SelfService/Checkout";
import Confirmation from "./pages/SelfService/Confirmation";

// Public Pages
import NotFound from "./pages/NotFound";
import NotAuthorised from "./pages/NotAuthorised";
import ProtectedRoute from "./components/ProtectedRoute";
import Viewer from "./pages/rdp/Viewer";
import ConnectivityTest from "./pages/rdp/ConnectivityTest";

// Marketing Pages
import MarketingHome from "./pages/Marketing/Home";
import About from "./pages/Marketing/About";
import Contact from "./pages/Marketing/Contact";
import Products from "./pages/Marketing/Products";

function isRootDomain() {
  const host = window.location.hostname;
  return host === "hi5tech.co.uk" || host === "www.hi5tech.co.uk";
}

function AppRoutes() {
  const { user, authLoading } = useAuth();
  if (authLoading) return <div>Loading...</div>;

  const isLoggedIn = !!user;

  if (isRootDomain()) {
    // Public Marketing Site
    return (
      <Routes>
        <Route path="/" element={<MarketingHome />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/products" element={<Products />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/start-trial" element={<StartTrial />} />
        <Route path="/tenant-setup" element={<TenantSetupWizard />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    );
  }

  // ITSM Tenant Site
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/loading" element={<Loading />} />
      <Route path="/not-authorised" element={<NotAuthorised />} />
      <Route path="/connectivity-test" element={<ConnectivityTest />} />
      <Route path="/link-complete" element={<LinkComplete />} />

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

      {/* Main ITSM Layout */}
      <Route path="/" element={isLoggedIn ? <Layout /> : <Login />}>
        <Route
          path="dashboard"
          element={
            user?.role === "selfservice" ? <UserDashboard /> : <Dashboard />
          }
        />
        <Route
          path="user-dashboard"
          element={
            <ProtectedRoute allowedRoles={["user", "selfservice"]}>
              <UserDashboard />
            </ProtectedRoute>
          }
        />
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
        <Route path="rdp-viewer" element={<Viewer />} />
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
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <>
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
        <AppRoutes />
      </Box>
    </>
  );
}

export default App;
