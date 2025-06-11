import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Devices from "./pages/Devices";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import { createClient } from "@supabase/supabase-js";

// Parse tenant from subdomain: e.g. test123-control.hi5tech.co.uk => test123
function getTenantSlug() {
  const host = window.location.hostname;
  const parts = host.split("-");
  if (parts.length >= 2) return parts[0];
  return null;
}

const supabase = createClient("https://YOUR_PROJECT.supabase.co", "YOUR_ANON_KEY");

function App() {
  const [tenantSlug] = useState(getTenantSlug());

  useEffect(() => {
    const checkAuth = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user) {
        window.location.href = "https://hi5tech.co.uk/login";
      }
    };
    checkAuth();
  }, []);

  return (
    <Router>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: "2rem" }}>
          <Routes>
            <Route path="/" element={<Home tenantSlug={tenantSlug} />} />
            <Route path="/devices" element={<Devices tenantSlug={tenantSlug} />} />
            <Route path="/reports" element={<Reports tenantSlug={tenantSlug} />} />
            <Route path="/settings" element={<Settings tenantSlug={tenantSlug} />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
