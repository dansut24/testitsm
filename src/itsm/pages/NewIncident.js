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

/**
 * Step indicator (unchanged)
 */
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

/**
 * Utility: check candidate user fields for a query substring
 */
const userMatchesQuery = (userRow = {}, q = "") => {
  if (!q) return false;
  const qLower = q.toLowerCase();
  // candidate fields we will check (in order). Add any other fields your DB uses.
  const candidates = [
    "username",
    "user_name",
    "full_name",
    "name",
    "email",
    "contact_email",
    "useremail",
    "login",
    "id",
  ];
  return candidates.some((k) => {
    const v = userRow[k];
    if (!v) return false;
    return String(v).toLowerCase().includes(qLower);
  });
};

/**
 * Safe accessor to present user display name
 */
const displayName = (userRow = {}) =>
  userRow.full_name ||
  userRow.name ||
  userRow.username ||
  userRow.user_name ||
  userRow.email ||
  userRow.contact_email ||
  userRow.login ||
  `User ${userRow.id || ""}`;

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
    notifyEmails: [],
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  /**
   * SEARCH: fetch a safe batch of users and filter client-side
   * This avoids referencing non-existent columns in the DB (eg email)
   */
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
      // Select * with a modest limit (adjust as needed) — avoid server-side column-specific filtering
      const LIMIT = 200;
      const { data, error: supaError } = await supabase
        .from("users")
        .select("*")
        .limit(LIMIT);

      if (supaError) throw supaError;

      if (!data || data.length === 0) {
        setUserError("No users available to search.");
        setUsers([]);
      } else {
        // filter client-side against likely name/email fields
        const matches = data.filter((row) => userMatchesQuery(row, query));
        if (!matches.length) {
          setUserError("No users found for that search.");
        } else {
          setUsers(matches);
          // auto-select if single match
          if (matches.length === 1) {
            handleUserSelect(matches[0]);
          }
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
      customer_name: formData.customer_name || displayName(user),
    }));
  };

  /**
   * SUBMIT: send to backend API (server generates reference + idx)
   */
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
      // compute SLA client-side (optional); backend can also compute
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

      // submitted_by: prefer id if present, fall back to email/username
      const submitted_by =
        selectedUser?.id ||
        selectedUser?.email ||
        selectedUser?.contact_email ||
        selectedUser?.username ||
        selectedUser?.user_name ||
        "unknown";

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

      if (!created || !created.id) {
        throw new Error("Server did not return a created incident id.");
      }

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
            <Button variant="contained" onClick={handleUserSearch} disabled={userLoading}>
              {userLoading ? <CircularProgress size={20} color="inherit" /> : "Search"}
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
                return (
                  <Paper
                    key={user.id || JSON.stringify(user).slice(0, 40)}
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
                    <Typography variant="subtitle2">{displayName(user)}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {/* show best-effort contact info */}
                      {user.email || user.contact_email || user.username || user.user_name || `ID: ${user.id}`}
                    </Typography>
                  </Paper>
                );
              })}
            </Box>
          )}

          {selectedUser && (
            <Typography sx={{ mt: 1 }} color="text.secondary">
              Selected: {displayName(selectedUser)}
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
