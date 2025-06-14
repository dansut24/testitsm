import React, { useState } from "react";
import { Box, Button, Container, TextField, Typography, CircularProgress } from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";

const TenantSignup = () => {
  const [email, setEmail] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleCompanyChange = (e) => {
    const name = e.target.value;
    setCompanyName(name);
    setSubdomain(name.toLowerCase().replace(/\s+/g, ""));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const redirectUrl = `https://${subdomain}-itsm.hi5tech.co.uk/setup`;

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Get Started with Hi5Tech
      </Typography>

      {sent ? (
        <Typography>
          ✅ Check your email for a verification link. It will redirect you to complete setup at{" "}
          <strong>{subdomain}-itsm.hi5tech.co.uk</strong>.
        </Typography>
      ) : (
        <form onSubmit={handleSignup}>
          <TextField
            fullWidth
            label="Company Name"
            margin="normal"
            value={companyName}
            onChange={handleCompanyChange}
            required
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Subdomain"
            value={`${subdomain}-itsm.hi5tech.co.uk`}
            margin="normal"
            disabled
          />
          {error && (
            <Typography color="error" sx={{ mt: 1 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Send Verification Link"}
          </Button>
        </form>
      )}
    </Container>
  );
};

export default TenantSignup;
