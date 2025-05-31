import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Fade,
  MenuItem,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { supabase } from "../supabaseClient";
import sendgrid from "@sendgrid/mail";

sendgrid.setApiKey(import.meta.env.VITE_SENDGRID_API_KEY);

const StepIndicator = ({ step, active }) => (
  <Box
    sx={{
      width: 40,
      height: 40,
      borderRadius: "50%",
      border: active ? "4px solid #4caf50" : "2px solid #ccc",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontWeight: "bold",
      fontSize: 18,
      color: active ? "#4caf50" : "#777",
      backgroundColor: "#fff",
      position: "absolute",
      top: -22,
      left: -22,
      zIndex: 1,
    }}
  >
    {step}
  </Box>
);

const categoryOptions = ["Hardware", "Software", "Network", "Access", "Other"];
const priorityOptions = ["Low", "Medium", "High", "Critical"];

const NewIncident = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    asset_tag: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCustomerSearch = () => {
    setSelectedCustomer({ name: customerQuery });
    setStep(2);
  };

  const sendNotificationEmail = async (incident) => {
    const htmlContent = `
      <div style="font-family: sans-serif; line-height: 1.5;">
        <h2 style="color: #4caf50;">New Incident Submitted</h2>
        <p><strong>Reference:</strong> ${incident.reference}</p>
        <p><strong>Title:</strong> ${incident.title}</p>
        <p><strong>Description:</strong> ${incident.description}</p>
        <p><strong>Priority:</strong> ${incident.priority}</p>
        <p><strong>Category:</strong> ${incident.category}</p>
        <p><strong>Asset Tag:</strong> ${incident.asset_tag || "N/A"}</p>
        <p><strong>Customer:</strong> ${incident.customer_name}</p>
        <p><strong>Submitted By:</strong> ${incident.submitted_by}</p>
        <hr />
        <p style="font-size: 12px; color: #888;">This is an automated notification from Hi5Tech ITSM.</p>
      </div>
    `;

    await sendgrid.send({
      to: "danieljamessutton18@outlook.com",
      from: "notifications@hi5tech.co.uk",
      subject: `New Incident: ${incident.reference}`,
      html: htmlContent,
    });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    if (!formData.title || !formData.description || !formData.category || !formData.priority) {
      setError("Please complete all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      const { data: refData, error: refErr } = await supabase.rpc("get_next_incident_reference");
      if (refErr) throw refErr;

      const reference = refData;
      const user = JSON.parse(localStorage.getItem("user"));

      const { data, error: insertError } = await supabase
        .from("incidents")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            reference,
            asset_tag: formData.asset_tag || null,
            customer_name: selectedCustomer?.name || "",
            submitted_by: user?.username || "unknown",
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      await sendNotificationEmail({
        ...formData,
        reference,
        customer_name: selectedCustomer?.name || "",
        submitted_by: user?.username || "unknown",
      });

      navigate(`/incidents/${data.id}`, { state: { tabName: reference } });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: 600, mx: "auto", position: "relative" }}>
      <Typography variant="h5" gutterBottom>
        Raise New Incident
      </Typography>
      <Box sx={{ position: "relative", mb: 5 }}>
        <StepIndicator step={1} active={step >= 1} />
        <Paper elevation={3} sx={{ pt: 4, pb: 2, px: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Step 1: Search for Customer
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              label="Customer Name or Email"
              value={customerQuery}
              onChange={(e) => setCustomerQuery(e.target.value)}
            />
            <Button variant="contained" onClick={handleCustomerSearch}>
              Search
            </Button>
          </Box>
          {selectedCustomer && (
            <Typography sx={{ mt: 1 }} color="text.secondary">
              Selected: {selectedCustomer.name}
            </Typography>
          )}
        </Paper>
      </Box>

      <Fade in={step >= 2}>
        <Box sx={{ position: "relative" }}>
          <StepIndicator step={2} active={step === 2} />
          <Paper elevation={3} sx={{ pt: 4, pb: 2, px: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Step 2: Incident Details
            </Typography>
            <TextField required fullWidth label="Incident Title" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} sx={{ mb: 2 }} />
            <TextField required fullWidth multiline rows={4} label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} sx={{ mb: 2 }} />
            <TextField required fullWidth select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} sx={{ mb: 2 }}>
              {categoryOptions.map((cat) => (
                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
              ))}
            </TextField>
            <TextField required fullWidth select label="Priority" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })} sx={{ mb: 2 }}>
              {priorityOptions.map((level) => (
                <MenuItem key={level} value={level}>{level}</MenuItem>
              ))}
            </TextField>
            <TextField fullWidth label="Asset Tag (optional)" value={formData.asset_tag} onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })} sx={{ mb: 2 }} />
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            <Button variant="contained" fullWidth onClick={handleSubmit} disabled={submitting}>
              {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Incident"}
            </Button>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default NewIncident;
