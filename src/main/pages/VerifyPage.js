import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

export default function VerifyPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [setting, setSetting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is signed in already after verification
    const checkAuth = async () => {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setError(
          "You are not signed in. Check your email for the verification link."
        );
      }
    };
    checkAuth();
  }, []);

  const handleSetPassword = async () => {
    setSetting(true);
    setError("");

    const { data: sessionData } = await supabase.auth.getSession();
    const access_token = sessionData?.session?.access_token;

    if (!access_token) {
      setError("No active session found.");
      setSetting(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser(
      { password },
      { token: access_token }
    );

    if (updateError) {
      setError(updateError.message);
    } else {
      navigate("/dashboard"); // Replace with actual destination
    }

    setSetting(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Set Your Password
      </Typography>
      <Typography variant="body1" gutterBottom>
        Choose a secure password to complete your account setup.
      </Typography>

      <Box sx={{ mt: 4, display: "flex", flexDirection: "column", gap: 2 }}>
        <TextField
          label="New Password"
          type="password"
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <Alert severity="error">{error}</Alert>}

        <Button
          variant="contained"
          onClick={handleSetPassword}
          disabled={!password || setting}
        >
          {setting ? "Saving..." : "Set Password & Continue"}
        </Button>
      </Box>
    </Container>
  );
}
