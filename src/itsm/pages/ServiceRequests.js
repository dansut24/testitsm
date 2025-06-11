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
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SearchIcon from "@mui/icons-material/Search";
import {
  exportToCSV,
  exportToXLSX,
  exportToPDF,
} from "../utils/exportUtils";
import ExportPreviewModal from "../components/ExportPreviewModal";
import { useNavigate } from "react-router-dom";

const testServiceRequests = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Service Request ${i + 1}`,
  description: `This is a sample description for service request number ${i + 1}.`,
  category: ["Software", "Access", "Hardware"][i % 3],
  status: ["Open", "Pending", "Completed"][i % 3],
  created: "2024-05-16 10:00",
}));

const ServiceRequests = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Service Requests Export");

  const navigate = useNavigate();

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuAction = (type) => {
    if (["csv", "xlsx", "pdf"].includes(type)) {
      setExportType(type);
      setPreviewOpen(true);
    } else if (type === "new") {
      navigate("/new-service-request");
    }
    handleMenuClose();
  };

  const handleExportConfirm = () => {
    if (exportType === "csv") exportToCSV(testServiceRequests, exportTitle);
    if (exportType === "xlsx") exportToXLSX(testServiceRequests, exportTitle);
    if (exportType === "pdf") exportToPDF(testServiceRequests, exportTitle);
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
          placeholder="Search service requests..."
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
          <MenuItem onClick={() => handleMenuAction("new")}>New Service Request</MenuItem>
          <MenuItem onClick={() => handleMenuAction("csv")}>Export to CSV</MenuItem>
          <MenuItem onClick={() => handleMenuAction("xlsx")}>Export to Excel</MenuItem>
          <MenuItem onClick={() => handleMenuAction("pdf")}>Export to PDF</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 2, py: 2 }}>
        {testServiceRequests.map((req) => (
          <Paper
            key={req.id}
            sx={{
              background: "#f5f8fe",
              borderLeft: "5px solid #00aaff",
              p: 2,
              borderRadius: 1.5,
              cursor: "pointer",
              boxShadow: "0 1px 6px rgba(20,40,80,0.03)",
            }}
            onClick={() => navigate(`/service-requests/${req.id}`)}
          >
            <Typography sx={{ fontSize: "0.95rem", color: "#456", mb: 1 }}>
              <strong>#{req.id}</strong> • {req.category}
              <Chip
                label={req.status}
                sx={{
                  ml: 1,
                  bgcolor: "#e2e8f0",
                  color: "#0077aa",
                  fontSize: "0.85em",
                  height: "20px",
                  fontWeight: 500,
                  borderRadius: "10px",
                }}
              />
            </Typography>
            <Typography variant="h6">{req.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {req.description}
            </Typography>
            <Typography sx={{ fontSize: "0.92em", color: "#789", mt: 1 }}>
              Created: {req.created}
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
        recordCount={testServiceRequests.length}
      />
    </Box>
  );
};

export default ServiceRequests;
