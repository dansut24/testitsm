import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import {
  exportToCSV,
  exportToXLSX,
  exportToPDF,
} from "../../common/utils/exportUtils";
import ExportPreviewModal from "../components/ExportPreviewModal";

const testAssets = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  assetTag: `ASSET-${1000 + i}`,
  hostname: `PC-${i + 1}`,
  model: ["Dell Latitude", "HP EliteBook", "Lenovo ThinkPad"][i % 3],
  status: ["In Use", "Available", "Maintenance"][i % 3],
  location: ["London", "Manchester", "Birmingham"][i % 3],
  assignedTo: ["Alice", "Bob", "Charlie"][i % 3],
}));

const Assets = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Assets Export");

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuAction = (type) => {
    if (["csv", "xlsx", "pdf"].includes(type)) {
      setExportType(type);
      setPreviewOpen(true);
    } else if (type === "new") {
      navigate("/new-asset");
    }
    handleMenuClose();
  };

  const handleExportConfirm = () => {
    if (exportType === "csv") exportToCSV(testAssets, exportTitle);
    if (exportType === "xlsx") exportToXLSX(testAssets, exportTitle);
    if (exportType === "pdf") exportToPDF(testAssets, exportTitle);
    setPreviewOpen(false);
  };

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
          <MenuItem onClick={() => handleMenuAction("csv")}>Export to CSV</MenuItem>
          <MenuItem onClick={() => handleMenuAction("xlsx")}>Export to Excel</MenuItem>
          <MenuItem onClick={() => handleMenuAction("pdf")}>Export to PDF</MenuItem>
        </Menu>
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: 2,
          px: 2,
          py: 2,
        }}
      >
        {testAssets.map((asset) => (
          <Paper
            key={asset.id}
            sx={{
              p: 2,
              borderLeft: "5px solid #4b7bec",
              borderRadius: 1.5,
              boxShadow: "0 1px 6px rgba(20,40,80,0.03)",
              cursor: "pointer",
              backgroundColor: "#f7fafd",
            }}
            onClick={() => navigate(`/assets/${asset.id}`)}
          >
            <Typography variant="subtitle2" color="text.secondary">
              <strong>Asset Tag:</strong> {asset.assetTag}
            </Typography>
            <Typography variant="h6">{asset.hostname}</Typography>
            <Typography variant="body2" sx={{ my: 1 }}>
              <strong>Model:</strong> {asset.model}
            </Typography>
            <Chip
              label={asset.status}
              sx={{
                backgroundColor: "#e2e8f0",
                color: "#2b5ca4",
                fontSize: "0.8em",
                height: 20,
                fontWeight: 500,
                borderRadius: "10px",
              }}
            />
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>Assigned To:</strong> {asset.assignedTo}
            </Typography>
            <Typography variant="body2">
              <strong>Location:</strong> {asset.location}
            </Typography>
          </Paper>
        ))}
      </Box>

      <ExportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleExportConfirm}
        exportTitle={exportTitle}
        setExportTitle={setExportTitle}
        exportType={exportType || "file"}
        recordCount={testAssets.length}
      />
    </Box>
  );
};

export default Assets;
