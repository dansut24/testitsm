import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <Box
      sx={{
        width: "100%",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        pt: { xs: '80px', sm: '92px' }, // adjusts for mobile portrait header + tabs
        pb: { xs: '80px', sm: '24px' }, // adds bottom padding for AI chat box
        minHeight: { xs: 'calc(100vh - 80px)', sm: 'auto' }, // prevent blank space
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MainContent;
