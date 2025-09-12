// MainContent.js
import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";

const HEADER_HEIGHT = 92; // header + tabs combined
const FOOTER_HEIGHT = 80; // footer + AIChat safe space

const MainContent = () => {
  return (
    <Box
      sx={{
        width: "80%",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        backgroundColor: "background.default",
        pt: `${HEADER_HEIGHT}px`,  // padding to account for fixed header
        pb: { xs: `${FOOTER_HEIGHT}px`, sm: '24px' }, // padding for AIChat/footer
        minHeight: { xs: `calc(100vh - ${HEADER_HEIGHT + FOOTER_HEIGHT}px)`, sm: 'auto' },
        overflowY: "auto",
      }}
    >
      <Outlet />
    </Box>
  );
};

export default MainContent;
