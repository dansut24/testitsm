import React from "react";
import { Box, Typography, List, ListItem } from "@mui/material";

const Products = () => (
  <Box sx={{ p: 4 }}>
    <Typography variant="h4">Our Products</Typography>
    <List>
      <ListItem>ITSM Platform</ListItem>
      <ListItem>Remote Access (Hi5 Control)</ListItem>
      <ListItem>RMM Tools (Hi5 Manage)</ListItem>
    </List>
  </Box>
);

export default Products;
