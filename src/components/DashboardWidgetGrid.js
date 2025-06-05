import React, { useState, useEffect } from "react";
import {
  Box, Paper, Typography, Grid, CircularProgress,
  Fab, Dialog, DialogTitle, DialogContent, FormGroup, FormControlLabel, Checkbox
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { supabase } from "../supabaseClient";
import { useAuth } from "../context/AuthContext";
import { widgetRegistry } from "./widgetRegistry";

const DashboardWidgetGrid = () => {
  const { user } = useAuth();
  const [widgets, setWidgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [widgetPickerOpen, setWidgetPickerOpen] = useState(false);

  useEffect(() => {
    const fetchLayout = async () => {
      const { data, error } = await supabase
        .from("dashboard_layouts")
        .select("layout")
        .eq("user_id", user.id)
        .single();

      if (data?.layout) setWidgets(data.layout);
      else setWidgets(Object.keys(widgetRegistry)); // show all by default

      setLoading(false);
    };

    if (user?.id) fetchLayout();
  }, [user]);

  const saveLayout = async (updatedLayout) => {
    setWidgets(updatedLayout);
    await supabase
      .from("dashboard_layouts")
      .upsert({
        user_id: user.id,
        layout: updatedLayout,
        updated_at: new Date().toISOString(),
      });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const reordered = Array.from(widgets);
    const [moved] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, moved);
    saveLayout(reordered);
  };

  const toggleWidget = (key) => {
    const updated = widgets.includes(key)
      ? widgets.filter((k) => k !== key)
      : [...widgets, key];
    saveLayout(updated);
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
    <Box sx={{ p: 2 }}>
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="dashboard" direction="vertical">
          {(provided) => (
            <Grid
              container
              spacing={2}
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {widgets.map((key, index) => (
                <Draggable key={key} draggableId={key} index={index}>
                  {(provided) => (
                    <Grid
                      item
                      xs={12}
                      md={6}
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <Paper sx={{ p: 2, minHeight: 120 }}>
                        {renderWidget(key)}
                      </Paper>
                    </Grid>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </Grid>
          )}
        </Droppable>
      </DragDropContext>

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
                    checked={widgets.includes(key)}
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
