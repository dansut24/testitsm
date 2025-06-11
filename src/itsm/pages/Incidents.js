import React, { useState, useEffect } from "react";
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
} from "../../common/utils/exportUtils"; // ✅ fixed path
import ExportPreviewModal from "../components/ExportPreviewModal";
import { useNavigate } from "react-router-dom";
import { getSlaDueDate, getSlaStatus } from "../../common/utils/slaUtils"; // ✅ fixed path
import { supabase } from "../../common/utils/supabaseClient"; // ✅ fixed path

const Incidents = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Incidents Export");
  const [incidents, setIncidents] = useState([]);

  const navigate = useNavigate();

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  const handleMenuAction = (type) => {
    if (["csv", "xlsx", "pdf"].includes(type)) {
      setExportType(type);
      setPreviewOpen(true);
    } else if (type === "new") {
      navigate("/new-incident");
    }
    handleMenuClose();
  };

  const handleExportConfirm = () => {
    if (exportType === "csv") exportToCSV(incidents, exportTitle);
    if (exportType === "xlsx") exportToXLSX(incidents, exportTitle);
    if (exportType === "pdf") exportToPDF(incidents, exportTitle);
    setPreviewOpen(false);
  };

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data, error } = await supabase.from("incidents").select("*");
      if (data) {
        const enriched = data.map((incident) => ({
          ...incident,
          slaDueDate: getSlaDueDate(incident.created, incident.priority || "Medium"),
        }));
        setIncidents(enriched);
      }
    };
    fetchIncidents();
  }, []);

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
          placeholder="Search incidents..."
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
          <MenuItem onClick={() => handleMenuAction("new")}>New Incident</MenuItem>
          <MenuItem onClick={() => handleMenuAction("csv")}>Export to CSV</MenuItem>
          <MenuItem onClick={() => handleMenuAction("xlsx")}>Export to Excel</MenuItem>
          <MenuItem onClick={() => handleMenuAction("pdf")}>Export to PDF</MenuItem>
        </Menu>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2, px: 2, py: 2 }}>
        {incidents.map((incident) => (
          <Paper
            key={incident.id}
            sx={{
              background: "#f5f8fe",
              borderLeft: "5px solid #295cb3",
              p: 2,
              borderRadius: 1.5,
              cursor: "pointer",
              boxShadow: "0 1px 6px rgba(20,40,80,0.03)",
            }}
            onClick={() => navigate(`/incidents/${incident.id}`)}
          >
            <Typography sx={{ fontSize: "0.95rem", color: "#456", mb: 1 }}>
              <strong>#{incident.id}</strong> • {incident.category}
              <Chip
                label={incident.status}
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
              <Chip
                label={getSlaStatus(incident.slaDueDate)}
                sx={{
                  ml: 1,
                  bgcolor:
                    getSlaStatus(incident.slaDueDate) === "Overdue"
                      ? "#ffe0e0"
                      : "#e7f7ed",
                  color:
                    getSlaStatus(incident.slaDueDate) === "Overdue"
                      ? "#d32f2f"
                      : "#2e7d32",
                  fontSize: "0.75em",
                  height: "20px",
                  fontWeight: 500,
                  borderRadius: "10px",
                }}
              />
            </Typography>
            <Typography variant="h6">{incident.title}</Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              {incident.description}
            </Typography>
            <Typography sx={{ fontSize: "0.92em", color: "#789", mt: 1 }}>
              Created: {new Date(incident.created).toLocaleString()}
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
        recordCount={incidents.length}
      />
    </Box>
  );
};

export default Incidents;
