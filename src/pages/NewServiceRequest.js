import React from "react";
import { Box, Button, Typography, Paper, TextField } from "@mui/material";
import { useNavigate } from "react-router-dom";
import createServiceRequestWithTasks from "../utils/createServiceRequestWithTasks";

const NewServiceRequest = () => {
  const navigate = useNavigate();
  const [form, setForm] = React.useState({
    title: "",
    description: "",
    category: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    await createServiceRequestWithTasks(form);
    navigate("/service-requests");
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        New Service Request
      </Typography>

      <Paper sx={{ p: 3, maxWidth: 600 }}>
        <TextField
          name="title"
          label="Title"
          fullWidth
          value={form.title}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          name="description"
          label="Description"
          fullWidth
          multiline
          rows={4}
          value={form.description}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />
        <TextField
          name="category"
          label="Category"
          fullWidth
          value={form.category}
          onChange={handleChange}
          sx={{ mb: 2 }}
        />

        <Button variant="contained" onClick={handleSubmit}>
          Submit Request
        </Button>
      </Paper>
    </Box>
  );
};

export default NewServiceRequest;
