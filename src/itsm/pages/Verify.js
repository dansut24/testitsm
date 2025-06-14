import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

function Verify() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const getSession = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.email) {
        setMessage("❌ Unable to fetch user session or email.");
        return;
      }
      setEmail(data.user.email);
    };
    getSession();
  }, []);

  const handlePasswordSubmit = async () => {
    if (!password) return setMessage("❌ Enter a password");

    setSubmitting(true);
    setMessage("");

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setMessage("✅ Password set. Logging you in...");

      // Refresh session to ensure user is logged in
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;

      navigate("/dashboard");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8, p: 3, boxShadow: 2, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>Set Your Password</Typography>
      <Typography variant="body2" sx={{ mb: 2 }}>Email: <strong>{email || "Loading..."}</strong></Typography>

      <TextField
        fullWidth
        label="New Password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />

      {message && <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 2 }}>{message}</Alert>}

      <Button
        fullWidth
        variant="contained"
        onClick={handlePasswordSubmit}
        disabled={submitting}
      >
        {submitting ? <CircularProgress size={24} /> : "Set Password & Login"}
      </Button>
    </Box>
  );
}

export default Verify;
