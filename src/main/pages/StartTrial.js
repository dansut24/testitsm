// src/pages/StartTrial.js

import React, { useState } from "react";
import {
  Container, Paper, Typography, TextField, Button, Box, InputAdornment
} from "@mui/material";

const StartTrial = () => {
  const [companyName, setCompanyName] = useState("");
  const [subdomain, setSubdomain] = useState("");

  const handleCompanyChange = (e) => {
    const name = e.target.value;
    setCompanyName(name);

    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    setSubdomain(slug);
  };

  const handleSubdomainChange = (e) => {
    const input = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "");
    setSubdomain(input);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fullDomain = `${subdomain}-itsm.hi5tech.co.uk`;
    alert(`Trial started for: ${fullDomain}`);
    // TODO: POST to backend, provision project etc
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Paper elevation={4} sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Start Your Free Trial
        </Typography>

        <Typography variant="body2" color="text.secondary" mb={3}>
          Get your own ITSM instance in seconds. Just tell us your company name.
        </Typography>

        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Company Name"
            value={companyName}
            onChange={handleCompanyChange}
            margin="normal"
            required
          />

          <TextField
            fullWidth
            label="Your Domain"
            value={subdomain}
            onChange={handleSubdomainChange}
            margin="normal"
            required
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  -itsm.hi5tech.co.uk
                </InputAdornment>
              ),
            }}
            helperText="You can customise the first part, but the domain will always end with -itsm.hi5tech.co.uk"
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{ mt: 3 }}
          >
            Start Trial
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default StartTrial;
