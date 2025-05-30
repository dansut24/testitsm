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
import {
  exportToCSV,
  exportToXLSX,
  exportToPDF,
} from "../utils/exportUtils";
import ExportPreviewModal from "../components/ExportPreviewModal";
import { useNavigate } from "react-router-dom";

const testChanges = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  title: `Change ${i + 1}`,
  description: `This is a test change record for change number ${i + 1}.`,
  category: ["Standard", "Emergency", "Normal"][i % 3],
  status: ["Planned", "In Progress", "Completed"][i % 3],
  created: "2024-05-25 14:00",
}));

const Changes = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [searchTerm, setSearchTerm] = useState("");

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Changes Export");

  const navigate = useNavigate();

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuAction = (type) => {
    if (["csv", "xlsx", "pdf"].includes(type)) {
      setExportType(type);
      setPreviewOpen(true);
    }
    handleMenuClose();
  };

  const handleExportConfirm = () => {
    const filtered = testChanges.filter((c) =>
      c.title.toLowerCase().includes(searchTerm.toLowerCase())
    );
    if (exportType === "csv") exportToCSV(filtered, exportTitle);
    if (exportType === "xlsx") exportToXLSX(filtered, exportTitle);
    if (exportType === "pdf") exportToPDF(filtered, exportTitle);
    setPreviewOpen(false);
  };

  const filteredChanges = testChanges.filter((c) =>
    c.title.toLowerCase().includes(searchTerm.toLowerCase())
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
          placeholder="Search changes..."
          size="small"
          variant="outlined"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
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
          <MenuItem onClick={() => handleMenuAction("csv")}>Export to CSV</MenuItem>
          <MenuItem onClick={() => handleMenuAction("xlsx")}>Export to Excel</MenuItem>
          <MenuItem onClick={() => handleMenuAction("pdf")}>Export to PDF</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 2, py: 2 }}>
        {filteredChanges.map((change) => (
          <Paper
            key={change.id}
            sx={{
              background: "#fef9f4",
              borderLeft: "5px solid #b85c38",
              p: 2,
              borderRadius: 1.5,
              cursor: "pointer",
              boxShadow: "0 1px 6px rgba(20,40,80,0.03)",
            }}
            onClick={() => navigate(`/changes/${change.id}`)}
          >
            <Typography sx={{ fontSize: "0.95rem", color: "#444", mb: 1 }}>
              <strong>#{change.id}</strong> • {change.category}
              <Chip
                label={change.status}
                sx={{
                  ml: 1,
                  bgcolor: "#fce5cd",
                  color: "#8a3e00",
                  fontSize: "0.85em",
                  height: "20px",
                  fontWeight: 500,
                  borderRadius: "10px",
                }}
              />
            </Typography>
            <Typography variant="h6">{change.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {change.description}
            </Typography>
            <Typography sx={{ fontSize: "0.92em", color: "#789", mt: 1 }}>
              Created: {change.created}
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
        recordCount={filteredChanges.length}
      />
    </Box>
  );
};

export default Changes;
