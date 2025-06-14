import React, { useEffect, useState } from "react";
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
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data?.user?.email_confirmed_at) {
        setMsg("Waiting for email confirmation...");
        await supabase.auth.refreshSession();
      }
    };
    checkUser();
  }, []);

  const handleSetPassword = async () => {
    setLoading(true);
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.updateUser({
        password,
      });
      if (sessionError) throw sessionError;

      navigate("/dashboard");
    } catch (err) {
      setMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 400, mx: "auto", mt: 8 }}>
      <Typography variant="h5" gutterBottom>
        Set Your Password
      </Typography>
      <TextField
        label="New Password"
        type="password"
        fullWidth
        sx={{ mt: 2 }}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {msg && <Alert severity="info" sx={{ mt: 2 }}>{msg}</Alert>}
      <Button
        variant="contained"
        sx={{ mt: 2 }}
        fullWidth
        onClick={handleSetPassword}
        disabled={loading}
      >
        {loading ? <CircularProgress size={22} /> : "Save & Continue"}
      </Button>
    </Box>
  );
}

export default Verify;
