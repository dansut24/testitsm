// src/selfservice/App.js
import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";

import SelfServiceLayout from "./layouts/SelfServiceLayout";
import SelfServiceHome from "./pages/SelfServiceHome";
import RaiseRequest from "./pages/RaiseRequest";
import RaiseIncident from "./pages/RaiseIncident";
import ServiceCatalog from "./pages/ServiceCatalog";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/CheckoutConfirmation";
import KnowledgeBase from "./pages/KnowledgeBase";
import NotFound from "./pages/NotFound";

import { getCentralLoginUrl } from "../common/utils/portalUrl";
import ExternalRedirect from "../common/components/ExternalRedirect";

// ✅ New stable auth hook (cookie + /api/session)
import { useSession } from "../common/hooks/useSession";

// ✅ Shared Hi5 theme (optional but keeps visuals consistent)
import { Hi5ThemeProvider, useHi5Theme } from "../common/ui/hi5Theme";
import ThemeToggleIconButton from "../common/ui/ThemeToggleIconButton";

function SelfServiceInnerApp() {
  const { loading, user } = useSession();
  const centralLogin = getCentralLoginUrl("/self");

  const { mode, tokens: t, toggleMode } = useHi5Theme();

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          color: t.page.color,
          background: t.page.background,
          display: "grid",
          placeItems: "center",
          p: 4,
        }}
      >
        <p>Loading session...</p>
      </Box>
    );
  }

  return (
    <>
      <CssBaseline />
      <Box
        sx={{
          minHeight: "100vh",
          overflow: "auto",
          color: t.page.color,
          background: t.page.background,
          position: "relative",
        }}
      >
        {/* ✅ Floating theme toggle (matches Control/ITSM behaviour) */}
        <Box sx={{ position: "fixed", top: 14, right: 14, zIndex: 2000 }}>
          <ThemeToggleIconButton mode={mode} onToggle={toggleMode} t={t} />
        </Box>

        <Routes>
          {/* Always send /login to the central login on tenant base host */}
          <Route path="/login" element={<ExternalRedirect to={centralLogin} />} />

          <Route
            path="/"
            element={user ? <SelfServiceLayout /> : <ExternalRedirect to={centralLogin} />}
          >
            <Route index element={<SelfServiceHome />} />
            <Route path="raise-request" element={<RaiseRequest />} />
            <Route path="raise-incident" element={<RaiseIncident />} />
            <Route path="catalog" element={<ServiceCatalog />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="confirmation" element={<Confirmation />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
          </Route>

          <Route
            path="*"
            element={user ? <NotFound /> : <ExternalRedirect to={centralLogin} />}
          />
        </Routes>
      </Box>
    </>
  );
}

export default function App() {
  return (
    <Hi5ThemeProvider>
      <SelfServiceInnerApp />
    </Hi5ThemeProvider>
  );
}
