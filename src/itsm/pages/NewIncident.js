// src/itsm/incidents/NewIncident.js
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

  const [step, setStep] = useState(1);

  // STEP 1 – USER (CUSTOMER) SEARCH
  const [userQuery, setUserQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [userLoading, setUserLoading] = useState(false);
  const [userError, setUserError] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // STEP 2 – INCIDENT FORM
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "",
    // asset_tag: "",  // add if you want this on the form
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // --- SEARCH USERS TABLE (ACTING AS CUSTOMER/REQUESTER) ---
  const handleUserSearch = async () => {
    setUserError("");
    setUserLoading(true);
    setUsers([]);
    setSelectedUser(null);

    const query = userQuery.trim();
    if (!query) {
      setUserError("Enter a username or email to search.");
      setUserLoading(false);
      return;
    }

    try {
      const { data, error: supaError } = await supabase
        .from("users")
        .select("id, username, email, full_name")
        .or(`username.ilike.%${query}%,email.ilike.%${query}%`)
        .limit(10);

      if (supaError) throw supaError;

      if (!data || data.length === 0) {
        setUserError("No users found for that search.");
      } else {
        setUsers(data);
        if (data.length === 1) {
          setSelectedUser(data[0]);
          setStep(2);
        }
      }
    } catch (err) {
      console.error("User search error:", err);
      setUserError(
        err?.message || "There was a problem searching for users."
      );
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setStep(2);
  };

  // --- EMAIL NOTIFICATION (Resend via /api/send-email with template) ---
  const sendNotificationEmail = async (
    incident,
    requesterUser,
    agentUser,
    submittedBy
  ) => {
    console.log("[Email] Preparing to send:", {
      incident,
      requesterUser,
      agentUser,
      submittedBy,
    });

    try {
      if (!requesterUser?.email) {
        console.warn("[Email] No requester email → skipping notification");
        return;
      }

      const reference =
        incident.reference ||
        incident.reference_number ||
        incident.referenceNumber;

      const subject =
        reference && incident.title
          ? `Incident ${reference} - ${incident.title}`
          : reference
          ? `New Incident Raised - ${reference}`
          : "New Incident Raised";

      const payload = {
        type: "incident",
        templateKey: "incident_created",

        // 🔥 Backend expects "to"
        to: requesterUser.email,

        // Extra copy if backend ever uses this name
        recipientEmail: requesterUser.email,

        subject,
        reference,
        title: incident.title,
        description: incident.description,
        priority: incident.priority,
        category: incident.category,
        status: incident.status,
        requester:
          requesterUser.username ||
          requesterUser.full_name ||
          requesterUser.email ||
          "Customer",
        submittedBy:
          submittedBy ||
          agentUser?.username ||
          agentUser?.full_name ||
          agentUser?.email ||
          "Service Desk",
      };

      console.log("[Email] Sending payload to /api/send-email:", payload);

      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const raw = await response.text();
      console.log("[Email] Response status:", response.status);
      console.log("[Email] Response body:", raw);

      if (!response.ok) {
        console.error("[Email] send-email failed:", raw);
        // optional UI feedback:
        // alert(`Email failed (${response.status}): ${raw}`);
      }
    } catch (err) {
      console.error("[Email] Frontend error:", err);
      // optional UI feedback:
      // alert(`Frontend email error: ${err.message}`);
    }
  };

  // --- SUBMIT INCIDENT TO SUPABASE ---
  const handleSubmit = async () => {
    setSubmitting(true);
    setError("");

    if (!selectedUser) {
      setError("Please select the user/customer this incident is for.");
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
      // 1) Get next reference number from RPC
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
          "Could not generate incident reference (check get_next_incident_reference RPC)."
        );
      }

      // 2) Look up SLA duration for chosen priority
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

      const submittedBy =
        agentUser?.username ||
        agentUser?.full_name ||
        agentUser?.email ||
        "unknown";

      const customerName =
        selectedUser.username ||
        selectedUser.full_name ||
        selectedUser.email ||
        "Customer";

      // 4) Insert into incidents table
      const { data, error: insertError } = await supabase
        .from("incidents")
        .insert([
          {
            reference,
            title: formData.title,
            description: formData.description,
            category: formData.category,
            priority: formData.priority,
            status: "Open",
            submitted_by: submittedBy,
            customer_name: customerName,
            // asset_tag: formData.asset_tag || null,
            sla_due,
            is_breached: false,
          },
        ])
        .select()
        .single();

      if (insertError) throw insertError;

      // 5) Fire email notification (non-blocking failure)
      await sendNotificationEmail(
        { ...data, reference: data.reference || reference },
        selectedUser,
        agentUser,
        submittedBy
      );

      // 6) Navigate to incident detail page
      navigate(`/incidents/${data.id}`, {
        state: { tabName: reference },
      });
    } catch (err) {
      console.error("Incident submit error:", err);
      setError(err?.message || "There was a problem submitting the incident.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: 600, mx: "auto", position: "relative" }}>
      <Typography variant="h5" gutterBottom>
        Raise New Incident
      </Typography>

      {/* STEP 1: SEARCH USER / CUSTOMER */}
      <Box sx={{ position: "relative", mb: 5 }}>
        <StepIndicator step={1} active={step >= 1} />
        <Paper elevation={3} sx={{ pt: 4, pb: 2, px: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Step 1: Search for User / Customer
          </Typography>
          <Box display="flex" gap={1}>
            <TextField
              fullWidth
              label="Username or Email"
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleUserSearch();
              }}
            />
            <Button
              variant="contained"
              onClick={handleUserSearch}
              disabled={userLoading}
            >
              {userLoading ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                "Search"
              )}
            </Button>
          </Box>

          {userError && (
            <Typography sx={{ mt: 1 }} color="error">
              {userError}
            </Typography>
          )}

          {users.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                Select a user:
              </Typography>
              {users.map((user) => {
                const name =
                  user.username ||
                  user.full_name ||
                  user.email ||
                  `User #${user.id}`;
                return (
                  <Paper
                    key={user.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1,
                      cursor: "pointer",
                      borderColor:
                        selectedUser?.id === user.id
                          ? "#4caf50"
                          : "rgba(0,0,0,0.12)",
                      "&:hover": {
                        borderColor: "#4caf50",
                      },
                    }}
                    onClick={() => handleUserSelect(user)}
                  >
                    <Typography variant="subtitle2">{name}</Typography>
                    {user.email && (
                      <Typography variant="body2" color="text.secondary">
                        {user.email}
                      </Typography>
                    )}
                  </Paper>
                );
              })}
            </Box>
          )}

          {selectedUser && (
            <Typography sx={{ mt: 1 }} color="text.secondary">
              Selected:{" "}
              {selectedUser.username ||
                selectedUser.full_name ||
                selectedUser.email}
            </Typography>
          )}
        </Paper>
      </Box>

      {/* STEP 2: INCIDENT DETAILS */}
      <Fade in={step >= 2}>
        <Box sx={{ position: "relative" }}>
          <StepIndicator step={2} active={step === 2} />
          <Paper elevation={3} sx={{ pt: 4, pb: 2, px: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Step 2: Incident Details
            </Typography>
            <TextField
              required
              fullWidth
              label="Incident Title"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              required
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={{ mb: 2 }}
            />
            <TextField
              required
              fullWidth
              select
              label="Category"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
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
              onChange={(e) =>
                setFormData({ ...formData, priority: e.target.value })
              }
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
