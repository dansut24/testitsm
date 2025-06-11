import React, { useState } from "react";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../common/utils/supabaseClient";

const Signup = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
  });
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSignup = async () => {
    setError("");
    setSuccessMsg("");

    const { email, password, full_name } = formData;

    if (!email || !password || !full_name) {
      setError("Please fill in all fields.");
      return;
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError || !data.user) {
      setError(signUpError.message || "Signup failed.");
      return;
    }

    // Insert into profiles table
    const { error: profileError } = await supabase.from("profiles").insert({
      id: data.user.id,
      full_name,
      role: "user", // Default role; can be 'admin' manually later
    });

    if (profileError) {
      setError("Signup succeeded but profile creation failed.");
      return;
    }

    setSuccessMsg("Account created successfully! Please log in.");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Paper elevation={4} sx={{ p: 4, textAlign: "center", borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Create Your Account
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Sign up for a Hi5Tech workspace
        </Typography>

        <Stack spacing={2}>
          <TextField
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            fullWidth
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            fullWidth
          />
        </Stack>

        {error && (
          <Typography color="error" mt={2}>
            {error}
          </Typography>
        )}
        {successMsg && (
          <Typography color="primary" mt={2}>
            {successMsg}
          </Typography>
        )}

        <Button
          variant="contained"
          sx={{ mt: 3, py: 1.2 }}
          fullWidth
          onClick={handleSignup}
        >
          Sign Up
        </Button>
      </Paper>

      <Typography
        variant="caption"
        display="block"
        align="center"
        sx={{ mt: 3, color: "text.secondary" }}
      >
        Already have an account? <strong onClick={() => navigate("/login")} style={{ cursor: "pointer", textDecoration: "underline" }}>Login</strong>
      </Typography>
    </Container>
  );
};

export default Signup;
