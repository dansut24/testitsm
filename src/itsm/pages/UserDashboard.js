// src/itsm/pages/UserDashboard.js
import React from "react";
import { Box, Typography } from "@mui/material";
import DashboardWidgetGrid from "../components/DashboardWidgetGrid";
import TenantOnboardingBanner from "../components/TenantOnboardingBanner";

const UserDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      {/* 🔹 Onboarding banner */}
      <Box sx={{ maxWidth: 1400, mx: "auto", mb: 2 }}>
        <TenantOnboardingBanner />
      </Box>

      {/* 🔹 Main dashboard content */}
      <Box sx={{ maxWidth: 1400, mx: "auto" }}>
        <Typography variant="h4" sx={{ mb: 2 }}>
          My Dashboard
        </Typography>
        <DashboardWidgetGrid />
      </Box>
    </Box>
  );
};

export default UserDashboard;
