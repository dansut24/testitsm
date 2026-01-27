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

// Central portal pages
import CentralLogin from "../common/pages/CentralLogin";
import TenantLanding from "../common/pages/TenantLanding";

const ROOT_HOSTS = new Set(["hi5tech.co.uk", "www.hi5tech.co.uk"]);

function isRootHost() {
  const host = window.location.hostname || "";
  return ROOT_HOSTS.has(host);
}

function App() {
  // Root domain = marketing
  if (isRootHost()) {
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

  // Tenant base host = portal shell (login + landing)
  return (
    <Routes>
      <Route path="/login" element={<CentralLogin title="Sign in" afterLogin="/" />} />
      <Route path="/" element={<TenantLanding />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
