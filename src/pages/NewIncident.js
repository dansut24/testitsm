import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Paper,
  Fade,
  MenuItem
} from "@mui/material";
import { useNavigate } from "react-router-dom"; // ✅ Add this
import { supabase } from "../supabaseClient";

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

const NewIncident = () => {
  const navigate = useNavigate(); // ✅ Add this
  const [step, setStep] = useState(1);
  const [customerQuery, setCustomerQuery] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    asset_tag: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleCustomerSearch = () => {
    setSelectedCustomer({ name: customerQuery });
    setStep(2);
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      // Get next reference from Supabase function
      const { data: refData, error: refErr } = await supabase.rpc("get_next_incident_reference");
      if (refErr) throw refErr;

      const reference = refData;

      const { data, error } = await supabase
        .from("incidents")
        .insert([
          {
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            asset_tag: formData.asset_tag,
            reference,
            customer_name: selectedCustomer.name,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      navigate(`/incidents/${data.id}`, { state: { tabName: reference } });
    } catch (err) {
      console.error("Failed to raise incident:", err.message);
      setError(err.message || "Failed to raise incident");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: 600, mx: "auto", position: "relative" }}>
      <Typography variant="h5" gutterBottom>
        Raise New Incident
      </Typography>

      {/* Step 1 */}
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

      {/* Step 2 */}
      <Fade in={step >= 2}>
        <Box sx={{ position: "relative" }}>
          <StepIndicator step={2} active={step === 2} />
          <Paper elevation={3} sx={{ pt: 4, pb: 2, px: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Step 2: Incident Details
            </Typography>
            <TextField
              fullWidth
              label="Incident Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              sx={{ mb: 2 }}
            >
              <MenuItem value="Low">Low</MenuItem>
              <MenuItem value="Medium">Medium</MenuItem>
              <MenuItem value="High">High</MenuItem>
              <MenuItem value="Critical">Critical</MenuItem>
            </TextField>
            <TextField
              fullWidth
              label="Asset Tag (optional)"
              value={formData.asset_tag}
              onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })}
              sx={{ mb: 2 }}
            />
            {error && <Typography color="error">{error}</Typography>}
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit"}
            </Button>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default NewIncident;
