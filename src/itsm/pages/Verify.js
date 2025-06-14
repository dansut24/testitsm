import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

function Verify() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const setSession = async () => {
      const hash = window.location.hash;
      if (!hash.includes("access_token")) {
        setMessage("❌ Invalid verification link");
        setLoading(false);
        return;
      }

      const params = new URLSearchParams(hash.slice(1));
      const access_token = params.get("access_token");

      if (!access_token) {
        setMessage("❌ Missing access token");
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.setSession({
        access_token,
        refresh_token: params.get("refresh_token"),
      });

      if (error) {
        setMessage(`❌ ${error.message}`);
        setLoading(false);
        return;
      }

      setUserEmail(data?.user?.email || "");
      setLoading(false);
    };

    setSession();
  }, []);

  const handleSetPassword = async () => {
    setLoading(true);
    setMessage("");

    const { data: updateUser, error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(`❌ ${error.message}`);
    } else {
      setMessage("✅ Password set successfully! Redirecting...");
      setTimeout(() => navigate("/dashboard"), 2000);
    }

    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 10 }}>
      <Typography variant="h5" gutterBottom>
        Set Your Password
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : (
        <>
          {message && <Alert sx={{ mb: 2 }} severity={message.startsWith("✅") ? "success" : "error"}>{message}</Alert>}
          <Typography variant="body2" gutterBottom>
            Email: <strong>{userEmail || "Not available"}</strong>
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" fullWidth onClick={handleSetPassword} disabled={!password || loading}>
            Set Password
          </Button>
        </>
      )}
    </Box>
  );
}

export default Verify;
