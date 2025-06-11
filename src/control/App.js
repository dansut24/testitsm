import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Home from "./pages/Home";
import Devices from "./pages/Devices";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import ControlLogin from "./pages/ControlLogin";
import Sidebar from "./components/Sidebar";

function getTenantSlug() {
  const host = window.location.hostname;
  const match = host.match(/^([a-z0-9-]+)-control\./);
  return match ? match[1] : null;
}

const Layout = ({ children }) => (
  <div style={{ display: "flex" }}>
    <Sidebar />
    <main style={{ flex: 1, padding: "1rem" }}>{children}</main>
  </div>
);

function App() {
  const [tenantValid, setTenantValid] = useState(null);
  const [loading, setLoading] = useState(true);

  const location = window.location;
  const path = location.pathname;
  const tenantSlug = getTenantSlug();
  const isLoginRoute = path.startsWith("/control-login");

  useEffect(() => {
    const validate = async () => {
      if (!tenantSlug) return setTenantValid(false);

      const { data, error } = await supabase
        .from("tenants")
        .select("id")
        .eq("subdomain", tenantSlug)
        .single();

      if (error || !data) {
        setTenantValid(false);
        return;
      }

      setTenantValid(true);

      const { data: userData } = await supabase.auth.getUser();

      const isAuthenticated = userData?.user != null;

      if (!isAuthenticated && !isLoginRoute) {
        const redirectURL = encodeURIComponent(location.href);
        window.location.href = `/control-login?redirect=${redirectURL}`;
      } else {
        setLoading(false);
      }
    };

    if (isLoginRoute) {
      setTenantValid(true); // allow login route to render
      setLoading(false);
    } else {
      validate();
    }
  }, [tenantSlug, path]);

  if (tenantValid === null) return <div>🔄 Checking tenant...</div>;
  if (tenantValid === false) return <div>🚫 Tenant not found for this subdomain.</div>;
  if (loading) return <div>🔐 Verifying session...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/control-login" element={<ControlLogin />} />
        <Route
          path="/"
          element={
            <Layout>
              <Home />
            </Layout>
          }
        />
        <Route
          path="/devices"
          element={
            <Layout>
              <Devices />
            </Layout>
          }
        />
        <Route
          path="/reports"
          element={
            <Layout>
              <Reports />
            </Layout>
          }
        />
        <Route
          path="/settings"
          element={
            <Layout>
              <Settings />
            </Layout>
          }
        />
        <Route
          path="*"
          element={
            <Layout>
              <NotFound />
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
