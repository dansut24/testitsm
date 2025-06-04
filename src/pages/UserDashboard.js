import React from "react";
import { Box, Typography } from "@mui/material";
import DashboardWidgetGrid from "../components/DashboardWidgetGrid";

const UserDashboard = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" sx={{ mb: 2 }}>
        My Dashboard
      </Typography>
      <DashboardWidgetGrid />
    </Box>
  );
};

export default UserDashboard;
