// src/main/pages/TenantSignup.js
import React, { useState } from "react";
import { Button, TextField, Typography, Box, Alert } from "@mui/material";
import supabase from "../../common/utils/supabase";

export default function TenantSignup() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const handleSendMagicLink = async () => {
    setStatus("sending");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  return (
    <Box maxWidth={400} mx="auto" mt={8}>
      <Typography variant="h5" gutterBottom>
        Start Your Tenant Setup
      </Typography>
      {status === "sent" ? (
        <Alert severity="success">
          A verification link has been sent to your email. Please check your inbox.
        </Alert>
      ) : (
        <>
          <TextField
            fullWidth
            label="Work Email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleSendMagicLink}
            disabled={status === "sending"}
          >
            {status === "sending" ? "Sending..." : "Send Magic Link"}
          </Button>
          {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        </>
      )}
    </Box>
  );
}
