import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Box,
} from "@mui/material";
import { supabaseClient } from "../../common/utils/supabaseClient";

const Verify = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [settingPassword, setSettingPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [token, setToken] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenHash = params.get("token_hash");
    const type = params.get("type");

    if (tokenHash && type === "email") {
      setToken(tokenHash);
      supabaseClient.auth.exchangeCodeForSession(tokenHash).catch((err) => {
        console.error(err);
        setError("Invalid or expired token. Please try again.");
      });
    } else {
      setError("Missing or invalid token.");
    }
  }, []);

  const handleSubmit = async () => {
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSettingPassword(true);

    try {
      const { data: userSession } = await supabaseClient.auth.getSession();

      const user = userSession?.session?.user;
      if (!user) {
        setError("No user session found.");
        setSettingPassword(false);
        return;
      }

      const { error: updateError } = await supabaseClient.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message);
        setSettingPassword(false);
        return;
      }

      setSuccess("Password set successfully! Redirecting...");
      setTimeout(() => {
        const subdomain = window.location.hostname.split("-itsm.")[0];
        navigate(`https://${subdomain}-itsm.hi5tech.co.uk/dashboard`);
      }, 2000);
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    } finally {
      setSettingPassword(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Typography variant="h4" gutterBottom>
        Set Your Password
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      <TextField
        fullWidth
        label="New Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Confirm Password"
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        sx={{ mb: 3 }}
      />

      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          color="primary"
          disabled={settingPassword}
          onClick={handleSubmit}
        >
          {settingPassword ? <CircularProgress size={24} /> : "Set Password"}
        </Button>
      </Box>
    </Container>
  );
};

export default Verify;
