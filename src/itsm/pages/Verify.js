import React, { useState, useEffect } from "react";
import {
  Box,
  Button,
  Container,
  Typography,
  TextField,
  CircularProgress,
  Alert,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

const Verify = () => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!data?.session) {
        setError("No active session found. Please try again.");
      }
      setSessionChecked(true);
    };
    verifySession();
  }, []);

  const handleSetPassword = async () => {
    setLoading(true);
    setError("");

    const { data, error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
    } else {
      navigate("/dashboard"); // or your main ITSM route
    }

    setLoading(false);
  };

  if (!sessionChecked) {
    return (
      <Box mt={8} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="sm">
      <Box mt={6} p={4} borderRadius={2} boxShadow={3}>
        <Typography variant="h5" gutterBottom>
          Set Your Password
        </Typography>
        <TextField
          fullWidth
          label="New Password"
          type="password"
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        <Box mt={3}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleSetPassword}
            disabled={loading || !password}
          >
            {loading ? <CircularProgress size={24} /> : "Continue"}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Verify;
