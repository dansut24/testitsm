import React, { useEffect, useState } from "react";
import GridLayout from "react-grid-layout";
import {
  Box, Paper, Typography, CircularProgress,
  Fab, Dialog, DialogTitle, DialogContent, FormGroup, FormControlLabel, Checkbox
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { widgetRegistry } from "./widgetRegistry";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";

const DashboardWidgetGrid = () => {
  const { user } = useAuth();
  const [layout, setLayout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [widgetPickerOpen, setWidgetPickerOpen] = useState(false);

  // Fetch layout from Supabase
  useEffect(() => {
    const fetchLayout = async () => {
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("layout")
        .eq("user_id", user.id)
        .single();

      if (data?.layout) setLayout(data.layout);
      else setLayout(Object.values(widgetRegistry).map((w) => w.defaultLayout));

      setLoading(false);
    };

    if (user?.id) fetchLayout();
  }, [user]);

  const onLayoutChange = async (newLayout) => {
    setLayout(newLayout);
    await supabase
      .from("dashboard_layouts")
      .upsert({
        user_id: user.id,
        layout: newLayout,
        updated_at: new Date().toISOString(),
      });
  };

  const toggleWidget = (key) => {
    const exists = layout.find((item) => item.i === key);
    let updatedLayout;
    if (exists) {
      updatedLayout = layout.filter((item) => item.i !== key);
    } else {
      updatedLayout = [...layout, widgetRegistry[key].defaultLayout];
    }
    onLayoutChange(updatedLayout);
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

      <Fab
        color="primary"
        onClick={() => setWidgetPickerOpen(true)}
        sx={{ position: "fixed", bottom: 24, right: 24 }}
      >
        <AddIcon />
      </Fab>

      <Dialog open={widgetPickerOpen} onClose={() => setWidgetPickerOpen(false)}>
        <DialogTitle>Select Dashboard Widgets</DialogTitle>
        <DialogContent>
          <FormGroup>
            {Object.entries(widgetRegistry).map(([key, { label }]) => (
              <FormControlLabel
                key={key}
                control={
                  <Checkbox
                    checked={!!layout.find((item) => item.i === key)}
                    onChange={() => toggleWidget(key)}
                  />
                }
                label={label}
              />
            ))}
          </FormGroup>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default DashboardWidgetGrid;
