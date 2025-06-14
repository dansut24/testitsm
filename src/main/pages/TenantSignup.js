import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";

function TenantSignup() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    subdomain: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = {
      ...form,
      [name]: value,
    };

    // Auto-fill subdomain based on company name
    if (name === "company") {
      updatedForm.subdomain = value.replace(/\s+/g, "").toLowerCase();
    }

    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // Validate subdomain
    const subdomain = form.subdomain?.replace(/[^a-z0-9]/gi, "").toLowerCase();
    if (!subdomain || subdomain.length < 3) {
      setMessage("❌ Please provide a valid subdomain.");
      setLoading(false);
      return;
    }

    const fullDomain = `${subdomain}-itsm.hi5tech.co.uk`;
    const redirectToUrl = `https://${subdomain}-itsm.hi5tech.co.uk/verify`;

    try {
      // Insert tenant record
      const { error: tenantError } = await supabase.from("tenants").insert({
        name: form.company,
        domain: fullDomain,
        subdomain: subdomain,
      });

      if (tenantError) throw tenantError;

      // Send OTP email with redirect
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: {
          emailRedirectTo: redirectToUrl,
          data: { name: form.name },
        },
      });

      if (otpError) throw otpError;

      setMessage(
        "✅ Tenant created! Check your email to verify and set your password."
      );
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ maxWidth: 500, mx: "auto", mt: 8, p: 3, boxShadow: 2, borderRadius: 2 }}
    >
      <Typography variant="h5" gutterBottom>
        Create Your Tenant
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="Your Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Company Name"
          name="company"
          value={form.company}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Email Address"
          name="email"
          type="email"
          value={form.email}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          fullWidth
          label="Subdomain"
          name="subdomain"
          value={form.subdomain}
          onChange={handleChange}
          sx={{ mb: 1 }}
          required
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your portal will be accessible at:{" "}
          <strong>
            {form.subdomain ? form.subdomain : "yourcompany"}-itsm.hi5tech.co.uk
          </strong>
        </Typography>

        {message && (
          <Alert severity={message.startsWith("✅") ? "success" : "error"}>
            {message}
          </Alert>
        )}

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={22} /> : "Create Tenant"}
        </Button>
      </form>
    </Box>
  );
}

export default TenantSignup;
