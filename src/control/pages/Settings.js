import React from "react";
import { Button, Typography, Box } from "@mui/material";
import { supabase } from "../../utils/supabaseClient";

const Settings = () => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/control-login";
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>
      <Typography variant="body1" gutterBottom>
        Configure your preferences and access controls.
      </Typography>

      <Button
        variant="outlined"
        color="error"
        sx={{ mt: 3 }}
        onClick={handleLogout}
      >
        Logout
      </Button>
    </Box>
  );
};

export default Settings;
