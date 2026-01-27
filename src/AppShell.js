import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import CentralLogin from "./common/pages/CentralLogin";
import AppRouter from "./common/pages/AppRouter";

// Mount each app under a path prefix
import ITSMApp from "./itsm";
import ControlApp from "./control";
import SelfServiceApp from "./selfservice";

// Optional: your marketing site
import MarketingApp from "./main";

export default function ShellApp() {
  return (
    <Routes>
      {/* Central entry */}
      <Route path="/login" element={<CentralLogin />} />
      <Route path="/app" element={<AppRouter />} />

      {/* Apps */}
      <Route path="/itsm/*" element={<ITSMApp />} />
      <Route path="/control/*" element={<ControlApp />} />
      <Route path="/self-service/*" element={<SelfServiceApp />} />

      {/* Root behavior: send to router (or marketing) */}
      <Route path="/" element={<Navigate to="/app" replace />} />

      {/* Keep marketing if you want it reachable */}
      <Route path="/site/*" element={<MarketingApp />} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/app" replace />} />
    </Routes>
  );
}
