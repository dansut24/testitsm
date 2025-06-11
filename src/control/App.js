import React, { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
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

function App() {
  const tenantSlug = getTenantSlug();
  const [tenantValid, setTenantValid] = useState(null); // null = loading, false = invalid, true = valid
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateTenant = async () => {
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
      if (!userData?.user) {
        const redirectURL = encodeURIComponent(window.location.href);
        window.location.href = `/control-login?redirect=${redirectURL}`;
      } else {
        setLoading(false);
      }
    };

    if (tenantSlug) validateTenant();
    else setTenantValid(false);
  }, [tenantSlug]);

  if (tenantValid === null) return <div>🔄 Checking tenant...</div>;
  if (tenantValid === false) return <div>🚫 Tenant not found for this subdomain.</div>;
  if (loading) return <div>🔐 Verifying session...</div>;

  return (
    <Router>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, padding: "1rem" }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/control-login" element={<ControlLogin />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
