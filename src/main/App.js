// src/main/App.js
import React from "react";
import { Routes, Route } from "react-router-dom";
import MarketingLayout from "./layouts/MarketingLayout";

// Pages
import Home from "./pages/Home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Pricing from "./pages/Pricing";
import NotFound from "./pages/NotFound";
import TenantSetupWizard from "./pages/TenantSetupWizard"; // ✅ Add this line

function App() {
  return (
    <Routes>
      <Route path="/" element={<MarketingLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="products" element={<Products />} />
        <Route path="pricing" element={<Pricing />} />
        <Route path="setup" element={<TenantSetupWizard />} /> {/* ✅ Setup route */}
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;
