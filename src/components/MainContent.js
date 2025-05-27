// MainContent.js (Cleaned for single scroll container)

import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

const MainContent = () => {
  return (
    <Box
      sx={{
        width: '100%',
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: 'background.default',
        pt: { xs: '92px', sm: '92px' },
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MainContent;
