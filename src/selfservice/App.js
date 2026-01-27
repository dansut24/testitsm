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

import { useAuth } from "../common/context/AuthContext";
import { getCentralLoginUrl } from "../common/utils/portalUrl";

function App() {
  const { authLoading, user } = useAuth();

  if (authLoading) {
    return (
      <Box sx={{ p: 4 }}>
        <p>Loading session...</p>
      </Box>
    );
  }

  const centralLogin = getCentralLoginUrl("/self-service");

  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", overflow: "auto" }}>
        <Routes>
          <Route path="/login" element={<Navigate to={centralLogin} replace />} />

          <Route
            path="/"
            element={user ? <SelfServiceLayout /> : <Navigate to={centralLogin} replace />}
          >
            <Route index element={<SelfServiceHome />} />
            <Route path="raise-request" element={<RaiseRequest />} />
            <Route path="raise-incident" element={<RaiseIncident />} />
            <Route path="catalog" element={<ServiceCatalog />} />
            <Route path="checkout" element={<Checkout />} />
            <Route path="confirmation" element={<Confirmation />} />
            <Route path="knowledge-base" element={<KnowledgeBase />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </>
  );
}

export default App;
