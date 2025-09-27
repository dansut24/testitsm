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
  useMediaQuery,
  SwipeableDrawer,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import DescriptionIcon from "@mui/icons-material/Description"; // export icon
import AddIcon from "@mui/icons-material/Add"; // new incident
import MenuIcon from "@mui/icons-material/Menu"; // mobile sidebar toggle
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

const teamsList = ["IT Support", "Network", "Security"];

const Incidents = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Incidents Export");
  const [incidents, setIncidents] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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
          slaDueDate: getSlaDueDate(
            incident.created,
            incident.priority || "Medium"
          ),
        }));
        setIncidents(enriched);
      }
    };
    fetchIncidents();
  }, []);

  // Filter incidents by team if selected
  const displayedIncidents = selectedTeam
    ? incidents.filter((i) => i.team === selectedTeam)
    : incidents;

  return (
    <Box sx={{ width: "100%", display: "flex", height: "100%" }}>
      {/* Desktop Sidebar */}
      {!isMobile && (
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
              {teamsList.map((team) => (
                <Typography
                  key={team}
                  variant="body2"
                  sx={{
                    mb: 1,
                    cursor: "pointer",
                    color:
                      selectedTeam === team
                        ? theme.palette.primary.main
                        : "inherit",
                  }}
                  onClick={() =>
                    setSelectedTeam((prev) => (prev === team ? null : team))
                  }
                >
                  {team}
                </Typography>
              ))}
            </>
          )}
        </Box>
      )}

      {/* Main Content */}
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
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {/* Left side: Page Title */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {isMobile && (
              <IconButton onClick={() => setMobileSidebarOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" noWrap>
              {selectedTeam ? `Team: ${selectedTeam}` : "My Incidents"}
            </Typography>
          </Box>

          {/* Right side: Actions */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
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
              <MenuItem onClick={() => handleMenuAction("csv")}>
                Export to CSV
              </MenuItem>
              <MenuItem onClick={() => handleMenuAction("xlsx")}>
                Export to Excel
              </MenuItem>
              <MenuItem onClick={() => handleMenuAction("pdf")}>
                Export to PDF
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Incident Cards */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2 }}>
          {displayedIncidents.map((incident) => (
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
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
                  <strong>#{incident.id}</strong> • {incident.category}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  <Chip
                    label={incident.status}
                    size="small"
                    sx={{
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
                sx={{
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {incident.description}
              </Typography>
              <Typography
                sx={{ fontSize: "0.75em", color: "text.disabled", mt: 0.5 }}
              >
                Created: {new Date(incident.created).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Mobile Sidebar Drawer */}
      {isMobile && (
        <SwipeableDrawer
          anchor="left"
          open={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          PaperProps={{ sx: { width: 220 } }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Teams
            </Typography>
            {teamsList.map((team) => (
              <Typography
                key={team}
                variant="body2"
                sx={{
                  mb: 1,
                  cursor: "pointer",
                  color:
                    selectedTeam === team
                      ? theme.palette.primary.main
                      : "inherit",
                }}
                onClick={() => {
                  setSelectedTeam((prev) => (prev === team ? null : team));
                  setMobileSidebarOpen(false);
                }}
              >
                {team}
              </Typography>
            ))}
          </Box>
        </SwipeableDrawer>
      )}

      {/* Export Modal */}
      <ExportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleExportConfirm}
        exportTitle={exportTitle}
        setExportTitle={setExportTitle}
        exportType={exportType || "file"}
        recordCount={displayedIncidents.length}
      />
    </Box>
  );
};

export default Incidents;
