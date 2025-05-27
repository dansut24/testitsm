import React, { useEffect } from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Loading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      // Simulate data fetching or validation
      navigate("/dashboard");
    }, 2000); // Simulate a 2-second load

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <Box
      sx={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        color: "text.primary",
        gap: 2,
      }}
    >
      <Box
        component="img"
        src="/logo192.png"
        alt="Logo"
        sx={{
          height: 64,
          width: 64,
          animation: "spin 2s linear infinite",
          "@keyframes spin": {
            "0%": { transform: "rotate(0deg)" },
            "100%": { transform: "rotate(360deg)" },
          },
        }}
      />
      <CircularProgress />
      <Typography variant="body1" sx={{ mt: 1 }}>
        Loading your dashboard...
      </Typography>
    </Box>
  );
};

export default Loading;
