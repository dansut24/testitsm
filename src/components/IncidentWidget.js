import React, { useEffect, useState } from "react";
import { Typography, List, ListItem, ListItemText, CircularProgress } from "@mui/material";
import { supabase } from "../supabaseClient";

const IncidentWidget = ({ userId }) => {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from("incidents")
        .select("id, title, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setIncidents(data);
      setLoading(false);
    };

    fetchIncidents();
  }, [userId]);

  if (loading) return <CircularProgress size={24} />;
  if (incidents.length === 0) return <Typography>No incidents found.</Typography>;

  return (
    <>
      <Typography variant="h6" gutterBottom>🛠 My Incidents</Typography>
      <List dense>
        {incidents.map((incident) => (
          <ListItem key={incident.id} disablePadding>
            <ListItemText
              primary={incident.title}
              secondary={incident.status}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default IncidentWidget;
