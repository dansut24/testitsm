// src/pages/KnowledgeBase.js

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Paper,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useNavigate } from "react-router-dom";

const categories = ["General", "Hardware", "Software", "Network", "Accounts"];

const sampleArticles = Array.from({ length: 12 }, (_, i) => ({
  id: i + 1,
  title: `Knowledge Article ${i + 1}`,
  summary: `This is a brief summary of the article content for Knowledge Article ${i + 1}.`,
  category: categories[i % categories.length],
}));

const KnowledgeBase = () => {
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);
  const navigate = useNavigate();

  const filteredArticles = sampleArticles.filter(
    (article) =>
      (tab === 0 || article.category === categories[tab - 1]) &&
      article.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box sx={{ width: "100%", px: 2, py: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Knowledge Base
      </Typography>

      <TextField
        fullWidth
        placeholder="Search articles..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        variant="outlined"
        size="small"
        sx={{ mb: 2 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon fontSize="small" />
            </InputAdornment>
          ),
        }}
      />

      <Tabs
        value={tab}
        onChange={(e, val) => setTab(val)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2 }}
      >
        <Tab label="All" />
        {categories.map((cat, i) => (
          <Tab key={i} label={cat} />
        ))}
      </Tabs>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filteredArticles.map((article) => (
          <Paper
            key={article.id}
            sx={{ p: 2, cursor: "pointer" }}
            onClick={() => navigate(`/knowledge-base/${article.id}`)}
          >
            <Typography variant="h6">{article.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              {article.summary}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Category: {article.category}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default KnowledgeBase;
