// src/itsm/pages/Incidents.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Button,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description"; // export icon
import AddIcon from "@mui/icons-material/Add"; // new incident
import {
  exportToCSV,
  exportToXLSX,
  exportToPDF,
} from "../../common/utils/exportUtils";
import ExportPreviewModal from "../components/ExportPreviewModal";
import { useNavigate } from "react-router-dom";
import { getSlaDueDate, getSlaStatus } from "../../common/utils/slaUtils";
import { supabase } from "../../common/utils/supabaseClient";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

const Incidents = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Incidents Export");
  const [incidents, setIncidents] = useState([]);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);

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
    if (exportType === "csv") exportToCSV(incidents, exportTitle);
    if (exportType === "xlsx") exportToXLSX(incidents, exportTitle);
    if (exportType === "pdf") exportToPDF(incidents, exportTitle);
    setPreviewOpen(false);
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
            justifyContent: "flex-end",
            gap: 1,
            borderBottom: "1px solid #ccc",
            bgcolor: "background.paper",
          }}
        >
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            size="small"
            onClick={() => navigate("/new-incident")}
          >
            New Incident
          </Button>

          <IconButton onClick={handleMenuClick}>
            <DescriptionIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
            <MenuItem onClick={() => handleMenuAction("csv")}>Export to CSV</MenuItem>
            <MenuItem onClick={() => handleMenuAction("xlsx")}>Export to Excel</MenuItem>
            <MenuItem onClick={() => handleMenuAction("pdf")}>Export to PDF</MenuItem>
          </Menu>
        </Box>

        {/* Incident Cards — stacked like rows */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2 }}>
          {incidents.map((incident) => (
            <Paper
              key={incident.id}
              sx={{
                background: "background.paper",
                borderLeft: "4px solid #295cb3",
                px: 2,
                py: 1.5,
                borderRadius: 1,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(20,40,80,0.08)",
                "&:hover": { bgcolor: "action.hover" },
              }}
              onClick={() => navigate(`/incidents/${incident.id}`)}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                  <strong>#{incident.id}</strong> • {incident.category}
                </Typography>
                <Box>
                  <Chip
                    label={incident.status}
                    size="small"
                    sx={{
                      ml: 1,
                      bgcolor: "grey.200",
                      color: "primary.main",
                      fontSize: "0.7em",
                      height: 20,
                      fontWeight: 500,
                    }}
                  />
                  <Chip
                    label={getSlaStatus(incident.slaDueDate)}
                    size="small"
                    sx={{
                      ml: 1,
                      bgcolor:
                        getSlaStatus(incident.slaDueDate) === "Overdue"
                          ? "error.light"
                          : "success.light",
                      color:
                        getSlaStatus(incident.slaDueDate) === "Overdue"
                          ? "error.main"
                          : "success.main",
                      fontSize: "0.7em",
                      height: 20,
                      fontWeight: 500,
                    }}
                  />
                </Box>
              </Box>
              <Typography variant="subtitle1" noWrap>
                {incident.title}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}
              >
                {incident.description}
              </Typography>
              <Typography sx={{ fontSize: "0.75em", color: "text.disabled", mt: 0.5 }}>
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
        recordCount={incidents.length}
      />
    </Box>
  );
};

export default Incidents;
