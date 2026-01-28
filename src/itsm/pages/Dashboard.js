// src/itsm/pages/Dashboard.js
import React, { useState, useEffect, useMemo, useCallback } from "react";
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

// -------------------------
// Local “glass” helpers (ITSM-side)
// (Keeps this file self-contained for now. Later we can centralize.)
// -------------------------

function useGlassTokens(theme) {
  const isDark = theme.palette.mode === "dark";

  return useMemo(() => {
    const border = isDark
      ? "1px solid rgba(255,255,255,0.12)"
      : "1px solid rgba(15,23,42,0.10)";
    const divider = isDark ? "rgba(255,255,255,0.10)" : "rgba(15,23,42,0.08)";

    const panelBg = isDark
      ? "linear-gradient(135deg, rgba(255,255,255,0.09), rgba(255,255,255,0.04))"
      : "linear-gradient(135deg, rgba(255,255,255,0.80), rgba(255,255,255,0.55))";

    const widgetBg = isDark
      ? "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))"
      : "linear-gradient(135deg, rgba(255,255,255,0.75), rgba(255,255,255,0.50))";

    const shadow = isDark
      ? "0 18px 55px rgba(0,0,0,0.35)"
      : "0 18px 55px rgba(2,6,23,0.12)";
    const shadowHover = isDark
      ? "0 22px 70px rgba(0,0,0,0.45)"
      : "0 22px 70px rgba(2,6,23,0.16)";

    const subtleBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(2,6,23,0.04)";
    const subtleBorder = isDark
      ? "1px solid rgba(255,255,255,0.10)"
      : "1px solid rgba(2,6,23,0.08)";

    // Background similar vibe to portal, but theme-aware
    const pageBg = isDark
      ? `
        radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.28), transparent 60%),
        radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.18), transparent 55%),
        radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.10), transparent 55%),
        linear-gradient(180deg, #070A12 0%, #0A1022 45%, #0B1633 100%)
      `
      : `
        radial-gradient(1200px 800px at 20% 10%, rgba(124, 92, 255, 0.12), transparent 60%),
        radial-gradient(1000px 700px at 85% 25%, rgba(56, 189, 248, 0.10), transparent 55%),
        radial-gradient(900px 700px at 60% 90%, rgba(34, 197, 94, 0.08), transparent 55%),
        linear-gradient(180deg, #F8FAFF 0%, #EEF3FF 45%, #EAF2FF 100%)
      `;

    return {
      isDark,
      page: {
        background: pageBg,
        color: isDark ? "rgba(255,255,255,0.92)" : "rgba(2,6,23,0.92)",
      },
      glass: {
        border,
        divider,
        bg: panelBg,
        widgetBg,
        shadow,
        shadowHover,
      },
      subtle: {
        bg: subtleBg,
        border: subtleBorder,
      },
      chip: {
        bg: subtleBg,
        border: subtleBorder,
        text: isDark ? "rgba(255,255,255,0.85)" : "rgba(2,6,23,0.78)",
      },
    };
  }, [isDark]); // ✅ FIX: depend on what the memo actually uses
}

function GlassPanel({ children, sx, t }) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: t.glass.border,
        background: t.glass.bg,
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        boxShadow: t.glass.shadow,
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

