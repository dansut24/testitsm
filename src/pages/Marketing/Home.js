import React from "react";
import { Box, Typography, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: "center", mt: 8 }}>
      <Typography variant="h3" gutterBottom>
        Welcome to Hi5Tech ITSM
      </Typography>
      <Typography variant="h6" gutterBottom>
        Powerful IT Service Management. Simple, Scalable, Secure.
      </Typography>
      <Button variant="contained" onClick={() => navigate("/start-trial")}>
        Start Free Trial
      </Button>
    </Box>
  );
};

export default Home;
