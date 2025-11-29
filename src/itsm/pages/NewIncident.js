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
    asset_tag: "",
    customer_name: "",
    notifyEmails: [], // optional - extend UI if you want
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
      // safer ilike queries using or string; limit results
      const orQuery = `username.ilike.%${query}%,email.ilike.%${query}%`;
      const { data, error: supaError } = await supabase
        .from("users")
        .select("id, username, email, full_name")
        .or(orQuery)
        .limit(10);

      if (supaError) throw supaError;

      if (!data || data.length === 0) {
        setUserError("No users found for that search.");
      } else {
        setUsers(data);
        if (data.length === 1) {
          setSelectedUser(data[0]);
          setStep(2);
          // prefill customer name from selected user if present
          setFormData((f) => ({
            ...f,
            customer_name: data[0].full_name || data[0].username || data[0].email,
          }));
        }
      }
    } catch (err) {
      console.error("User search error:", err);
      setUserError(err?.message || "There was a problem searching for users.");
    } finally {
      setUserLoading(false);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setStep(2);
    setFormData((f) => ({
      ...f,
      customer_name: user.full_name || user.username || user.email,
    }));
  };

  // --- SUBMIT INCIDENT TO BACKEND ---
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
      // optional SLA lookup on client (you can move this to backend)
      let sla_due = null;
      try {
        const { data: sla, error: slaError } = await supabase
          .from("sla_settings")
          .select("duration_minutes")
          .eq("priority", formData.priority)
          .maybeSingle();

        if (!slaError && sla && sla.duration_minutes) {
          const now = new Date();
          sla_due = new Date(now.getTime() + sla.duration_minutes * 60000).toISOString();
        }
      } catch (slaErr) {
        console.warn("SLA lookup failed:", slaErr);
      }

      // Determine submitted_by value — use user id if available; else email/username
      const submitted_by =
        selectedUser?.id || selectedUser?.email || selectedUser?.username || "unknown";

      // Payload matches backend controller (controllers/incidents.js)
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        priority: formData.priority,
        submitted_by,
        assignee: null,
        asset_tag: formData.asset_tag || null,
        customer_name: formData.customer_name || null,
        sla_due: sla_due || null,
        resolution_notes: null,
        is_breached: false,
        notifyEmails: formData.notifyEmails || [],
      };

      // send to backend API (the backend will generate reference + idx)
      const resp = await fetch("/api/incidents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!resp.ok) {
        const errBody = await resp.json().catch(() => ({}));
        throw new Error(errBody?.error || `Server returned ${resp.status}`);
      }

      const result = await resp.json();
      const created = result.incident || result;

      // created.incident is expected shape from previous server code
      if (!created || !created.id) {
        throw new Error("Server did not return a created incident id.");
      }

      // navigate to detail page, pass tab name (reference) in state if provided
      const ref = created.reference || created.reference_number || created.reference_number || created.reference;
      navigate(`/incidents/${created.id}`, { state: { tabName: ref || created.reference || created.reference_number } });
    } catch (err) {
      console.error("Incident submit error:", err);
      setError(err?.message || "There was a problem submitting the incident.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box sx={{ px: 2, py: 4, maxWidth: 700, mx: "auto", position: "relative" }}>
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
              inputProps={{ "aria-label": "Search user by name or email" }}
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
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Select a user:
              </Typography>
              {users.map((user) => {
                const name = user.full_name || user.username || user.email || `User #${user.id}`;
                return (
                  <Paper
                    key={user.id}
                    variant="outlined"
                    sx={{
                      p: 1.5,
                      mb: 1,
                      cursor: "pointer",
                      borderColor: selectedUser?.id === user.id ? "#4caf50" : "rgba(0,0,0,0.12)",
                      "&:hover": { borderColor: "#4caf50" },
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
              Selected: {selectedUser.full_name || selectedUser.username || selectedUser.email}
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
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              multiline
              rows={4}
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              required
              fullWidth
              select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              sx={{ mb: 2 }}
            >
              {priorityOptions.map((level) => (
                <MenuItem key={level} value={level}>
                  {level}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              fullWidth
              label="Asset tag (optional)"
              value={formData.asset_tag}
              onChange={(e) => setFormData({ ...formData, asset_tag: e.target.value })}
              sx={{ mb: 2 }}
            />

            <TextField
              fullWidth
              label="Customer name (optional)"
              value={formData.customer_name}
              onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
              sx={{ mb: 2 }}
            />

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
              aria-label="Submit incident"
            >
              {submitting ? <CircularProgress size={20} color="inherit" /> : "Submit Incident"}
            </Button>
          </Paper>
        </Box>
      </Fade>
    </Box>
  );
};

export default NewIncident;
