import React from "react";
import { CssBaseline, Box } from "@mui/material";
import { Routes, Route } from "react-router-dom";
import SelfServiceLayout from "./layouts/SelfServiceLayout";

import SelfServiceHome from "./pages/Home";
import RaiseRequest from "./pages/RaiseRequest";
import RaiseIncident from "./pages/RaiseIncident";
import ServiceCatalog from "./pages/ServiceCatalog";
import Checkout from "./pages/Checkout";
import Confirmation from "./pages/Confirmation";
import KnowledgeBase from "./pages/KnowledgeBase";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", overflow: "auto" }}>
        <Routes>
          <Route path="/" element={<SelfServiceLayout />}>
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
