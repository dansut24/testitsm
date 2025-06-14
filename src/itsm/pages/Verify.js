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

function Verify() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  // Get current user session to retrieve email
  useEffect(() => {
    const fetchUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();
      if (user && user.email) {
        setEmail(user.email);
      } else {
        setMsg("❌ Unable to get user email from session.");
      }
    };
    fetchUser();
  }, []);

  const handleSetPassword = async () => {
    setLoading(true);
    setMsg("");

    try {
      if (!password || password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      // Set password
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) throw updateError;

      // Sign in immediately after setting password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;

      // Redirect to dashboard
      navigate("/dashboard");
    } catch (err) {
      setMsg(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3, boxShadow: 2, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        Set Your Password
      </Typography>

      <Typography variant="body1" sx={{ mb: 2 }}>
        Email: <strong>{email || "Loading..."}</strong>
      </Typography>

      <TextField
        fullWidth
        type="password"
        label="New Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
        required
      />

      {msg && <Alert severity={msg.startsWith("❌") ? "error" : "success"}>{msg}</Alert>}

      <Button
        variant="contained"
        fullWidth
        onClick={handleSetPassword}
        disabled={loading}
      >
        {loading ? <CircularProgress size={22} /> : "Save Password and Continue"}
      </Button>
    </Box>
  );
}

export default Verify;
