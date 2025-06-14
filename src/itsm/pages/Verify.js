import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

function Verify() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(true); // start loading while we exchange token

  useEffect(() => {
    const handleSessionExchange = async () => {
      try {
        // Required for Supabase to complete magic link login
        const { error } = await supabase.auth.exchangeCodeForSession();
        if (error) throw error;

        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user || !user.email) throw new Error("User session not found.");
        setEmail(user.email);
      } catch (err) {
        setMsg(`❌ ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    handleSessionExchange();
  }, []);

  const handleSetPassword = async () => {
    setLoading(true);
    setMsg("");

    try {
      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      // Optional: try sign-in again to ensure token works
      const { error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (loginError) throw loginError;

      navigate("/dashboard");
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ mt: 8, textAlign: "center" }}>
        <CircularProgress />
        <Typography mt={2}>Setting up your session...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3, boxShadow: 2, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Set Your Password
      </Typography>

      <Typography variant="body2" sx={{ mb: 2 }}>
        Email: <strong>{email || "Not available"}</strong>
      </Typography>

      <TextField
        fullWidth
        type="password"
        label="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />

      {msg && (
        <Alert severity={msg.startsWith("❌") ? "error" : "success"}>{msg}</Alert>
      )}

      <Button
        variant="contained"
        fullWidth
        onClick={handleSetPassword}
        disabled={loading}
      >
        Save Password and Continue
      </Button>
    </Box>
  );
}

export default Verify;
