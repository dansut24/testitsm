import React, { useState } from "react";
import { supabase } from "../../utils/supabaseClient";
import { Box, Button, TextField, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ControlLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      const redirect = new URLSearchParams(window.location.search).get("redirect");
      navigate(redirect || "/");
    }
  };

  return (
    <Box sx={{ mt: 8, maxWidth: 400, mx: "auto" }}>
      <Typography variant="h5" gutterBottom>
        HI5Tech Control Login
      </Typography>
      {errorMsg && (
        <Typography color="error" sx={{ mb: 2 }}>
          {errorMsg}
        </Typography>
      )}
      <TextField
        label="Email"
        fullWidth
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        label="Password"
        fullWidth
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ mb: 2 }}
      />
      <Button fullWidth variant="contained" onClick={handleLogin}>
        Sign In
      </Button>
    </Box>
  );
}
