import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const sampleAssets = [
  {
    id: 1,
    assetTag: "ASSET-001",
    serialNumber: "SN12345678",
    model: "Latitude 5420",
    manufacturer: "Dell",
    status: "In Use",
    assignedTo: "Alice Johnson",
    location: "London Office",
  },
  {
    id: 2,
    assetTag: "ASSET-002",
    serialNumber: "SN87654321",
    model: "MacBook Pro 16",
    manufacturer: "Apple",
    status: "Available",
    assignedTo: "",
    location: "Birmingham Office",
  },
  {
    id: 3,
    assetTag: "ASSET-003",
    serialNumber: "SN56473829",
    model: "EliteBook 850",
    manufacturer: "HP",
    status: "In Repair",
    assignedTo: "Tom Harding",
    location: "London Office",
  },
];

const Assets = () => {
  const [search, setSearch] = useState("");
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const filteredAssets = sampleAssets.filter(
    (asset) =>
      asset.assetTag.toLowerCase().includes(search.toLowerCase()) ||
      asset.serialNumber.toLowerCase().includes(search.toLowerCase()) ||
      asset.model.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ width: "100%", p: 0 }}>
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
          <MenuItem>New Asset</MenuItem>
          <MenuItem>Export to CSV</MenuItem>
          <MenuItem>Export to Excel</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 2, py: 2 }}>
        {filteredAssets.map((asset) => (
          <Paper
            key={asset.id}
            sx={{
              background: "#fefefe",
              borderLeft: "5px solid #1e88e5",
              p: 2,
              borderRadius: 1.5,
              cursor: "pointer",
              boxShadow: "0 1px 6px rgba(20,40,80,0.03)",
            }}
          >
            <Typography sx={{ fontSize: "0.95rem", color: "#456", mb: 1 }}>
              <strong>{asset.assetTag}</strong> • {asset.model} ({asset.manufacturer})
              <Chip
                label={asset.status}
                sx={{
                  ml: 1,
                  bgcolor: "#e0e0e0",
                  color: "#1e88e5",
                  fontSize: "0.8em",
                  height: "20px",
                  fontWeight: 500,
                  borderRadius: "10px",
                }}
              />
            </Typography>
            <Typography variant="body2">Serial Number: {asset.serialNumber}</Typography>
            <Typography variant="body2">Assigned To: {asset.assignedTo || "Unassigned"}</Typography>
            <Typography variant="body2">Location: {asset.location}</Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Assets;
