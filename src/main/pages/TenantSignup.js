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
    const updated = { ...form, [name]: value };

    if (name === "company") {
      updated.subdomain = value.replace(/\s+/g, "").toLowerCase();
    }

    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const fullDomain = `${form.subdomain}-itsm.hi5tech.co.uk`;

    try {
      // Send OTP email magic link
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: {
          data: { name: form.name },
          emailRedirectTo: `https://${form.subdomain}-itsm.hi5tech.co.uk/verify`,
        },
      });

      if (otpError) throw otpError;

      // Create the tenant
      const { error: tenantError } = await supabase.from("tenants").insert({
        name: form.company,
        domain: fullDomain,
        subdomain: form.subdomain,
      });

      if (tenantError) throw tenantError;

      setMessage("✅ Tenant created! Check your inbox to verify your email.");
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
        <TextField fullWidth label="Your Name" name="name" value={form.name} onChange={handleChange} sx={{ mb: 2 }} required />
        <TextField fullWidth label="Company Name" name="company" value={form.company} onChange={handleChange} sx={{ mb: 2 }} required />
        <TextField fullWidth label="Email Address" name="email" type="email" value={form.email} onChange={handleChange} sx={{ mb: 2 }} required />
        <TextField fullWidth label="Subdomain" name="subdomain" value={form.subdomain} onChange={handleChange} sx={{ mb: 1 }} required />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your portal will be: <strong>{form.subdomain || "yourcompany"}-itsm.hi5tech.co.uk</strong>
        </Typography>

        {message && <Alert severity={message.startsWith("✅") ? "success" : "error"}>{message}</Alert>}

        <Button fullWidth type="submit" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={22} /> : "Create Tenant"}
        </Button>
      </form>
    </Box>
  );
}

export default TenantSignup;
