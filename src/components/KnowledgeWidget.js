import React, { useEffect, useState } from "react";
import { Typography, List, ListItem, ListItemText, CircularProgress } from "@mui/material";
import { supabase } from "../supabaseClient";

const KnowledgeWidget = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTips = async () => {
      const { data } = await supabase
        .from("knowledge_base")
        .select("id, title")
        .order("created_at", { ascending: false })
        .limit(5);

      if (data) setArticles(data);
      setLoading(false);
    };

    fetchTips();
  }, []);

  if (loading) return <CircularProgress size={24} />;
  if (articles.length === 0) return <Typography>No tips found.</Typography>;

  return (
    <>
      <Typography variant="h6" gutterBottom>📚 Knowledge Base</Typography>
      <List dense>
        {articles.map((article) => (
          <ListItem key={article.id} disablePadding>
            <ListItemText primary={article.title} />
          </ListItem>
        ))}
      </List>
    </>
  );
};

export default KnowledgeWidget;
