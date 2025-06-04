import React, { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import { Paper, Typography, Box, CircularProgress } from "@mui/material";
import { supabase } from "../supabaseClient"; // ensure you have this configured
import { useAuth } from "../context/AuthContext";

const defaultLayout = [
  { i: "incidents", x: 0, y: 0, w: 4, h: 3 },
  { i: "requests", x: 4, y: 0, w: 4, h: 3 },
  { i: "knowledge", x: 8, y: 0, w: 4, h: 3 },
];

const DashboardWidgetGrid = () => {
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // ensure user object includes user.id

  useEffect(() => {
    const fetchLayout = async () => {
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("layout")
        .eq("user_id", user.id)
        .single();

      if (data?.layout) setLayout(data.layout);
      else setLayout(defaultLayout);

      setLoading(false);
    };

    if (user?.id) fetchLayout();
  }, [user]);

  const onLayoutChange = async (newLayout) => {
    setLayout(newLayout);

    const { error } = await supabase
      .from("dashboard_layouts")
      .upsert({
        user_id: user.id,
        layout: newLayout,
        updated_at: new Date().toISOString(),
      });
    if (error) console.error("Failed to save layout", error);
  };

  const renderWidget = (key) => {
    switch (key) {
      case "incidents":
        return <Typography variant="h6">🛠 My Incidents</Typography>;
      case "requests":
        return <Typography variant="h6">📦 My Service Requests</Typography>;
      case "knowledge":
        return <Typography variant="h6">📚 Knowledge Base Tips</Typography>;
      default:
        return <Typography variant="h6">Unknown Widget</Typography>;
    }
  };

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      <GridLayout
        className="layout"
        layout={layout}
        cols={12}
        rowHeight={80}
        width={1200}
        onLayoutChange={onLayoutChange}
        draggableHandle=".widget-header"
      >
        {layout.map((item) => (
          <div key={item.i}>
            <Paper elevation={3} sx={{ height: "100%", p: 2, overflow: "auto" }}>
              <Box className="widget-header" sx={{ cursor: "move", mb: 1 }}>
                {renderWidget(item.i)}
              </Box>
            </Paper>
          </div>
        ))}
      </GridLayout>
    </Box>
  );
};

export default DashboardWidgetGrid;
