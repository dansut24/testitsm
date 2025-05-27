import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import {
  PieChart, Pie, Cell, Tooltip as RechartTooltip,
  BarChart, Bar, XAxis, YAxis,
  LineChart, Line, CartesianGrid,
  ResponsiveContainer
} from "recharts";
import { useTheme } from "@mui/material/styles";

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

const COLORS = ["#ff6f61", "#6a67ce", "#6fcf97", "#56ccf2", "#f2994a"];

const layouts = {
  default: [
    { id: "1", type: "pie", title: "Incidents by Status" },
    { id: "2", type: "bar", title: "Monthly Requests" },
    { id: "3", type: "line", title: "Changes Over Time" },
    { id: "10", type: "table", title: "Latest Incidents" }
  ],
  minimal: [
    { id: "1", type: "pie", title: "Incidents by Status" },
    { id: "10", type: "table", title: "Latest Incidents" }
  ],
  analytics: [
    { id: "1", type: "pie", title: "Incidents by Status" },
    { id: "2", type: "bar", title: "Monthly Requests" },
    { id: "3", type: "line", title: "Changes Over Time" }
  ]
};

const Dashboard = () => {
  const theme = useTheme();
  const selectedLayout = localStorage.getItem("selectedDashboard") || "default";

  let widgets = layouts[selectedLayout];

  if (!widgets) {
    const custom = localStorage.getItem("custom-dashboard");
    if (custom) {
      const parsed = JSON.parse(custom);
      widgets = parsed.widgets.map((type, i) => ({
        id: i.toString(),
        type,
        title: parsed.name + " - " + (type.charAt(0).toUpperCase() + type.slice(1))
      }));
    }
  }

  const ChartWrapper = ({ children }) => (
    <Box sx={{ width: '100%', height: 240, overflow: 'hidden', display: 'flex' }}>
      <ResponsiveContainer width="100%" height="100%">
        {children}
      </ResponsiveContainer>
    </Box>
  );

  const renderWidget = (widget) => {
    if (widget.type === "table" || widget.type === "team") {
      return (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, overflowY: 'auto', height: '100%', p: 1 }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Paper key={i} sx={{ background: "#f5f8fe", borderLeft: "5px solid #295cb3", p: 2, borderRadius: 1.5 }}>
              <Typography sx={{ fontSize: "0.95rem", color: "#456", mb: 1 }}>
                <strong>#{i + 1}</strong> • Incident #{i + 1}
              </Typography>
              <Typography variant="body2">Example description for Incident #{i + 1}.</Typography>
            </Paper>
          ))}
        </Box>
      );
    }

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
            <Line type="monotone" dataKey="Changes" stroke={theme.palette.primary.main} />
            <RechartTooltip />
          </LineChart>
        </ChartWrapper>
      );
    }

    return null;
  };

  return (
    <Box sx={{ p: { xs: 1, md: 3 }, backgroundColor: theme.palette.background.default, width: '100%' }}>
      <Typography variant="h4" fontWeight="bold" mb={3}>Dashboard</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        {widgets.map((widget) => (
          <Paper key={widget.id} elevation={4} sx={{ flex: '1 1 calc(33.333% - 16px)', minWidth: '300px', borderRadius: 3, p: 2 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>{widget.title}</Typography>
            {renderWidget(widget)}
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Dashboard;
