
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
} from "@mui/material";

const ExportPreviewModal = ({
  open,
  onClose,
  onConfirm,
  exportTitle,
  setExportTitle,
  exportType,
  recordCount,
}) => {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Export Preview</DialogTitle>
      <DialogContent dividers>
        <TextField
          fullWidth
          label="Export Title"
          value={exportTitle}
          onChange={(e) => setExportTitle(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Typography variant="body2" color="text.secondary">
          {recordCount} incident records will be exported as <strong>{exportType.toUpperCase()}</strong>.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" onClick={onConfirm}>Download</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExportPreviewModal;
