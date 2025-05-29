// src/pages/ServiceRequestDetail.js

import React from "react";
import {
  Box,
  Typography,
  Chip,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
} from "@mui/material";
import AssignmentTurnedInIcon from "@mui/icons-material/AssignmentTurnedIn";
import ScheduleIcon from "@mui/icons-material/Schedule";
import DoneIcon from "@mui/icons-material/Done";

const dummyRequest = {
  id: 101,
  title: "Software Installation",
  description: "Install Adobe Photoshop for design team.",
  status: "In Progress",
  created: "2024-05-28",
  updated: "2024-05-29",
  tasks: [
    {
      id: 1,
      title: "Check Licensing Availability",
      assignee: "Alice Smith",
      status: "Pending",
    },
    {
      id: 2,
      title: "Install Software",
      assignee: "Bob Taylor",
      status: "In Progress",
    },
    {
      id: 3,
      title: "Verify Installation",
      assignee: "QA Team",
      status: "Completed",
    },
  ],
};

const getIcon = (status) => {
  switch (status) {
    case "Completed":
      return <DoneIcon color="success" />;
    case "In Progress":
      return <ScheduleIcon color="primary" />;
    default:
      return <AssignmentTurnedInIcon color="disabled" />;
  }
};

const ServiceRequestDetail = () => {
  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography variant="h5">
        {dummyRequest.title} <Chip label={dummyRequest.status} color="primary" sx={{ ml: 2 }} />
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Request ID: #{dummyRequest.id}
      </Typography>

      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Description
        </Typography>
        <Typography variant="body2" sx={{ mb: 2 }}>
          {dummyRequest.description}
        </Typography>
        <Divider sx={{ my: 2 }} />

        <Typography variant="body2">
          <strong>Created:</strong> {dummyRequest.created}
        </Typography>
        <Typography variant="body2">
          <strong>Last Updated:</strong> {dummyRequest.updated}
        </Typography>
      </Paper>

      <Paper sx={{ mt: 3, p: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Tasks
        </Typography>
        <List>
          {dummyRequest.tasks.map((task) => (
            <ListItem key={task.id} divider>
              <ListItemIcon>{getIcon(task.status)}</ListItemIcon>
              <ListItemText
                primary={task.title}
                secondary={`Assignee: ${task.assignee} | Status: ${task.status}`}
              />
            </ListItem>
          ))}
        </List>
      </Paper>
    </Box>
  );
};

export default ServiceRequestDetail;
