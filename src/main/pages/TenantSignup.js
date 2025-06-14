import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { supabaseClient } from "../../common/utils/supabaseClient";

const TenantSignup = () => {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleCompanyChange = (value) => {
    setCompany(value);
    const cleaned = value
      .toLowerCase()
      .replace(/\s+/g, "")
      .replace(/[^a-z0-9]/g, "");
    setSubdomain(cleaned);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    const domain = `${subdomain}-itsm.hi5tech.co.uk`;

    const { data, error: signupError } = await supabaseClient.auth.signUp({
      email,
      options: {
        emailRedirectTo: `https://${domain}/verify`,
      },
    });

    if (signupError) {
      setError(signupError.message);
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabaseClient.from("tenants").insert({
      name,
      company_name: company,
      domain,
      subdomain,
      email,
    });

    if (insertError) {
      setError("Tenant created but domain setup failed: " + insertError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Typography variant="h4" gutterBottom>
        Get Started with Hi5Tech
      </Typography>
      <Typography variant="subtitle1" sx={{ mb: 4 }}>
        Set up your company portal in under a minute.
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Tenant created! Please check your email to verify your account.
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <TextField
          fullWidth
          label="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Company Name"
          value={company}
          onChange={(e) => handleCompanyChange(e.target.value)}
          required
          margin="normal"
        />
        <TextField
          fullWidth
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          margin="normal"
        />
        <Box sx={{ display: "flex", alignItems: "center", mt: 2 }}>
          <TextField
            label="Subdomain"
            value={subdomain}
            disabled
            sx={{ flex: 1 }}
          />
          <Typography sx={{ ml: 2 }}>-itsm.hi5tech.co.uk</Typography>
        </Box>

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 4 }}
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Create Tenant"}
        </Button>
      </Box>
    </Container>
  );
};

export default TenantSignup;
