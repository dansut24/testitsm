// src/itsm/pages/Incidents.js
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
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import {
  exportToCSV,
  exportToXLSX,
  exportToPDF,
} from "../../common/utils/exportUtils";
import ExportPreviewModal from "../components/ExportPreviewModal";
import { useNavigate } from "react-router-dom";
import { getSlaDueDate, getSlaStatus } from "../../common/utils/slaUtils";
import { supabase } from "../../common/utils/supabaseClient";

const Incidents = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Incidents Export");
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    if (exportType === "csv") exportToCSV(filteredIncidents, exportTitle);
    if (exportType === "xlsx") exportToXLSX(filteredIncidents, exportTitle);
    if (exportType === "pdf") exportToPDF(filteredIncidents, exportTitle);
    setPreviewOpen(false);
  };

  const handleSearchChange = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (!term) {
      setFilteredIncidents(incidents);
      return;
    }

    const filtered = incidents.filter(
      (incident) =>
        incident.title.toLowerCase().includes(term) ||
        incident.description.toLowerCase().includes(term) ||
        incident.category?.toLowerCase().includes(term)
    );
    setFilteredIncidents(filtered);
  };

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data } = await supabase.from("incidents").select("*");
      if (data) {
        const enriched = data.map((incident) => ({
          ...incident,
          slaDueDate: getSlaDueDate(incident.created, incident.priority || "Medium"),
        }));
        setIncidents(enriched);
        setFilteredIncidents(enriched);
      }
    };
    fetchIncidents();
  }, []);

  return (
    <Box sx={{ width: "100%", display: "flex", height: "100%" }}>
      {/* Left Sidebar */}
      <Box
        sx={{
          width: sidebarOpen ? 220 : 40,
          transition: "width 0.3s",
          borderRight: "1px solid #ddd",
          bgcolor: "background.paper",
          p: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: sidebarOpen ? "flex-start" : "center",
        }}
      >
        <IconButton onClick={() => setSidebarOpen((p) => !p)} size="small">
          {sidebarOpen ? <ChevronLeftIcon /> : <ChevronRightIcon />}
        </IconButton>

        {sidebarOpen && (
          <>
            <Typography variant="h6" sx={{ mt: 1, mb: 2 }}>
              Teams
            </Typography>
            <Divider sx={{ mb: 1 }} />
            <Typography variant="body2" sx={{ mb: 1 }}>
              IT Support
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Network
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Security
            </Typography>
          </>
        )}
      </Box>

      {/* Right Column */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
        {/* Header */}
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
            value={searchTerm}
            onChange={handleSearchChange}
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

        {/* Incident Cards */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 2,
            p: 2,
          }}
        >
          {filteredIncidents.map((incident) => (
            <Paper
              key={incident.id}
              sx={{
                background: "#f5f8fe",
                borderLeft: "5px solid #295cb3",
                p: 2,
                borderRadius: 1.5,
                cursor: "pointer",
                boxShadow: "0 1px 6px rgba(20,40,80,0.03)",
                display: "flex",
                flexDirection: "column",
                height: "100%",
              }}
              onClick={() => navigate(`/incidents/${incident.id}`)}
            >
              <Typography sx={{ fontSize: "0.85rem", color: "#456", mb: 1 }}>
                <strong>#{incident.id}</strong> • {incident.category}
                <Chip
                  label={incident.status}
                  sx={{
                    ml: 1,
                    bgcolor: "#e2e8f0",
                    color: "#2b5ca4",
                    fontSize: "0.75em",
                    height: "18px",
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
                    fontSize: "0.7em",
                    height: "18px",
                    fontWeight: 500,
                    borderRadius: "10px",
                  }}
                />
              </Typography>
              <Typography variant="subtitle1" noWrap>
                {incident.title}
              </Typography>
              <Typography
                variant="body2"
                sx={{ mt: 0.5, flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {incident.description}
              </Typography>
              <Typography sx={{ fontSize: "0.8em", color: "#789", mt: 1 }}>
                Created: {new Date(incident.created).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Export Modal */}
      <ExportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleExportConfirm}
        exportTitle={exportTitle}
        setExportTitle={setExportTitle}
        exportType={exportType || "file"}
        recordCount={filteredIncidents.length}
      />
    </Box>
  );
};

export default Incidents;
