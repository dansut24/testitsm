// src/itsm/components/AddUserModal.js
import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  Alert,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";

const AddUserModal = ({ open, onClose, tenantId }) => {
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAddUser = async () => {
    setLoading(true);
    setStatus(null);

    const { error } = await supabase.from("profiles").insert({
      email,
      full_name: fullName,
      tenant_id: tenantId,
      role: "user",
    });

    if (error) {
      console.error("Insert error:", error);
      setStatus({ type: "error", message: "❌ Failed to add user." });
    } else {
      setStatus({ type: "success", message: "✅ User added successfully." });
      setEmail("");
      setFullName("");
      onClose();
    }

    setLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Add New User</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            fullWidth
          />
          <TextField
            label="Email Address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            fullWidth
          />
          {status && <Alert severity={status.type}>{status.message}</Alert>}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleAddUser} disabled={loading} variant="contained">
          {loading ? "Adding..." : "Add User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddUserModal;
