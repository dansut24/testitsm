// MainContent.js
import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";


const MainContent = () => {
  return (
    <Box
      sx={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        overflowY: "auto",
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MainContent;