const Dashboard = () => {
  const theme = useTheme();
  const t = useGlassTokens(theme);

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

  const onDragEnd = useCallback(
    (result) => {
      if (!result.destination) return;
      const reordered = Array.from(widgets);
      const [removed] = reordered.splice(result.source.index, 1);
      reordered.splice(result.destination.index, 0, removed);
      setWidgets(reordered);
    },
    [widgets]
  );

  const deleteWidget = useCallback((id) => {
    setWidgets((prev) => prev.filter((w) => w.id !== id));
  }, []);

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
              elevation={0}
              sx={{
                borderRadius: 3,
                border: t.glass.border,
                background: t.glass.widgetBg,
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                boxShadow: "none",
                p: 2,
                position: "relative",
                overflow: "hidden",
                "&:hover": {
                  boxShadow: t.glass.shadowHover,
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 4,
                  background: theme.palette.primary.main,
                  opacity: 0.9,
                },
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
              >
                <Typography sx={{ fontSize: "0.95rem", fontWeight: 750 }}>
                  Incident #{i + 1}
                </Typography>
                <Chip
                  size="small"
                  label={
                    i % 3 === 0 ? "Open" : i % 3 === 1 ? "Closed" : "Pending"
                  }
                  color={
                    i % 3 === 0 ? "warning" : i % 3 === 1 ? "success" : "info"
                  }
                  sx={{ fontWeight: 700 }}
                />
              </Stack>

              <Typography variant="body2" mt={1} sx={{ opacity: 0.9 }}>
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
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
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
            <CartesianGrid strokeDasharray="3 3" stroke={theme.palette.divider} />
            <XAxis dataKey="name" />
            <YAxis />
            <Line
              type="monotone"
              dataKey="Changes"
              stroke={useGradient ? "url(#lineGradient)" : theme.palette.primary.main}
              strokeWidth={2}
              dot={{ r: 4, fill: theme.palette.primary.main }}
            />
            <RechartTooltip />
            {useGradient && (
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={theme.palette.primary.light} />
                  <stop offset="100%" stopColor={theme.palette.primary.dark} />
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
    <Box
      sx={{
        minHeight: "100vh",
        color: t.page.color,
        background: t.page.background,
        px: { xs: 1, sm: 2 },
        py: 2,
      }}
    >
      {/* 🔹 Onboarding banner row */}
      <Box sx={{ maxWidth: 1400, mx: "auto", mb: 2 }}>
        <TenantOnboardingBanner />
      </Box>

      {/* Main dashboard panel */}
      <GlassPanel
        t={t}
        sx={{
          maxWidth: 1400,
          mx: "auto",
          p: { xs: 2, sm: 3 },
          display: "flex",
          flexDirection: "column",
          gap: 2.5,
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
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 950, fontSize: 26, lineHeight: 1.1 }}>
              Dashboard
            </Typography>
            <Typography sx={{ opacity: 0.72, fontSize: 13, mt: 0.5 }}>
              Drag widgets to rearrange • Real data will plug in here next
            </Typography>
          </Box>

          {!isPreview && (
            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              alignItems={{ xs: "stretch", sm: "center" }}
            >
              <FormControlLabel
                control={
                  <Switch
                    checked={useGradient}
                    onChange={() => setUseGradient((v) => !v)}
                  />
                }
                label="Gradient line"
                sx={{ m: 0 }}
              />

              <Button
                variant="outlined"
                size="small"
                onClick={() => setWidgets([])}
                sx={{
                  borderRadius: 999,
                  fontWeight: 900,
                  textTransform: "none",
                  borderColor: t.isDark
                    ? "rgba(255,255,255,0.18)"
                    : "rgba(2,6,23,0.14)",
                  color: t.isDark
                    ? "rgba(255,255,255,0.88)"
                    : "rgba(2,6,23,0.82)",
                  background: t.isDark
                    ? "rgba(255,255,255,0.04)"
                    : "rgba(255,255,255,0.55)",
                }}
              >
                Reset
              </Button>
            </Stack>
          )}
        </Box>

        <Divider sx={{ borderColor: t.glass.divider }} />

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
                    {(dragProvided) => (
                      <Box
                        ref={dragProvided.innerRef}
                        {...dragProvided.draggableProps}
                        {...dragProvided.dragHandleProps}
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
                          elevation={0}
                          sx={{
                            flexGrow: 1,
                            borderRadius: 4,
                            p: 2,
                            position: "relative",
                            border: t.glass.border,
                            background: t.glass.widgetBg,
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                            boxShadow: "none",
                            transition: "box-shadow 0.2s ease, transform 0.2s ease",
                            "&:hover": {
                              boxShadow: t.glass.shadowHover,
                              transform: "translateY(-1px)",
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
                                color: theme.palette.text.secondary,
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          )}

                          <Typography sx={{ fontWeight: 900, fontSize: 16, mb: 1 }}>
                            {widget.title}
                          </Typography>

                          <Divider sx={{ mb: 2, borderColor: t.glass.divider }} />

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

        {!widgets.length ? (
          <Box sx={{ py: 2 }}>
            <Typography sx={{ fontWeight: 900, fontSize: 16 }}>
              No widgets selected
            </Typography>
            <Typography sx={{ opacity: 0.72, mt: 0.5 }}>
              Choose a dashboard layout (default/minimal/analytics) or create a custom
              one.
            </Typography>
          </Box>
        ) : null}
      </GlassPanel>
    </Box>
  );
};

export default Dashboard;
