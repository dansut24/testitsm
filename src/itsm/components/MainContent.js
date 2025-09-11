import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        width: "100%",
        backgroundColor: "background.default",
        overflowY: "auto",         // Enables independent scrolling
        scrollBehavior: "smooth",   // Smooth scroll for links
        pt: { xs: "92px", sm: "92px" }, // offset for header + tabs
        px: { xs: 1, sm: 2 },       // responsive padding
      }}
    >
      {/* Main page content rendered by React Router */}
      <Outlet />
    </Box>
  );
};

export default MainContent;
