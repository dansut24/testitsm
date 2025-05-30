// src/pages/WorkScheduler.js

import React from "react";
import { Box, Typography, Paper, Button } from "@mui/material";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

const localizer = momentLocalizer(moment);

const dummyEvents = [
  {
    title: "Install Antivirus Software",
    start: new Date(2024, 5, 1, 10, 0),
    end: new Date(2024, 5, 1, 11, 0),
    resource: "Task #123",
  },
  {
    title: "New User Setup - Jane Doe",
    start: new Date(2024, 5, 2, 9, 30),
    end: new Date(2024, 5, 2, 12, 0),
    resource: "Service Request #456",
  },
  {
    title: "Change Approval Meeting",
    start: new Date(2024, 5, 3, 14, 0),
    end: new Date(2024, 5, 3, 15, 0),
    resource: "Change #789",
  },
];

const WorkScheduler = () => {
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Work Scheduler
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        View and plan upcoming work across all modules
      </Typography>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Calendar
          localizer={localizer}
          events={dummyEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 600 }}
          popup
          selectable
          onSelectEvent={(event) => alert(`Clicked: ${event.title}`)}
        />
      </Paper>
      <Button variant="outlined" sx={{ mt: 2 }} onClick={() => alert("Future: Add Event Modal")}>Add Event</Button>
    </Box>
  );
};

export default WorkScheduler;
