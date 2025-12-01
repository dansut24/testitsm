// src/itsm/pages/Dashboard.js
import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Stack,
  Button,
  Chip,
  FormControlLabel,
  Switch,
  Divider,
} from "@mui/material";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";

// ✅ Onboarding banner
import TenantOnboardingBanner from "../components/TenantOnboardingBanner";

const predefinedLayouts = {
  default: ["pie", "bar", "line", "table"],
  minimal: ["pie", "table"],
  analytics: ["pie", "bar", "line"],
};

const widgetMetadata = {
  pie: { id: "pie", type: "pie", title: "Incidents by Status" },
  bar: { id: "bar", type: "bar", title: "Monthly Requests" },
  line: { id: "line", type: "line", title: "Changes Over Time" },
  table: { id: "table", type: "table", title: "Latest Incidents" },
};

const samplePieData = [
  { name: "Open", value: 8 },
  { name: "Closed", value: 12 },
  { name: "Pending", value: 5 },
];

const sampleBarData = [
  { name: "Jan", Requests: 5 },
  { name: "Feb", Requests: 9 },
  { name: "Mar", Requests: 7 },
  { name: "Apr", Requests: 12 },
];

const sampleLineData = [
  { name: "Week 1", Changes: 3 },
  { name: "Week 2", Changes: 5 },
  { name: "Week 3", Changes: 2 },
  { name: "Week 4", Changes: 7 },
];

const COLORS = ["#ff6f61", "#6a67ce", "#6fcf97"];

