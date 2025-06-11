import React, { useEffect, useState } from "react";
import { Typography, List, ListItem, ListItemText, CircularProgress } from "@mui/material";
import { supabase } from "../../common/utils/supabaseClient";

const RequestWidget = ({ userId }) => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRequests = async () => {
      const { data } = await supabase
        .from("service_requests")
        .select("id, title, status")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setRequests(data);
      setLoading(false);
    };

    fetchRequests();
  }, [userId]);

  if (loading) return <CircularProgress size={24} />;
  if (requests.length === 0) return <Typography>No service requests found.</Typography>;

  return (
    <>
      <Typography variant="h6" gutterBottom>📦 My Requests</Typography>
      <List dense>
        {requests.map((req) => (
          <ListItem key={req.id} disablePadding>
            <ListItemText
              primary={req.title}
              secondary={req.status}
            />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default RequestWidget;
