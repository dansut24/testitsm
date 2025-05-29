import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Chip,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const dummyRequest = {
  id: 1,
  title: "Software Installation Request",
  description: "Requesting installation of Adobe Photoshop.",
  category: "Software",
  status: "Open",
  created: "2024-05-25",
  updated: "2024-05-26",
  tasks: [
    {
      title: "Verify software license",
      assignee: "Licensing Team",
      status: "In Progress",
    },
    {
      title: "Install software",
      assignee: "Desktop Support",
      status: "Not Started",
    },
  ],
};

const ServiceRequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = React.useState(0);

  const handleTabChange = (e, newValue) => setTab(newValue);

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
        Back
      </Button>

      <Typography variant="h5" sx={{ mt: 2 }}>
        {dummyRequest.title} <Chip label={dummyRequest.status} color="primary" sx={{ ml: 2 }} />
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Request ID: #{id}
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
          <strong>Category:</strong> {dummyRequest.category}
        </Typography>
        <Typography variant="body2">
          <strong>Created:</strong> {dummyRequest.created}
        </Typography>
        <Typography variant="body2">
          <strong>Last Updated:</strong> {dummyRequest.updated}
        </Typography>
      </Paper>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="Timeline" />
        <Tab label="Comments" />
        <Tab label="Attachments" />
        <Tab label="Actions" />
        <Tab label="Tasks" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && <Typography variant="body2">[Timeline goes here]</Typography>}
        {tab === 1 && <Typography variant="body2">[Comments go here]</Typography>}
        {tab === 2 && <Typography variant="body2">[Attachments go here]</Typography>}
        {tab === 3 && <Typography variant="body2">[Actions go here]</Typography>}
        {tab === 4 && (
          <List>
            {dummyRequest.tasks.map((task, index) => (
              <ListItem key={index} sx={{ pl: 0 }}>
                <ListItemText
                  primary={`${task.title} — ${task.status}`}
                  secondary={`Assignee: ${task.assignee}`}
                />
              </ListItem>
            ))}
          </List>
        )}
      </Box>
    </Box>
  );
};

export default ServiceRequestDetail;
