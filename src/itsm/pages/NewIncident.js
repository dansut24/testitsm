// src/itsm/pages/NewIncident.js
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
import { supabase } from "../../common/utils/supabaseClient";

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

  // simple 2-step visual, but everything is on one page now
  const [step] = useState(2);

  const [formData, setFormData] = useState({
    customer_name: "",
    title: "",
    description: "",
    category: "",
    priority: "",
    asset_tag: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  // --- EMAIL NOTIFICATION (optional, non-blocking) ---
  const sendNotificationEmail = async (incident, agentUser) => {
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "incident",
          subject: `New Incident Submitted - ${incident.reference}`,
          reference: incident.reference,
          title: incident.title,
          description: incident.description,
          priority: incident.priority,
          category: incident.category,
          status: incident.status,
          customer_name: incident.customer_name,
          submittedBy:
            agentUser?.username || agentUser?.email || incident.submitted_by,
        }),
      });
    } catch (err) {
      console.error("Email notification error:", err);
      // Do not block incident creation on email failure
    }
  };

  // --- SUBMIT INCIDENT TO SUPABASE ---
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    if (!formData.customer_name) {
      setError("Please enter the customer name.");
      setSubmitting(false);
      return;
    }

    if (
      !formData.title ||
      !formData.description ||
      !formData.category ||
      !formData.priority
    ) {
      setError("Please complete all required fields.");
      setSubmitting(false);
      return;
    }

    try {
      // 1) Get next reference string from RPC
      const { data: refData, error: refErr } = await supabase.rpc(
        "get_next_incident_reference"
      );
      if (refErr) throw refErr;

      const reference =
        typeof refData === "string"
          ? refData
          : refData?.reference || refData?.reference_number;

      if (!reference) {
        throw new Error(
          "Could not generate incident reference number (check RPC)."
        );
      }

      // 2) Look up SLA for chosen priority
      let sla_due = null;
      try {
        const { data: sla, error: slaError } = await supabase
          .from("sla_settings")
          .select("duration_minutes")
          .eq("priority", formData.priority)
          .maybeSingle();

        if (slaError) {
          console.warn("SLA lookup error:", slaError);
        } else if (sla && sla.duration_minutes) {
          const now = new Date();
          sla_due = new Date(
            now.getTime() + sla.duration_minutes * 60000
          ).toISOString();
        }
      } catch (slaErr) {
        console.warn("SLA calculation error:", slaErr);
      }

      // 3) Get current portal user (agent) from localStorage
      const agentUser = JSON.parse(localStorage.getItem("user") || "null");
      const submitted_by =
        agentUser?.username || agentUser?.email || "unknown";

      // 4) Insert into incidents table using your REAL column names
      const { data, error: insertError } = await supabase
        .from("incidents")
        .insert([
          {
            reference,
            title: formData.title,
            description: formData.description,
            priority: formData.priority,
            category: formData.category,
            status: "Open",
            submitted_by,
            customer_name: formData.customer_name,
            asset_tag: formData.asset_tag || null,
            sla_due,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 5) Fire email notification (non-blocking failure)
      await sendNotificationEmail(data, agentUser);

      // 6) Navigate to incident detail page
      navigate(`/incidents/${data.id}`, {
        state: { tabName: data.reference },
      });
    } catch (err) {
      console.error("Incident submit error:", err);
      setError(err?.message || "There was a problem submitting the incident.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: 680, mx: "auto", position: "relative" }}>
      <Typography variant="h5" gutterBottom>
        Raise New Incident
      </Typography>

      {/* STEP 2: INCIDENT DETAILS (we keep the visual stepper for style) */}
      <Fade in>
        <Box sx={{ position: "relative", mt: 2 }}>
          <StepIndicator step={2} active={step === 2} />
          <Paper elevation={3} sx={{ pt: 4, pb: 2, px: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Incident Details
            </Typography>

            <TextField
              required
              fullWidth
              label="Customer Name"
              value={formData.customer_name}
              onChange={handleChange("customer_name")}
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              label="Incident Title"
              value={formData.title}
              onChange={handleChange("title")}
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={handleChange("description")}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Asset Tag (optional)"
              value={formData.asset_tag}
              onChange={handleChange("asset_tag")}
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              select
              label="Category"
              value={formData.category}
              onChange={handleChange("category")}
              sx={{ mb: 2 }}
            >
              {categoryOptions.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              required
              fullWidth
              select
              label="Priority"
              value={formData.priority}
              onChange={handleChange("priority")}
              sx={{ mb: 2 }}
            >
              {priorityOptions.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Submit Incident"
              )}
            </Button>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default NewIncident;
