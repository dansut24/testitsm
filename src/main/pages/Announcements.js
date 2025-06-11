// src/pages/Announcements.js

import React from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  TextField,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CampaignIcon from "@mui/icons-material/Campaign";

const mockAnnouncements = [
  {
    id: 1,
    title: "Scheduled Maintenance",
    message: "The system will be down for updates from 10pm to 12am.",
    date: "2024-06-01",
  },
  {
    id: 2,
    title: "New Self-Service Features",
    message: "A new Raise Request form is now live in the portal.",
    date: "2024-05-30",
  },
];

const Announcements = () => {
  const [search, setSearch] = React.useState("");

  const filtered = mockAnnouncements.filter((a) =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.message.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
        <CampaignIcon fontSize="large" sx={{ color: "#1976d2", mr: 1 }} />
        <Typography variant="h5">Announcements</Typography>
      </Box>

      <TextField
        placeholder="Search announcements..."
        size="small"
        fullWidth
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.map((a) => (
          <Paper
            key={a.id}
            sx={{ p: 2, bgcolor: "#f5f8fe", borderLeft: "4px solid #2196f3" }}
          >
            <Typography variant="h6">{a.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {a.message}
            </Typography>
            <Typography variant="caption" sx={{ mt: 1, display: "block", color: "#789" }}>
              {a.date}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Announcements;
