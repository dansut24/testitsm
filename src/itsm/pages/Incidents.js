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
  Avatar,
  Stack,
  Button,
  Collapse,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { exportToCSV, exportToXLSX, exportToPDF } from "../../common/utils/exportUtils";
import ExportPreviewModal from "../components/ExportPreviewModal";
import { useNavigate } from "react-router-dom";
import { getSlaDueDate, getSlaStatus } from "../../common/utils/slaUtils";
import { supabase } from "../../common/utils/supabaseClient";

// 🔹 Generate 10 test teams with fake members (keep smaller for visual clarity)
const TEAMS = Array.from({ length: 10 }, (_, i) => ({
  name: `Team ${i + 1}`,
  members: Array.from({ length: 3 }, (__, j) => ({
    name: `User${i + 1}-${j + 1}`,
    incidents: Math.floor(Math.random() * 6) + 1,
  })),
}));

const Incidents = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Incidents Export");
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [teamsOpen, setTeamsOpen] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterContext, setFilterContext] = useState("All Incidents");

  const [expandedTeams, setExpandedTeams] = useState({});

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

  const applyStatusFilter = (status) => {
    setActiveFilter(status);
    if (status === "all") {
      setFilteredIncidents(incidents);
      setFilterContext("All Incidents");
    } else {
      const map = { open: "Open", closed: "Closed", onhold: "On Hold" };
      setFilteredIncidents(incidents.filter((i) => i.status === map[status]));
      setFilterContext(`${map[status]} Incidents`);
    }
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

  const toggleTeamExpand = (teamName) => {
    setExpandedTeams((prev) => ({
      ...prev,
      [teamName]: !prev[teamName],
    }));
  };

  return (
    <Box
      sx={{
        display: "flex",
        width: "100%",
        height: "100%",
        bgcolor: "background.default",
        p: 2,
        gap: 2,
      }}
    >
      {/* Teams Sidebar */}
      {teamsOpen && (
        <Paper
          elevation={2}
          sx={{
            width: 260,
            borderRadius: 3,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              p: 2,
              borderBottom: "1px solid #eee",
              bgcolor: "background.paper",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Teams
            </Typography>
            <IconButton size="small" onClick={() => setTeamsOpen(false)}>
              <MenuIcon />
            </IconButton>
          </Box>

          <Box sx={{ flex: 1, overflowY: "auto", p: 2 }}>
            {TEAMS.map((team) => {
              const totalIncidents = team.members.reduce((a, m) => a + m.incidents, 0);
              const expanded = expandedTeams[team.name] || false;

              return (
                <Paper
                  key={team.name}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    border: "1px solid #eee",
                    bgcolor: "background.default",
                  }}
                >
                  <Box
                    sx={{
                      p: 1.5,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleTeamExpand(team.name)}
                  >
                    <Typography variant="body1" fontWeight="bold">
                      {team.name}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Chip label={totalIncidents} size="small" color="primary" />
                      {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </Box>
                  </Box>

                  <Collapse in={expanded}>
                    <Divider />
                    <Box sx={{ p: 1.5 }}>
                      {team.members.map((m) => (
                        <Box
                          key={m.name}
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            mb: 1,
                            cursor: "pointer",
                            "&:hover": { bgcolor: "action.hover", borderRadius: 1 },
                          }}
                        >
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Avatar sx={{ width: 28, height: 28 }}>{m.name.charAt(0)}</Avatar>
                            <Typography variant="body2">{m.name}</Typography>
                          </Stack>
                          <Chip label={m.incidents} size="small" color="secondary" />
                        </Box>
                      ))}
                    </Box>
                  </Collapse>
                </Paper>
              );
            })}
          </Box>
        </Paper>
      )}

      {/* Incidents Panel */}
      <Paper
        elevation={2}
        sx={{
          flex: 1,
          borderRadius: 3,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {/* Header row */}
        <Box
          sx={{
            px: 2,
            py: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid #eee",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {!teamsOpen && (
              <IconButton size="small" onClick={() => setTeamsOpen(true)}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" fontWeight="bold">
              {filterContext}
            </Typography>
          </Box>

          <Box>
            <IconButton onClick={handleMenuClick}>
              <FileDownloadIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleMenuClose}>
              <MenuItem onClick={() => handleMenuAction("csv")}>Export to CSV</MenuItem>
              <MenuItem onClick={() => handleMenuAction("xlsx")}>Export to Excel</MenuItem>
              <MenuItem onClick={() => handleMenuAction("pdf")}>Export to PDF</MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Status Filters */}
        <Stack direction="row" spacing={1} sx={{ p: 2 }}>
          {["all", "open", "closed", "onhold"].map((s) => (
            <Button
              key={s}
              size="small"
              variant={activeFilter === s ? "contained" : "outlined"}
              onClick={() => applyStatusFilter(s)}
            >
              {s === "all"
                ? "All"
                : s === "onhold"
                ? "On Hold"
                : s.charAt(0).toUpperCase() + s.slice(1)}
            </Button>
          ))}
        </Stack>

        {/* Incidents List */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
          {filteredIncidents.map((incident) => (
            <Paper
              key={incident.id}
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                boxShadow: "0 1px 4px rgba(20,40,80,0.05)",
                cursor: "pointer",
                bgcolor: "background.default",
              }}
              onClick={() => navigate(`/incidents/${incident.id}`)}
            >
              <Typography sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 1 }}>
                <strong>#{incident.id}</strong> • {incident.category}
                <Chip label={incident.status} size="small" sx={{ ml: 1, height: 20 }} />
                <Chip
                  label={getSlaStatus(incident.slaDueDate)}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 20,
                    bgcolor:
                      getSlaStatus(incident.slaDueDate) === "Overdue" ? "#ffe0e0" : "#e7f7ed",
                    color:
                      getSlaStatus(incident.slaDueDate) === "Overdue" ? "#d32f2f" : "#2e7d32",
                  }}
                />
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold">
                {incident.title}
              </Typography>
              <Typography variant="body2">{incident.description}</Typography>
              <Typography sx={{ fontSize: "0.8em", color: "text.disabled", mt: 1 }}>
                Created: {new Date(incident.created).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Paper>

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
