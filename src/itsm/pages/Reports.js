import React from "react";
import {
  Box,
  Typography,
  Paper,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Divider,
  Button,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";

const Reports = () => {
  const [reportType, setReportType] = React.useState("incident");

  const handleChange = (e) => {
    setReportType(e.target.value);
  };

  const generateReport = () => {
    // Placeholder: add real report export logic here
    alert(`Generating ${reportType} report...`);
  };

  return (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Reports
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          Generate Reports
        </Typography>

        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel id="report-select-label">Select Report Type</InputLabel>
          <Select
            labelId="report-select-label"
            value={reportType}
            label="Select Report Type"
            onChange={handleChange}
          >
            <MenuItem value="incident">Incident Summary</MenuItem>
            <MenuItem value="service">Service Request Summary</MenuItem>
            <MenuItem value="change">Change Request Overview</MenuItem>
            <MenuItem value="problem">Problem Trends</MenuItem>
            <MenuItem value="assets">Asset Inventory</MenuItem>
          </Select>
        </FormControl>

        <Divider sx={{ my: 2 }} />

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={generateReport}
        >
          Download Report
        </Button>
      </Paper>
    </Box>
  );
};

export default Reports;
