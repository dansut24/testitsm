// src/itsm/pages/Incidents.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
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
  const [filter, setFilter] = useState("All");

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

  // Apply quick filter chips
  const applyFilter = (selectedFilter, list = incidents) => {
    setFilter(selectedFilter);
    if (selectedFilter === "All") {
      setFilteredIncidents(list);
    } else if (selectedFilter === "Overdue") {
      setFilteredIncidents(
        list.filter((i) => getSlaStatus(i.slaDueDate) === "Overdue")
      );
    } else {
      setFilteredIncidents(list.filter((i) => i.status === selectedFilter));
    }
  };

  // Initial + live updates from Supabase
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
        applyFilter(filter, enriched);
      }
    };

    fetchIncidents();

    // Realtime subscription for live updates
    const channel = supabase
      .channel("incidents-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "incidents" },
        () => {
          fetchIncidents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line
  }, []);

  // Priority-based color coding
  const getPriorityColor = (priority) => {
    switch (priority) {
      case "Critical":
        return "#f44336"; // red
      case "High":
        return "#ff9800"; // orange
      case "Medium":
        return "#2196f3"; // blue
      case "Low":
        return "#4caf50"; // green
      default:
        return "#9e9e9e"; // grey
    }
  };

  return (
    <Box sx={{ width: "100%", p: { xs: 1, md: 2 } }}>
      {/* Header Row */}
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
        <Typography variant="h6" fontWeight="bold">
          {filter === "All" ? "My Incidents" : `${filter} Incidents`}
        </Typography>

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

      {/* Quick Filters */}
      <Stack direction="row" spacing={1} sx={{ px: 2, py: 1, flexWrap: "wrap" }}>
        {["All", "Open", "Closed", "Pending", "Overdue"].map((f) => (
          <Chip
            key={f}
            label={f}
            color={filter === f ? "primary" : "default"}
            onClick={() => applyFilter(f)}
            clickable
          />
        ))}
      </Stack>

      {/* Incidents List */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          px: { xs: 1, md: 2 },
          py: 2,
        }}
      >
        {filteredIncidents.map((incident) => (
          <Paper
            key={incident.id}
            sx={{
              background: "background.paper",
              borderLeft: `6px solid ${getPriorityColor(
                incident.priority || "Medium"
              )}`,
              p: 1.5,
              borderRadius: 1.5,
              cursor: "pointer",
              boxShadow: "0 1px 4px rgba(20,40,80,0.08)",
              "&:hover": { boxShadow: "0 2px 6px rgba(20,40,80,0.15)" },
            }}
            onClick={() => navigate(`/incidents/${incident.id}`)}
          >
            <Typography
              sx={{ fontSize: "0.9rem", color: "text.secondary", mb: 0.5 }}
            >
              <strong>#{incident.id}</strong> • {incident.category}
              <Chip
                label={incident.status}
                size="small"
                sx={{
                  ml: 1,
                  bgcolor: "grey.200",
                  fontSize: "0.75em",
                  height: 20,
                  fontWeight: 500,
                  borderRadius: "10px",
                }}
              />
              <Chip
                label={getSlaStatus(incident.slaDueDate)}
                size="small"
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
                  height: 20,
                  fontWeight: 500,
                  borderRadius: "10px",
                }}
              />
            </Typography>
            <Typography variant="subtitle1" fontWeight="bold">
              {incident.title}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 0.5 }}
              noWrap
            >
              {incident.description}
            </Typography>
            <Typography
              sx={{ fontSize: "0.8em", color: "text.disabled", mt: 0.5 }}
            >
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
        recordCount={filteredIncidents.length}
      />
    </Box>
  );
};

export default Incidents;
