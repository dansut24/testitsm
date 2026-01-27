// src/main/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MarketingLayout from "./layouts/MarketingLayout";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import TenantSetupWizard from "./pages/TenantSetupWizard";
import VerifyPage from "./pages/VerifyPage";

// ✅ Central login + tenant landing
import CentralLogin from "../common/pages/CentralLogin";
import TenantLanding from "../common/pages/TenantLanding";

function App() {
  return (
    <Routes>
      {/* Full-screen standalone routes */}
      <Route path="/setup" element={<TenantSetupWizard />} />
      <Route path="/verify" element={<VerifyPage />} />

      {/* ✅ Tenant central login + landing */}
      <Route path="/login" element={<CentralLogin title="Sign in to Hi5Tech" />} />
      <Route path="/app" element={<TenantLanding />} />

      {/* Marketing pages under layout */}
      <Route path="/" element={<MarketingLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="products" element={<Products />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Optional: if someone hits / after login, you can push them to /app */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
