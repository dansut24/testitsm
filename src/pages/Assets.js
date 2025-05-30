// src/pages/Assets.js
import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

const testAssets = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `Asset ${i + 1}`,
  type: ["Laptop", "Desktop", "Printer"][i % 3],
  status: ["In Use", "Spare", "Faulty"][i % 3],
  location: ["London", "Manchester", "Birmingham"][i % 3],
}));

const Assets = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleMenuAction = (type) => {
    if (type === "new") navigate("/new-asset");
    handleMenuClose();
  };

  const filteredAssets = testAssets.filter((asset) =>
    asset.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ width: "100%" }}>
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
          placeholder="Search assets..."
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

        <IconButton onClick={handleMenuClick}>
          <MoreVertIcon />
        </IconButton>
        <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
          <MenuItem onClick={() => handleMenuAction("new")}>New Asset</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 2, py: 2 }}>
        {filteredAssets.map((asset) => (
          <Paper
            key={asset.id}
            sx={{
              background: "#f5f8fe",
              borderLeft: "5px solid #4a90e2",
              p: 2,
              borderRadius: 1.5,
              cursor: "pointer",
              boxShadow: "0 1px 6px rgba(20,40,80,0.03)",
            }}
            onClick={() => navigate(`/assets/${asset.id}`)}
          >
            <Typography variant="h6">{asset.name}</Typography>
            <Typography variant="body2">Type: {asset.type}</Typography>
            <Typography variant="body2">Location: {asset.location}</Typography>
            <Chip label={asset.status} sx={{ mt: 1 }} />
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Assets;
