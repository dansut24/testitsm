// src/control/pages/Settings.js
import React from "react";
import { Box, Typography, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";
import { useAuth } from "../../common/context/AuthContext";

const Settings = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
    window.location.href = "/control-login"; // Full reload to reset session
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h5" gutterBottom>
        Control Panel Settings
      </Typography>

      <Stack spacing={2} mt={2}>
        <Button variant="contained" color="error" onClick={handleLogout}>
          Logout
        </Button>
      </Stack>
    </Box>
  );
};

export default Settings;
