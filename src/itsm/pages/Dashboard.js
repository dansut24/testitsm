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
  Switch
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
  ResponsiveContainer
} from "recharts";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTheme } from "@mui/material/styles";

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
  team: { id: "team", type: "table", title: "Team Incidents" },
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
  const isPreview = new URLSearchParams(window.location.search).get("preview") === "true";

  const [widgets, setWidgets] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [useGradient, setUseGradient] = useState(false);

  useEffect(() => {
    const selected = localStorage.getItem("selectedDashboard") || "default";
    let layout = predefinedLayouts[selected];

    if (!layout) {
      const customDashboards = JSON.parse(localStorage.getItem("custom-dashboards") || "[]");
      const found = customDashboards.find(d => d.id === selected);
      layout = found?.widgets || predefinedLayouts["default"];
    }

    const widgetData = layout.map((id) => ({
      ...widgetMetadata[id],
      id: `${id}-${Date.now() + Math.random()}`
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

  const renderWidget = (widget) => {
    if (widget.type === "table") {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, overflowY: 'auto', height: '100%', p: 1 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Paper
              key={i}
              sx={{
                background: "#f5f8fe",
                borderLeft: "5px solid #295cb3",
                p: 2,
                borderRadius: 1.5,
                boxShadow: "0 1px 6px rgba(20,40,80,0.03)",
              }}
            >
              <Typography sx={{ fontSize: "0.95rem", color: "#456", mb: 1 }}>
                <strong>#{i + 1}</strong> • Incident #{i + 1}
                <Chip
                  label={i % 3 === 0 ? "Open" : i % 3 === 1 ? "Closed" : "Pending"}
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
              </Typography>
              <Typography variant="body2">
                Example description for Incident #{i + 1}.
              </Typography>
              <Typography sx={{ fontSize: "0.92em", color: "#789", mt: 1 }}>
                Created: {new Date().toLocaleString()}
              </Typography>
            </Paper>
          ))}
        </Box>
      );
    }

    const ChartWrapper = ({ children }) => (
      <Box sx={{ width: '100%', height: 240, overflow: 'hidden', display: 'flex' }}>
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </Box>
    );

    if (widget.type === "pie") {
      return (
        <ChartWrapper>
          <PieChart>
            <Pie data={samplePieData} cx="50%" cy="50%" outerRadius="100%" dataKey="value">
              {samplePieData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Bar dataKey="Requests" fill={theme.palette.primary.main} />
            <RechartTooltip />
          </BarChart>
        </ChartWrapper>
      );
    }
    if (widget.type === "line") {
      return (
        <ChartWrapper>
          <LineChart data={sampleLineData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Line type="monotone" dataKey="Changes" stroke={useGradient ? '#ffffff' : theme.palette.primary.main} />
            <RechartTooltip />
          </LineChart>
        </ChartWrapper>
      );
    }
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, backgroundColor: theme.palette.background.default, width: '100%' }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">Dashboard</Typography>
        {!isPreview && (
          <Stack direction="row" spacing={1} alignItems="center">
            <FormControlLabel
              control={<Switch checked={useGradient} onChange={() => setUseGradient(!useGradient)} />}
              label="Gradient Theme"
            />
            <Button variant="outlined" size="small" onClick={() => setWidgets([])}>Reset</Button>
          </Stack>
        )}
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard" direction="horizontal">
          {(provided) => (
            <Box
              ref={provided.innerRef}
              {...provided.droppableProps}
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 2,
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              {widgets.map((widget, index) => (
                <Draggable key={widget.id} draggableId={widget.id} index={index} isDragDisabled={isPreview}>
                  {(provided) => (
                    <Box
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      sx={{
                        flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.333% - 16px)' },
                        display: 'flex',
                        minWidth: 0,
                      }}
                    >
                      <Paper
                        elevation={4}
                        sx={{ flexGrow: 1, borderRadius: 3, p: 2, position: 'relative', minWidth: 0 }}
                      >
                        {!isPreview && (
                          <IconButton
                            size="small"
                            onClick={() => deleteWidget(widget.id)}
                            sx={{ position: 'absolute', top: 8, right: 8 }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        )}
                        <Typography variant="h6" fontWeight="bold" mb={2}>{widget.title}</Typography>
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
  );
};

export default Dashboard;
