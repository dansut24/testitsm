// src/itsm/pages/ServiceRequests.js
import React, { useState } from "react";
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

import {
  exportToCSV,
  exportToXLSX,
  exportToPDF,
} from "../../common/utils/exportUtils";
import ExportPreviewModal from "../components/ExportPreviewModal";
import { useNavigate } from "react-router-dom";

// 🔹 Same fake teams list as Incidents
const TEAMS = Array.from({ length: 40 }, (_, i) => ({
  name: `Team ${i + 1}`,
  members: Array.from({ length: 3 }, (__, j) => ({
    name: `User${i + 1}-${j + 1}`,
    requests: Math.floor(Math.random() * 6) + 1,
  })),
}));

// 🔹 Dummy service requests data (as before)
const testServiceRequests = Array.from({ length: 50 }, (_, i) => ({
  id: i + 1,
  title: `Service Request ${i + 1}`,
  description: `This is a sample description for service request number ${i + 1}.`,
  category: ["Software", "Access", "Hardware"][i % 3],
  status: ["Open", "Pending", "Completed"][i % 3],
  created: "2024-05-16 10:00",
}));

const ServiceRequests = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const navigate = useNavigate();

  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const [previewOpen, setPreviewOpen] = useState(false);
  const [exportType, setExportType] = useState("file");
  const [exportTitle, setExportTitle] = useState("Service Requests Export");

  const [serviceRequests] = useState(testServiceRequests);
  const [filteredRequests, setFilteredRequests] = useState(testServiceRequests);

  const [teamsOpen, setTeamsOpen] = useState(!isMobile);
  const [activeFilter, setActiveFilter] = useState("all");
  const [filterContext, setFilterContext] = useState("All Service Requests");

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
    if (exportType === "csv") exportToCSV(filteredRequests, exportTitle);
    if (exportType === "xlsx") exportToXLSX(filteredRequests, exportTitle);
    if (exportType === "pdf") exportToPDF(filteredRequests, exportTitle);
    setPreviewOpen(false);
  };

  const applyStatusFilter = (statusKey) => {
    setActiveFilter(statusKey);

    if (statusKey === "all") {
      setFilteredRequests(serviceRequests);
      setFilterContext("All Service Requests");
      return;
    }

    const map = { open: "Open", pending: "Pending", completed: "Completed" };
    const label = map[statusKey];

    const next = serviceRequests.filter((r) => r.status === label);
    setFilteredRequests(next);
    setFilterContext(`${label} Service Requests`);
  };

  // 🔹 Compact team list component (mirrors Incidents, but shows "requests")
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
          const totalRequests = team.members.reduce(
            (a, m) => a + m.requests,
            0
          );

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
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Typography variant="body2" fontWeight="bold">
                  {team.name}
                </Typography>
                <Chip label={totalRequests} size="small" color="primary" />
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
                    <Avatar sx={{ width: 22, height: 22 }}>
                      {m.name.charAt(0)}
                    </Avatar>
                    <Typography variant="caption">{m.name}</Typography>
                  </Stack>
                  <Chip label={m.requests} size="small" color="secondary" />
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
            sx: {
              width: "80%",
              maxWidth: 300,
              borderTopRightRadius: 12,
              borderBottomRightRadius: 12,
            },
          }}
        >
          <TeamList />
        </SwipeableDrawer>
      )}

      {/* Service Requests Panel — same layout as Incidents */}
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
              <MenuItem onClick={() => handleMenuAction("new")}>
                New Service Request
              </MenuItem>
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
          {[
            { key: "all", label: "All" },
            { key: "open", label: "Open" },
            { key: "pending", label: "Pending" },
            { key: "completed", label: "Completed" },
          ].map((f) => (
            <Button
              key={f.key}
              size="small"
              variant={activeFilter === f.key ? "contained" : "outlined"}
              onClick={() => applyStatusFilter(f.key)}
            >
              {f.label}
            </Button>
          ))}
        </Stack>

        {/* Service Requests List */}
        <Box sx={{ flex: 1, overflowY: "auto", px: 2, pb: 2 }}>
          {filteredRequests.map((req) => (
            <Paper
              key={req.id}
              sx={{
                mb: 2,
                p: 1.5,
                borderRadius: 2,
                boxShadow: "0 1px 4px rgba(20,40,80,0.05)",
                cursor: "pointer",
                bgcolor: "background.default",
              }}
              onClick={() => navigate(`/service-requests/${req.id}`)}
            >
              <Typography
                sx={{ fontSize: "0.85rem", color: "text.secondary", mb: 1 }}
              >
                <strong>#{req.id}</strong> • {req.category}
                <Chip
                  label={req.status}
                  size="small"
                  sx={{
                    ml: 1,
                    height: 18,
                    fontSize: "0.7rem",
                  }}
                />
              </Typography>
              <Typography variant="subtitle2" fontWeight="bold">
                {req.title}
              </Typography>
              <Typography variant="body2">{req.description}</Typography>
              <Typography
                sx={{ fontSize: "0.75em", color: "text.disabled", mt: 1 }}
              >
                Created: {req.created}
              </Typography>
            </Paper>
          ))}
        </Box>
      </Box>

      {/* Export preview modal */}
      <ExportPreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        onConfirm={handleExportConfirm}
        exportTitle={exportTitle}
        setExportTitle={setExportTitle}
        exportType={exportType || "file"}
        recordCount={filteredRequests.length}
      />
    </Box>
  );
};

export default ServiceRequests;
