import React from "react";
import { Box, Typography, Card, CardContent, List, ListItem, ListItemText, Divider, Button } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedItems = location.state?.selectedItems || [];

  const handleConfirm = () => {
    // Here you would normally send data to your backend.
    console.log("Confirmed request:", selectedItems);
    navigate("/self-service/confirmation");
  };

  if (selectedItems.length === 0) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h5" gutterBottom>
          No items in your request
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Please return to the Service Catalogue and add items to your request before checking out.
        </Typography>
        <Button variant="contained" onClick={() => navigate("/self-service/catalog")}>
          Back to Catalogue
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Please review your selections below before confirming your request.
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Card>
        <CardContent>
          <List>
            {selectedItems.map((item, index) => (
              <ListItem key={index} divider>
                <ListItemText
                  primary={item.title}
                  secondary={item.description}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Button
        variant="contained"
        color="primary"
        fullWidth
        sx={{ mt: 4, py: 1.5, fontWeight: "bold" }}
        onClick={handleConfirm}
      >
        Confirm Request
      </Button>
    </Box>
  );
};

export default Checkout;
