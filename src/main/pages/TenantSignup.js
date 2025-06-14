import React, { useState } from 'react';
import {
  Container, Typography, TextField, Button, Box, Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../common/utils/supabaseClient';

export default function TenantSignup() {
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignup = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    const { error: signUpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/verify`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setSuccess('Check your inbox for a verification link.');
    }

    setLoading(false);
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Typography variant="h4" gutterBottom>
        Start Your Free Trial
      </Typography>
      <Typography variant="body1" gutterBottom>
        Enter your company name and email to begin.
      </Typography>

      <Box sx={{ mt: 4, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField
          label="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          fullWidth
        />
        <TextField
          label="Work Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
        />

        {error && <Alert severity="error">{error}</Alert>}
        {success && <Alert severity="success">{success}</Alert>}

        <Button
          variant="contained"
          onClick={handleSignup}
          disabled={!email || !companyName || loading}
        >
          {loading ? 'Sending...' : 'Send Verification Link'}
        </Button>
      </Box>
    </Container>
  );
}
