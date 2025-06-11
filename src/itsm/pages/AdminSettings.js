import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";

const AdminSettings = () => {
  const [tab, setTab] = useState(0);
  const [records, setRecords] = useState([]);
  const [type, setType] = useState("incidents");
  const [selectedId, setSelectedId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const tableOptions = ["incidents", "service_requests"];

  useEffect(() => {
    fetchData();
  }, [type]);

  const fetchData = async () => {
    const { data, error } = await supabase.from(type).select("id, title, reference");
    if (!error) setRecords(data);
  };

  const handleDelete = async () => {
    const { error } = await supabase.from(type).delete().eq("id", selectedId);
    if (!error) {
      setRecords(records.filter((r) => r.id !== selectedId));
      setConfirmOpen(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Admin Settings
      </Typography>

      <Paper sx={{ mt: 3 }}>
        <Tabs value={tab} onChange={(e, v) => { setTab(v); setType(tableOptions[v]); }}>
          <Tab label="Incidents" />
          <Tab label="Service Requests" />
        </Tabs>

        <Box sx={{ p: 2 }}>
          {records.map((item) => (
            <Box
              key={item.id}
              sx={{ display: "flex", justifyContent: "space-between", mb: 1, p: 1, border: "1px solid #ddd", borderRadius: 1 }}
            >
              <Box>
                <Typography fontWeight="bold">{item.reference || item.id}</Typography>
                <Typography variant="body2">{item.title}</Typography>
              </Box>
              <Button color="error" variant="outlined" onClick={() => { setSelectedId(item.id); setConfirmOpen(true); }}>
                Delete
              </Button>
            </Box>
          ))}
        </Box>
      </Paper>

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this {type.slice(0, -1)}?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button color="error" onClick={handleDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminSettings;
