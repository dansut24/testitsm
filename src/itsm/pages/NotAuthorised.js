import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const NotAuthorised = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ p: 4, textAlign: "center" }}>
      <Typography variant="h3" color="error" gutterBottom>
        403 – Not Authorised
      </Typography>
      <Typography variant="body1" sx={{ mb: 3 }}>
        You do not have permission to view this page. If you believe this is an error, please contact your system administrator.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/dashboard")}>
        Return to Dashboard
      </Button>
    </Box>
  );
};

export default NotAuthorised;
