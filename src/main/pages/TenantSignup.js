import React, { useState } from "react";
import { supabase } from "../../common/utils/supabaseClient";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";

const TenantSignup = () => {
  const [companyName, setCompanyName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSignup = async () => {
    setLoading(true);
    setError("");

    const subdomain = companyName.toLowerCase().replace(/\s+/g, "");
    const fullDomain = `${subdomain}-itsm.hi5tech.co.uk`;

    const { error: signUpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `https://${fullDomain}/verify`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSent(true);
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm">
      <Box mt={6} p={4} borderRadius={2} boxShadow={3}>
        <Typography variant="h5" gutterBottom>
          Set up your Hi5Tech workspace
        </Typography>

        {sent ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            Check your inbox for a verification link.
          </Alert>
        ) : (
          <>
            <TextField
              fullWidth
              label="Company Name"
              margin="normal"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Work Email"
              margin="normal"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
                onClick={handleSignup}
                disabled={loading || !companyName || !email}
              >
                {loading ? <CircularProgress size={24} /> : "Send Magic Link"}
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};

export default TenantSignup;
