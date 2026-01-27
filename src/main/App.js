// src/main/App.js
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MarketingLayout from "./layouts/MarketingLayout";

// Pages (marketing)
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import TenantSetupWizard from "./pages/TenantSetupWizard";
import VerifyPage from "./pages/VerifyPage";

// ✅ Central login + landing
import CentralLogin from "../common/pages/CentralLogin";
import TenantLanding from "./pages/TenantLanding";

function isRootDomain(host) {
  return host === "hi5tech.co.uk" || host === "www.hi5tech.co.uk";
}

function App() {
  const host = window.location.hostname || "";

  // ✅ Root domain remains marketing
  if (isRootDomain(host)) {
    return (
      <Routes>
        <Route path="/setup" element={<TenantSetupWizard />} />
        <Route path="/verify" element={<VerifyPage />} />

        <Route path="/" element={<MarketingLayout />}>
          <Route index element={<Home />} />
          <Route path="about" element={<About />} />
          <Route path="contact" element={<Contact />} />
          <Route path="products" element={<Products />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    );
  }

  // ✅ Tenant subdomain becomes the “central portal”
  return (
    <Routes>
      <Route path="/login" element={<CentralLogin />} />
      <Route path="/" element={<TenantLanding />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
