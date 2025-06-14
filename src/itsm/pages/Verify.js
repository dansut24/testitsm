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
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    const confirmSession = async () => {
      const url = window.location.href;
      const { data, error } = await supabase.auth.exchangeCodeForSession(url);

      if (error) {
        console.error(error);
        setError(error.message);
        setStatus("error");
      } else {
        setEmail(data?.user?.email);
        setStatus("verified");
      }
    };

    confirmSession();
  }, []);

  const handleSetPassword = async () => {
    setStatus("setting");

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setStatus("verified");
    } else {
      navigate("/dashboard");
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      {status === "loading" && <CircularProgress />}
      {status === "error" && <Alert severity="error">❌ {error}</Alert>}
      {status === "verified" && (
        <>
          <Typography variant="h5" gutterBottom>
            Set Your Password
          </Typography>
          <Typography variant="body2" sx={{ mb: 2 }}>
            Email: <strong>{email || "Unknown"}</strong>
          </Typography>
          <TextField
            fullWidth
            label="New Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleSetPassword}
            disabled={!password}
          >
            Set Password
          </Button>
        </>
      )}
      {status === "setting" && <CircularProgress />}
    </Box>
  );
}

export default Verify;
