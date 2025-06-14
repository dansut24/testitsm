import React, { useState } from "react";
import {
  Box, Button, TextField, Typography, Alert, CircularProgress,
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
    if (name === "company") {
      updatedForm.subdomain = value.replace(/\s+/g, "").toLowerCase();
    }
    setForm(updatedForm);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const fullDomain = `${form.subdomain}-itsm.hi5tech.co.uk`;

      // Create tenant
      const { error: tenantError } = await supabase.from("tenants").insert({
        name: form.company,
        domain: fullDomain,
        subdomain: form.subdomain,
      });
      if (tenantError) throw tenantError;

      // Send magic link
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: {
          emailRedirectTo: `https://${form.subdomain}-itsm.hi5tech.co.uk/verify`,
          data: {
            name: form.name,
            subdomain: form.subdomain,
          },
        },
      });
      if (otpError) throw otpError;

      setMessage("✅ Tenant created! Please check your email for a login link.");
    } catch (error) {
      setMessage(`❌ ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 500, mx: "auto", mt: 8, p: 3, boxShadow: 2, borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>Create Your Tenant</Typography>
      <form onSubmit={handleSubmit}>
        <TextField fullWidth name="name" label="Your Name" value={form.name} onChange={handleChange} required sx={{ mb: 2 }} />
        <TextField fullWidth name="company" label="Company Name" value={form.company} onChange={handleChange} required sx={{ mb: 2 }} />
        <TextField fullWidth name="email" label="Email Address" value={form.email} onChange={handleChange} type="email" required sx={{ mb: 2 }} />
        <TextField fullWidth name="subdomain" label="Subdomain" value={form.subdomain} onChange={handleChange} required sx={{ mb: 1 }} />
        <Typography variant="body2" sx={{ mb: 2 }}>Your site will be: <strong>{form.subdomain || "yourcompany"}-itsm.hi5tech.co.uk</strong></Typography>
        {message && <Alert severity={message.startsWith("✅") ? "success" : "error"}>{message}</Alert>}
        <Button type="submit" fullWidth variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={22} /> : "Create Tenant"}
        </Button>
      </form>
    </Box>
  );
}

export default TenantSignup;
