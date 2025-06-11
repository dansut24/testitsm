import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import MarketingLayout from "./layouts/MarketingLayout";
import MarketingHome from "./pages/Marketing/Home";
import About from "./pages/Marketing/About";
import Contact from "./pages/Marketing/Contact";
import Products from "./pages/Marketing/Products";
import Pricing from "./pages/Marketing/Pricing";
import StartTrial from "./pages/Marketing/StartTrial";
import TenantSetupWizard from "./pages/Marketing/TenantSetupWizard";
import NotFound from "./pages/Shared/NotFound";

function App() {
  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", overflowX: "hidden" }}>
        <Routes>
          <Route element={<MarketingLayout />}>
            <Route path="/" element={<MarketingHome />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<Products />} />
          </Route>
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/start-trial" element={<StartTrial />} />
          <Route path="/tenant-setup" element={<TenantSetupWizard />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
