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
    logo: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    const updatedForm = { ...form, [name]: value };

    if (name === "company") {
      updatedForm.subdomain = value.replace(/\s+/g, "").toLowerCase();
    }

    setForm(updatedForm);
  };

  const handleFileChange = (e) => {
    setForm({ ...form, logo: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const domain = `${form.subdomain}-itsm.hi5tech.co.uk`;

    try {
      // Create tenant first
      const { data: tenantData, error: tenantError } = await supabase
        .from("tenants")
        .insert({
          name: form.company,
          subdomain: form.subdomain,
          domain: domain,
        })
        .select()
        .single();

      if (tenantError) throw tenantError;

      // Upload logo to Supabase Storage
      if (form.logo) {
        const filePath = `${form.subdomain}-itsm/logo.png`;
        const { error: uploadError } = await supabase.storage
          .from("tenant-logos")
          .upload(filePath, form.logo, { upsert: true });

        if (uploadError) throw uploadError;

        // Save logo URL in tenant_settings
        const { error: settingsError } = await supabase
          .from("tenant_settings")
          .insert({
            tenant_id: tenantData.id,
            logo_url: `https://ciilmjntkujdhxtsmsho.supabase.co/storage/v1/object/public/tenant-logos/${filePath}`,
          });

        if (settingsError) throw settingsError;
      }

      // Send magic link
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: form.email,
        options: {
          emailRedirectTo: `https://${form.subdomain}-itsm.hi5tech.co.uk/verify`,
        },
      });

      if (magicError) throw magicError;

      setMessage("✅ Tenant created and magic link sent! Check your email.");
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{ maxWidth: 500, mx: "auto", mt: 8, p: 3, boxShadow: 2, borderRadius: 2 }}
    >
      <Typography variant="h5" gutterBottom>
        Sign up to Hi5Tech ITSM
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
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          type="email"
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
        <Typography variant="body2" sx={{ mb: 2 }}>
          Your portal will be:{" "}
          <strong>{form.subdomain || "yourcompany"}-itsm.hi5tech.co.uk</strong>
        </Typography>
        <Button component="label" variant="outlined" sx={{ mb: 2 }}>
          Upload Logo
          <input type="file" hidden accept="image/*" onChange={handleFileChange} />
        </Button>

        {message && (
          <Alert severity={message.startsWith("✅") ? "success" : "error"} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        <Button
          fullWidth
          type="submit"
          variant="contained"
          disabled={loading}
        >
          {loading ? <CircularProgress size={24} /> : "Create Tenant"}
        </Button>
      </form>
    </Box>
  );
}

export default TenantSignup;
