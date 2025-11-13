import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

const dummyApprovals = [
  {
    id: 1,
    title: "Approve software purchase",
    requestor: "Jane Smith",
    status: "Pending",
    submitted: "2024-05-01",
  },
  {
    id: 2,
    title: "Change request - Server reboot",
    requestor: "Mark Lee",
    status: "Approved",
    submitted: "2024-05-03",
  },
];

const Approvals = () => {
  const [search, setSearch] = useState("");

  const filtered = dummyApprovals.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <Box
        sx={{
          px: 2,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #ccc",
          bgcolor: "background.paper",
        }}
      >
        <TextField
          placeholder="Search approvals..."
          size="small"
          variant="outlined"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ flex: 1, mr: 2 }}
        />
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 2 }}>
        {filtered.map((approval) => (
          <Paper
            key={approval.id}
            sx={{
              p: 2,
              background: "#f9f9fc",
              borderLeft: "5px solid #295cb3",
              borderRadius: 1.5,
              boxShadow: "0 1px 6px rgba(20,40,80,0.03)",
            }}
          >
            <Typography sx={{ fontSize: "0.95rem", color: "#456", mb: 1 }}>
              <strong>#{approval.id}</strong> • {approval.requestor}
              <Chip
                label={approval.status}
                sx={{
                  ml: 1,
                  bgcolor: "#e2e8f0",
                  color: "#2b5ca4",
                  fontSize: "0.85em",
                  height: "20px",
                  fontWeight: 500,
                  borderRadius: "10px",
                }}
              />
            </Typography>

            <Typography variant="h6">{approval.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              Submitted: {approval.submitted}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Approvals;
