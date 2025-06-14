// src/itsm/pages/Verify.js
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

const Verify = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const init = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        setError("❌ Invalid or expired verification link.");
        setLoading(false);
        return;
      }

      setUserEmail(data.user.email);
      setLoading(false);
    };

    init();
  }, []);

  const handleSubmit = async () => {
    if (!password) return;

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(`❌ ${updateError.message}`);
    } else {
      navigate("/dashboard");
    }

    setLoading(false);
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Set Your Password
      </Typography>

      {loading ? (
        <CircularProgress />
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <>
          <Typography sx={{ mb: 2 }}>Email: <strong>{userEmail}</strong></Typography>
          <TextField
            fullWidth
            type="password"
            label="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" fullWidth onClick={handleSubmit}>
            Set Password & Continue
          </Button>
        </>
      )}
    </Box>
  );
};

export default Verify;
