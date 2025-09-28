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
  Divider,
  useMediaQuery,
  SwipeableDrawer,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import MenuIcon from "@mui/icons-material/Menu";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { exportToCSV, exportToXLSX, exportToPDF } from "../../common/utils/exportUtils";
import ExportPreviewModal from "../components/ExportPreviewModal";
import { useNavigate } from "react-router-dom";
import { getSlaDueDate, getSlaStatus } from "../../common/utils/slaUtils";
import { supabase } from "../../common/utils/supabaseClient";

// 🔹 Generate 40 test teams with fake members
const TEAMS = Array.from({ length: 40 }, (_, i) => ({
  name: `Team ${i + 1}`,
  members: Array.from({ length: 3 }, (__, j) => ({
    name: `User${i + 1}-${j + 1}`,
    incidents: Math.floor(Math.random() * 6) + 1,
  })),
}));

const Incidents = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Incidents Export");
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [teamsOpen, setTeamsOpen] = useState(!isMobile);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterContext, setFilterContext] = useState("All Incidents");

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

  // 🔹 Compact team list component
  const TeamList = () => (
    <Paper
      elevation={2}
      sx={{
        width: isMobile ? "100%" : 260,
        borderRadius: 3,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        maxHeight: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          p: 1.5,
          borderBottom: "1px solid #eee",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="subtitle1" fontWeight="bold">
          Teams
        </Typography>
        {!isMobile && (
          <IconButton size="small" onClick={() => setTeamsOpen(false)}>
            <MenuIcon />
          </IconButton>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: "auto", p: 1.5 }}>
        {TEAMS.map((team) => {
          const totalIncidents = team.members.reduce((a, m) => a + m.incidents, 0);

          return (
            <Paper
              key={team.name}
              sx={{
                mb: 1,
                borderRadius: 2,
                border: "1px solid #eee",
                bgcolor: "background.default",
                p: 1,
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" fontWeight="bold">
                  {team.name}
                </Typography>
                <Chip label={totalIncidents} size="small" color="primary" />
              </Stack>
              <Divider sx={{ my: 1 }} />
              {team.members.map((m) => (
                <Stack
                  key={m.name}
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ mb: 0.5 }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Avatar sx={{ width: 22, height: 22 }}>{m.name.charAt(0)}</Avatar>
                    <Typography variant="caption">{m.name}</Typography>
                  </Stack>
                  <Chip label={m.incidents} size="small" color="secondary" />
                </Stack>
              ))}
            </Paper>
          );
        })}
      </Box>
    </Paper>
  );

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        width: "100%",
        height: "100%",
        bgcolor: "background.default",
        p: 2,
        gap: 2,
      }}
    >
      {/* Teams Sidebar */}
      {!isMobile ? (
        teamsOpen && <TeamList />
      ) : (
        <SwipeableDrawer
          anchor="left"
          open={teamsOpen}
          onClose={() => setTeamsOpen(false)}
          onOpen={() => setTeamsOpen(true)}
          PaperProps={{
            sx: { width: "80%", maxWidth: 300, borderTopRightRadius: 12, borderBottomRightRadius: 12 },
          }}
        >
          <TeamList />
        </SwipeableDrawer>
      )}

      {/* Incidents Panel — now spans full width, no outer Paper */}
      <Box
        sx={{
          flex: 1,
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
            {(!teamsOpen || isMobile) && (
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
        <Stack
          direction="row"
          spacing={1}
          sx={{
            p: 1.5,
            flexWrap: "wrap",
            justifyContent: isMobile ? "center" : "flex-start",
          }}
        >
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
              <Typography sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1 }}>
                <strong>#{incident.id}</strong> • {incident.category}
                <Chip label={incident.status} size="small" sx={{ ml: 1, height: 18, fontSize: "0.7rem" }} />
                <Chip
                  label={getSlaStatus(incident.slaDueDate)}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize: "0.7rem",
                    bgcolor:
                      getSlaStatus(incident.slaDueDate) === "Overdue" ? "#ffe0e0" : "#e7f7ed",
                    color:
                      getSlaStatus(incident.slaDueDate) === "Overdue" ? "#d32f2f" : "#2e7d32",
                  }}
                />
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                {incident.title}
              </Typography>
              <Typography variant="body2">{incident.description}</Typography>
              <Typography sx={{ fontSize: "0.75em", color: "text.disabled", mt: 1 }}>
                Created: {new Date(incident.created).toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

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
