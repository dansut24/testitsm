// src/pages/ServiceRequestDetail.js

import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Divider,
  Paper,
  Chip,
  Tabs,
  Tab,
} from "@mui/material";

const dummyRequest = {
  id: 1,
  title: "Access to shared drive",
  description: "User needs access to the marketing shared drive.",
  status: "Pending Approval",
  category: "Access Request",
  requester: "Jane Smith",
  createdAt: "2024-05-20",
  updatedAt: "2024-05-21",
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
        {dummyRequest.title} <Chip label={dummyRequest.status} color="warning" sx={{ ml: 2 }} />
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
          <strong>Requester:</strong> {dummyRequest.requester}
        </Typography>
        <Typography variant="body2">
          <strong>Created:</strong> {dummyRequest.createdAt}
        </Typography>
        <Typography variant="body2">
          <strong>Last Updated:</strong> {dummyRequest.updatedAt}
        </Typography>
      </Paper>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="Details" />
        <Tab label="Approvals" />
        <Tab label="Comments" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && <Typography variant="body2">[Details content here]</Typography>}
        {tab === 1 && <Typography variant="body2">[Approvals content here]</Typography>}
        {tab === 2 && <Typography variant="body2">[Comments content here]</Typography>}
      </Box>
    </Box>
  );
};

export default ServiceRequestDetail;
