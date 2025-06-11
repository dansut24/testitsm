// src/pages/SelfService/KnowledgeBase.js

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ArticleIcon from "@mui/icons-material/Article";

const sampleArticles = [
  {
    title: "How to reset your password",
    summary: "Steps to securely reset your company account password.",
  },
  {
    title: "Connecting to the VPN",
    summary: "Instructions on how to connect to the company VPN from home.",
  },
  {
    title: "Requesting new software",
    summary: "Learn how to request and install approved software.",
  },
  {
    title: "Troubleshooting printer issues",
    summary: "Solutions for common office printer problems.",
  },
];

const KnowledgeBase = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredArticles = sampleArticles.filter((article) =>
    article.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom fontWeight={600}>
        Knowledge Base
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Search help articles and guides to troubleshoot common issues.
      </Typography>

      <TextField
        fullWidth
        placeholder="Search articles..."
        variant="outlined"
        size="small"
        sx={{ mb: 3 }}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Grid container spacing={2}>
        {filteredArticles.map((article, idx) => (
          <Grid item xs={12} md={6} key={idx}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <ArticleIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={500}>
                    {article.title}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  {article.summary}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
        {filteredArticles.length === 0 && (
          <Box p={2}>
            <Typography variant="body2" color="text.secondary">
              No articles found.
            </Typography>
          </Box>
        )}
      </Grid>
    </Box>
  );
};

export default KnowledgeBase;
