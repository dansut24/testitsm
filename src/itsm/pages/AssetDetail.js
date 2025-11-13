import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Button,
  Chip,
  Paper,
  Tabs,
  Tab,
} from "@mui/material";

const dummyAsset = {
  assetTag: "LAP12345",
  model: "Dell Latitude 5420",
  manufacturer: "Dell",
  serialNumber: "SN-987654321",
  assignedTo: "Alice Smith",
  location: "London HQ",
  status: "In Use",
  added: "2024-04-10",
  updated: "2024-05-28",
};

const AssetDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);

  const handleTabChange = (e, newValue) => setTab(newValue);

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Button variant="outlined" size="small" onClick={() => navigate(-1)}>
        Back
      </Button>

      <Typography variant="h5" sx={{ mt: 2 }}>
        {dummyAsset.assetTag} - {dummyAsset.model}
        <Chip label={dummyAsset.status} color="primary" sx={{ ml: 2 }} />
      </Typography>

      <Typography variant="body2" color="text.secondary">
        Asset ID: #{id}
      </Typography>

      <Paper sx={{ mt: 2, p: 2 }}>
        <Typography variant="subtitle1" fontWeight="bold">
          Details
        </Typography>
        <Typography variant="body2">Model: {dummyAsset.model}</Typography>
        <Typography variant="body2">
          Manufacturer: {dummyAsset.manufacturer}
        </Typography>
        <Typography variant="body2">
          Serial Number: {dummyAsset.serialNumber}
        </Typography>
        <Typography variant="body2">
          Assigned To: {dummyAsset.assignedTo}
        </Typography>
        <Typography variant="body2">
          Location: {dummyAsset.location}
        </Typography>
        <Typography variant="body2">Added: {dummyAsset.added}</Typography>
        <Typography variant="body2">
          Last Updated: {dummyAsset.updated}
        </Typography>
      </Paper>

      <Tabs value={tab} onChange={handleTabChange} sx={{ mt: 3 }}>
        <Tab label="Details" />
        <Tab label="History" />
        <Tab label="Related Items" />
        <Tab label="Comments" />
        <Tab label="Attachments" />
      </Tabs>

      <Box sx={{ mt: 2 }}>
        {tab === 0 && (
          <Typography variant="body2">[Details shown above]</Typography>
        )}
        {tab === 1 && (
          <Typography variant="body2">[Asset history timeline]</Typography>
        )}
        {tab === 2 && (
          <Typography variant="body2">[Linked items go here]</Typography>
        )}
        {tab === 3 && (
          <Typography variant="body2">[Comments section]</Typography>
        )}
        {tab === 4 && (
          <Typography variant="body2">[File attachments]</Typography>
        )}
      </Box>
    </Box>
  );
};

export default AssetDetail;
