import React, { useState } from "react";
import {
  Box, Button, TextField, Typography, Alert, CircularProgress
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";

function TenantSignup() {
  const [form, setForm] = useState({
    name: "",
    company: "",
    email: "",
    subdomain: "",
  });
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };

    if (name === "company") {
      updated.subdomain = value.toLowerCase().replace(/\s+/g, "");
    }

    setForm(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const domain = `${form.subdomain}-itsm.hi5tech.co.uk`;

    try {
      // 1. Insert tenant
      const { error: tenantError } = await supabase.from("tenants").insert({
        name: form.company,
        subdomain: form.subdomain,
        domain: domain,
      });
      if (tenantError) throw tenantError;

      // 2. Send magic link
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: {
          emailRedirectTo: `https://${form.subdomain}-itsm.hi5tech.co.uk/verify`,
          data: { name: form.name, company: form.company },
        },
      });
      if (otpError) throw otpError;

      setMessage("✅ Tenant created. Check your email to verify and access your ITSM portal.");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", mt: 8, p: 3, borderRadius: 2, boxShadow: 2 }}>
      <Typography variant="h5" gutterBottom>Create Your ITSM Portal</Typography>

      <form onSubmit={handleSubmit}>
        <TextField
          label="Your Name"
          name="name"
          fullWidth
          value={form.name}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          label="Company Name"
          name="company"
          fullWidth
          value={form.company}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          label="Email Address"
          name="email"
          type="email"
          fullWidth
          value={form.email}
          onChange={handleChange}
          sx={{ mb: 2 }}
          required
        />
        <TextField
          label="Subdomain"
          name="subdomain"
          fullWidth
          value={form.subdomain}
          onChange={handleChange}
          sx={{ mb: 1 }}
          required
        />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Your portal will be at: <strong>{form.subdomain || "yourcompany"}-itsm.hi5tech.co.uk</strong>
        </Typography>

        {message && (
          <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : "Create Portal"}
        </Button>
      </form>
    </Box>
  );
}

export default TenantSignup;
