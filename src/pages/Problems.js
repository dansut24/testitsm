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
import SearchIcon from "@mui/icons-material/Search";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import {
  exportToCSV,
  exportToXLSX,
  exportToPDF,
} from "../utils/exportUtils";
import ExportPreviewModal from "../components/ExportPreviewModal";

const dummyProblems = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Problem ${i + 1}`,
  description: `Issue observed in service component ${i + 1} with potential root cause under analysis.`,
  impact: ["Low", "Medium", "High"][i % 3],
  status: ["Open", "Under Investigation", "Resolved"][i % 3],
  created: "2024-05-22 08:30",
}));

const Problems = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Problems Export");

  const handleMenuClick = (e) => setAnchorEl(e.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuAction = (type) => {
    if (type === "new") {
      navigate("/new-problem");
    } else {
      setExportType(type);
      setPreviewOpen(true);
    }
    handleMenuClose();
  };

  const handleExportConfirm = () => {
    if (exportType === "csv") exportToCSV(dummyProblems, exportTitle);
    if (exportType === "xlsx") exportToXLSX(dummyProblems, exportTitle);
    if (exportType === "pdf") exportToPDF(dummyProblems, exportTitle);
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
          placeholder="Search problems..."
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
          <MenuItem onClick={() => handleMenuAction("new")}>New Problem</MenuItem>
          <MenuItem onClick={() => handleMenuAction("csv")}>Export to CSV</MenuItem>
          <MenuItem onClick={() => handleMenuAction("xlsx")}>Export to Excel</MenuItem>
          <MenuItem onClick={() => handleMenuAction("pdf")}>Export to PDF</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ px: 2, py: 2, display: "flex", flexDirection: "column", gap: 2 }}>
        {dummyProblems.map((problem) => (
          <Paper
            key={problem.id}
            onClick={() => navigate(`/problems/${problem.id}`)}
            sx={{
              background: "#fefefe",
              borderLeft: "5px solid #82336d",
              p: 2,
              borderRadius: 1.5,
              cursor: "pointer",
              boxShadow: "0 1px 6px rgba(20,40,80,0.04)",
            }}
          >
            <Typography sx={{ fontSize: "0.95rem", color: "#456", mb: 1 }}>
              <strong>#{problem.id}</strong> • {problem.impact}
              <Chip
                label={problem.status}
                sx={{
                  ml: 1,
                  bgcolor: "#e2e8f0",
                  color: "#832a57",
                  fontSize: "0.85em",
                  height: "20px",
                  fontWeight: 500,
                  borderRadius: "10px",
                }}
              />
            </Typography>
            <Typography variant="h6">{problem.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {problem.description}
            </Typography>
            <Typography sx={{ fontSize: "0.92em", color: "#789", mt: 1 }}>
              Created: {problem.created}
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
        recordCount={dummyProblems.length}
      />
    </Box>
  );
};

export default Problems;