const Dashboard = () => {
  const theme = useTheme();
  const isPreview =
    new URLSearchParams(window.location.search).get("preview") === "true";

  const [widgets, setWidgets] = useState([]);
  const [useGradient, setUseGradient] = useState(false);

  useEffect(() => {
    const selected = localStorage.getItem("selectedDashboard") || "default";
    let layout = predefinedLayouts[selected];

    if (!layout) {
      const customDashboards = JSON.parse(
        localStorage.getItem("custom-dashboards") || "[]"
      );
      const found = customDashboards.find((d) => d.id === selected);
      layout = found?.widgets || predefinedLayouts["default"];
    }

    const widgetData = layout.map((id) => ({
      ...widgetMetadata[id],
      id: `${id}-${Date.now() + Math.random()}`,
    }));
    setWidgets(widgetData);
  }, []);

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(widgets);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setWidgets(reordered);
  };

  const deleteWidget = (id) => {
    setWidgets(widgets.filter((w) => w.id !== id));
  };

  const ChartWrapper = ({ children }) => (
    <Box sx={{ width: "100%", height: 240 }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </Box>
  );

  const renderWidget = (widget) => {
    if (widget.type === "table") {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Paper
              key={i}
              sx={{
                background: theme.palette.background.default,
                borderLeft: `5px solid ${theme.palette.primary.main}`,
                p: 2,
                borderRadius: 2,
                boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
                "&:hover": { boxShadow: "0 2px 8px rgba(0,0,0,0.12)" },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 600 }}>
                  Incident #{i + 1}
                </Typography>
                <Chip
                  size="small"
                  label={
                    i % 3 === 0 ? "Open" : i % 3 === 1 ? "Closed" : "Pending"
                  }
                  color={i % 3 === 0 ? "warning" : i % 3 === 1 ? "success" : "info"}
                  sx={{ fontWeight: 500 }}
                />
              </Stack>
              <Typography variant="body2" mt={1}>
                Example description for Incident #{i + 1}.
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.8em",
                  color: theme.palette.text.secondary,
                  mt: 1,
                }}
              >
                Created: {new Date().toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      );
    }

    if (widget.type === "pie") {
      return (
        <ChartWrapper>
          <PieChart>
            <Pie
              data={samplePieData}
              cx="50%"
              cy="50%"
              outerRadius="80%"
              dataKey="value"
            >
              {samplePieData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <RechartTooltip />
          </PieChart>
        </ChartWrapper>
      );
    }

    if (widget.type === "bar") {
      return (
        <ChartWrapper>
          <BarChart data={sampleBarData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis dataKey="name" />
            <YAxis />
            <Bar
              dataKey="Requests"
              fill={theme.palette.primary.main}
              radius={[6, 6, 0, 0]}
            />
            <RechartTooltip />
          </BarChart>
        </ChartWrapper>
      );
    }

    if (widget.type === "line") {
      return (
        <ChartWrapper>
          <LineChart data={sampleLineData}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={theme.palette.divider}
            />
            <XAxis dataKey="name" />
            <YAxis />
            <Line
              type="monotone"
              dataKey="Changes"
              stroke={
                useGradient ? "url(#lineGradient)" : theme.palette.primary.main
              }
              strokeWidth={2}
              dot={{ r: 4, fill: theme.palette.primary.main }}
            />
            <RechartTooltip />
            {useGradient && (
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="0%"
                    stopColor={theme.palette.primary.light}
                  />
                  <stop
                    offset="100%"
                    stopColor={theme.palette.primary.dark}
                  />
                </linearGradient>
              </defs>
            )}
          </LineChart>
        </ChartWrapper>
      );
    }

    return null;
  };

  return (
    <Box sx={{ px: { xs: 1, sm: 2 }, py: 2 }}>
      {/* 🔹 Onboarding banner row */}
      <Box sx={{ maxWidth: 1400, mx: "auto", mb: 2 }}>
        <TenantOnboardingBanner />
      </Box>

      {/* Main dashboard card */}
      <Box
        sx={{
          maxWidth: 1400,
          mx: "auto",
          bgcolor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h4" fontWeight="bold" color="primary">
            Dashboard
          </Typography>
          {!isPreview && (
            <Stack direction="row" spacing={1} alignItems="center">
              <FormControlLabel
                control={
                  <Switch
                    checked={useGradient}
                    onChange={() => setUseGradient(!useGradient)}
                  />
                }
                label="Gradient Theme"
              />
              <Button
                variant="outlined"
                size="small"
                color="secondary"
                onClick={() => setWidgets([])}
              >
                Reset
              </Button>
            </Stack>
          )}
        </Box>

        {/* Widgets */}
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="dashboard" direction="horizontal">
            {(provided) => (
              <Box
                ref={provided.innerRef}
                {...provided.droppableProps}
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 2,
                  width: "100%",
                }}
              >
                {widgets.map((widget, index) => (
                  <Draggable
                    key={widget.id}
                    draggableId={widget.id}
                    index={index}
                    isDragDisabled={isPreview}
                  >
                    {(provided) => (
                      <Box
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        sx={{
                          flex: {
                            xs: "1 1 100%",
                            sm: "1 1 calc(50% - 8px)",
                            md: "1 1 calc(33.333% - 16px)",
                          },
                          display: "flex",
                          minWidth: 0,
                        }}
                      >
                        <Paper
                          elevation={2}
                          sx={{
                            flexGrow: 1,
                            borderRadius: 3,
                            p: 2,
                            position: "relative",
                            backgroundColor: theme.palette.background.paper,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                            },
                          }}
                        >
                          {!isPreview && (
                            <IconButton
                              size="small"
                              onClick={() => deleteWidget(widget.id)}
                              sx={{
                                position: "absolute",
                                top: 8,
                                right: 8,
                                color: theme.palette.grey[600],
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}
                          <Typography
                            variant="h6"
                            fontWeight="bold"
                            mb={1}
                            color="text.primary"
                          >
                            {widget.title}
                          </Typography>
                          <Divider sx={{ mb: 2 }} />
                          {renderWidget(widget)}
                        </Paper>
                      </Box>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </Box>
            )}
          </Droppable>
        </DragDropContext>
      </Box>
    </Box>
  );
};

export default Dashboard;
