// src/itsm/pages/SetPassword.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

function SetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const storedEmail = sessionStorage.getItem("tenant_email");
    if (storedEmail) {
      setEmail(storedEmail);
    } else {
      setMessage("❌ No verified email found.");
    }
  }, []);

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Update the user's password
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      if (error) throw error;

      // Sign in after password set
      const { data: signInData, error: loginError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (loginError) throw loginError;

      const subdomain = sessionStorage.getItem("tenant_subdomain");
      window.location.href = `https://${subdomain}-itsm.hi5tech.co.uk/dashboard`;
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", mt: 8, p: 3, boxShadow: 3, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>Set Your Password</Typography>
      {email && (
        <Typography variant="body2" sx={{ mb: 2 }}>
          Email: <strong>{email}</strong>
        </Typography>
      )}
      <form onSubmit={handleSetPassword}>
        <TextField
          fullWidth
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          sx={{ mb: 2 }}
          required
        />
        {message && (
          <Alert severity={message.startsWith("✅") ? "success" : "error"}>
            {message}
          </Alert>
        )}
        <Button fullWidth type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={22} /> : "Set Password & Continue"}
        </Button>
      </form>
    </Box>
  );
}

export default SetPassword;
